// Shared type definitions for the frontend application

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  aiSuggestionLimit: number;
  duration?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'owner';
  isActive?: boolean;
  subscriptionPlan?: SubscriptionPlan;
  aiSuggestionsUsed?: number;
  subscriptionEndDate?: string;
  preferences?: {
    favoriteCategories: string[];
    budget: {
      min: number;
      max: number;
    };
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Place {
  _id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
  };
  pricing?: {
    minPrice: number;
    maxPrice: number;
    currency: string;
  };
  features?: {
    wifi: boolean;
    parking: boolean;
    airConditioning: boolean;
    outdoor: boolean;
    petFriendly: boolean;
    delivery: boolean;
    takeaway: boolean;
    cardPayment: boolean;
  };
  images?: Array<{
    _id?: string;
    url: string;
    alt: string;
    isMain?: boolean;
  }>;
  operatingHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
  rating?: {
    average: number;
    count: number;
  };
  tags?: string[];
  distance?: number;
  viewCount?: number;
  createdBy?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  recentReviews?: Array<{
    _id: string;
    rating: number;
    title: string;
    content: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  amount: number;
  currency: string;
  bankTransferInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferAmount: number;
    transferDate: string;
    transferNote?: string;
    transferReference?: string;
  };
  proofOfPayment: string;
  status: 'pending' | 'confirmed' | 'rejected';
  adminNotes?: string;
  confirmedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  confirmedAt?: string;
  rejectedAt?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'payment_confirmed' | 'payment_rejected' | 'subscription_expired' | 'subscription_expiring';
  title: string;
  message: string;
  data?: {
    paymentId?: string;
    subscriptionPlan?: {
      name: string;
      price: number;
    };
    subscriptionEndDate?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AiPrompt {
  location: string;
  budget: 'LOW' | 'MEDIUM' | 'HIGH';
  interests: string[];
  duration: number;
}