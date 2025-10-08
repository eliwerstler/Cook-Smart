// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string;
  bio?: string;
  totalStandards: number;
  avgBph: number;
  peakBph: number;
  lifetimeDrinks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalStandards: number;
  avgBph: number;
  peakBph: number;
  lifetimeDrinks: number;
  currentBph?: number;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  bph: number;
  coverPhotoId?: string;
  totalDrinks: number;
  totalStandards: number;
  createdAt: Date;
  updatedAt: Date;
}

// Drink Types
export interface Drink {
  id: string;
  userId: string;
  sessionId: string;
  photoUrl: string;
  caption?: string;
  drinkType: string;
  alcoholContent: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  likesCount: number;
  commentsCount: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrinkInput {
  photoUrl: string;
  caption?: string;
  drinkType: string;
  alcoholContent: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  createdById: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'member' | 'admin';
  joinedAt: Date;
}

// Friendship Types
export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Social Types
export interface Like {
  id: string;
  userId: string;
  drinkId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  drinkId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// BPH Calculation Types
export interface BphCalculation {
  bph: number;
  totalDrinks: number;
  totalStandards: number;
  duration: number; // in hours
}

// Feed Types
export interface FeedPost extends Drink {
  user: {
    id: string;
    username: string;
    profilePhoto?: string;
  };
  isLiked: boolean;
}

// WebSocket Event Types
export type SocketEvent =
  | { type: 'drink_posted'; data: Drink }
  | { type: 'bph_updated'; data: { userId: string; bph: number } }
  | { type: 'like_added'; data: Like }
  | { type: 'comment_added'; data: Comment };
