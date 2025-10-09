/**
 * BPH (Beers Per Hour) Calculator
 * Calculates drinking rate based on standard drinks and time
 */

export interface BphCalculation {
  bph: number;
  totalStandards: number;
  totalDrinks: number;
  durationHours: number;
}

/**
 * Calculate BPH from a list of drinks with timestamps
 */
export function calculateBPH(
  drinks: Array<{ alcoholContent: number; timestamp: Date }>,
  sessionStartTime?: Date
): BphCalculation {
  if (drinks.length === 0) {
    return {
      bph: 0,
      totalStandards: 0,
      totalDrinks: 0,
      durationHours: 0,
    };
  }

  // Calculate total standards
  const totalStandards = drinks.reduce((sum, drink) => sum + drink.alcoholContent, 0);
  const totalDrinks = drinks.length;

  // Determine time range
  const timestamps = drinks.map((d) => d.timestamp.getTime());
  const firstDrinkTime = sessionStartTime?.getTime() || Math.min(...timestamps);
  const lastDrinkTime = Math.max(...timestamps);

  // Calculate duration in hours
  const durationMs = lastDrinkTime - firstDrinkTime;
  const durationHours = Math.max(durationMs / (1000 * 60 * 60), 1); // Minimum 1 hour

  // Calculate BPH (round to 1 decimal place)
  const bph = Math.round((totalStandards / durationHours) * 10) / 10;

  return {
    bph,
    totalStandards,
    totalDrinks,
    durationHours: Math.round(durationHours * 10) / 10,
  };
}

/**
 * Calculate live BPH (for current session)
 * Uses whole hour calculation (2 beers in 10 mins = 2 BPH, not 12)
 */
export function calculateLiveBPH(
  drinks: Array<{ alcoholContent: number; timestamp: Date }>,
  sessionStartTime: Date
): number {
  if (drinks.length === 0) return 0;

  const totalStandards = drinks.reduce((sum, drink) => sum + drink.alcoholContent, 0);

  // Calculate whole hours elapsed
  const now = new Date();
  const durationMs = now.getTime() - sessionStartTime.getTime();
  const wholeHours = Math.floor(durationMs / (1000 * 60 * 60));

  // If less than 1 hour, show total standards (not extrapolated)
  if (wholeHours < 1) {
    return Math.round(totalStandards * 10) / 10;
  }

  // Calculate BPH based on whole hours
  const bph = totalStandards / wholeHours;
  return Math.round(bph * 10) / 10;
}

/**
 * Calculate session BPH (final calculation)
 * Based on time between first and last drink
 */
export function calculateSessionBPH(
  drinks: Array<{ alcoholContent: number; timestamp: Date }>
): number {
  if (drinks.length === 0) return 0;
  if (drinks.length === 1) return drinks[0].alcoholContent;

  const result = calculateBPH(drinks);
  return result.bph;
}

/**
 * Format BPH for display
 */
export function formatBPH(bph: number): string {
  return bph.toFixed(1);
}

/**
 * Check if session should auto-end
 * Sessions end at 6 AM the following day
 */
export function shouldEndSession(sessionStartTime: Date): boolean {
  const now = new Date();
  const sessionDate = new Date(sessionStartTime);

  // Get 6 AM of the day after session started
  const endTime = new Date(sessionDate);
  endTime.setDate(endTime.getDate() + 1);
  endTime.setHours(6, 0, 0, 0);

  return now >= endTime;
}

/**
 * Get session end time (6 AM next day)
 */
export function getSessionEndTime(sessionStartTime: Date): Date {
  const endTime = new Date(sessionStartTime);
  endTime.setDate(endTime.getDate() + 1);
  endTime.setHours(6, 0, 0, 0);
  return endTime;
}
