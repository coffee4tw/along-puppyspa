export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Puppy {
  id: string;
  name: string;
  breed: string;
  age: number;
  ownerId: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in minutes
}

export interface WaitingListEntry {
  id: string;
  ownerId: string;
  puppyId: string;
  serviceId: string;
  arrivalTime: string; // ISO date string
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: string; // ISO date string
  position: number;
}

export interface DailyWaitingList {
  id: string;
  date: string; // ISO date string
  entries: WaitingListEntry[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 