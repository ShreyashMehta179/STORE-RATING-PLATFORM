export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    ratings: number;
    ownedStores: number;
  };
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  description: string;
  category: string;
  phone: string;
  website?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  ratingAvg: number;
  ratingCount: number;
  userRating?: number | null;
  userReview?: string | null;
  userRatingId?: string | null;
  isFavorite?: boolean;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  ratings?: Rating[];
}

export interface Rating {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  storeId: string;
  store?: {
    id: string;
    name: string;
    category: string;
    address?: string;
    imageUrl?: string;
  };
  rating: number;
  review?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
