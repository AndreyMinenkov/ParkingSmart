export interface User {
  id: number;
  phone: string;
  hasActiveParking: boolean;
  createdAt: string;
}

export interface Parking {
  id: number;
  isBlocking: boolean;
  expiresAt: string;
  createdAt: string;
  lat?: number;
  lon?: number;
}

export interface Blocker {
  id: number;
  encryptedPhone: string;
  phone: string; // реальный номер для tel:
  createdAt: string;
  hasBeenCalled: boolean;
  calledAt?: string;
  distanceMeters: number;
}

export interface Call {
  id: number;
  blockerId: number;
  callerId: number;
  calledAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  isNewUser: boolean;
  user: User;
}

export interface ParkingsResponse {
  success: boolean;
  parking: Parking;
}

export interface BlockersResponse {
  blockers: Blocker[];
}

export interface CallResponse {
  success: boolean;
  calledAt: string;
}
