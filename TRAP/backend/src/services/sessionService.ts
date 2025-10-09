import prisma from '../utils/prisma';

export const sessionService = {
  /**
   * Get or create active session for user
   * Sessions auto-end at 6 AM the next day
   */
  async getOrCreateActiveSession(userId: string) {
    // Check for active session
    const now = new Date();

    // Calculate 6 AM today
    const sixAmToday = new Date();
    sixAmToday.setHours(6, 0, 0, 0);

    // If it's before 6 AM, check sessions from yesterday after 6 AM
    // If it's after 6 AM, check sessions from today after 6 AM
    const sessionCutoff = now < sixAmToday
      ? new Date(sixAmToday.getTime() - 24 * 60 * 60 * 1000) // Yesterday 6 AM
      : sixAmToday; // Today 6 AM

    // Find active session (started after cutoff, no end time)
    let session = await prisma.session.findFirst({
      where: {
        userId,
        startTime: {
          gte: sessionCutoff,
        },
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Create new session if none exists
    if (!session) {
      session = await prisma.session.create({
        data: {
          userId,
          startTime: now,
        },
      });
    }

    return session;
  },

  /**
   * End a session and calculate final BPH
   */
  async endSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        drinks: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session || session.endTime) {
      throw new Error('Session not found or already ended');
    }

    // Calculate final BPH
    const drinks = session.drinks;
    if (drinks.length === 0) {
      // No drinks, just end the session
      return await prisma.session.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
        },
      });
    }

    const firstDrink = drinks[0];
    const lastDrink = drinks[drinks.length - 1];
    const totalStandards = drinks.reduce((sum, d) => sum + d.alcoholContent, 0);

    // Calculate duration between first and last drink
    const durationMs = lastDrink.timestamp.getTime() - firstDrink.timestamp.getTime();
    const durationHours = Math.max(durationMs / (1000 * 60 * 60), 1);

    const finalBph = totalStandards / durationHours;

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime: lastDrink.timestamp,
        bph: finalBph,
        totalStandards,
        totalDrinks: drinks.length,
      },
    });

    // Update user statistics
    await this.updateUserStats(session.userId);

    return updatedSession;
  },

  /**
   * Update session BPH and totals
   */
  async updateSessionStats(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        drinks: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) throw new Error('Session not found');

    const drinks = session.drinks;
    const totalStandards = drinks.reduce((sum, d) => sum + d.alcoholContent, 0);
    const totalDrinks = drinks.length;

    // Calculate live BPH (whole hours from session start)
    const now = new Date();
    const durationMs = now.getTime() - session.startTime.getTime();
    const wholeHours = Math.floor(durationMs / (1000 * 60 * 60));
    const bph = wholeHours >= 1 ? totalStandards / wholeHours : totalStandards;

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        bph,
        totalStandards,
        totalDrinks,
      },
    });
  },

  /**
   * Update user's lifetime statistics
   */
  async updateUserStats(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        endTime: { not: null }, // Only completed sessions
      },
    });

    const totalDrinks = await prisma.drink.count({ where: { userId } });
    const totalStandards = await prisma.drink.aggregate({
      where: { userId },
      _sum: { alcoholContent: true },
    });

    const avgBph =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.bph, 0) / sessions.length
        : 0;

    const peakBph = sessions.length > 0 ? Math.max(...sessions.map((s) => s.bph)) : 0;

    await prisma.user.update({
      where: { id: userId },
      data: {
        lifetimeDrinks: totalDrinks,
        totalStandards: totalStandards._sum.alcoholContent || 0,
        avgBph,
        peakBph,
      },
    });
  },

  /**
   * Get user's sessions
   */
  async getUserSessions(userId: string, limit: number = 20) {
    return await prisma.session.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        drinks: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Get cover photo
        },
      },
    });
  },
};
