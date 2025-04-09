export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Puppy {
  id: string;
  name: string;
  breed: string;
  age: number;
  notes?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  estimated_duration: number;
  created_at: string;
  updated_at: string;
}

export interface WaitingListEntry {
  id: string;
  owner_id: string;
  puppy_id: string;
  service_id: string;
  daily_list_id?: string;
  arrival_time: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
  owner?: Owner;
  puppy?: Puppy;
  service?: Service;
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