// API utility functions for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      if (response.status === 401) {
        logout('session_expired');
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json()

      if (!response.ok) {
        const error: any = new Error(
          data.msg || data.message || 'An API error occurred'
        );
        error.data = data; // Attach the JSON response from the server
        throw error;
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/me')
  }

  async updateProfile(profileData: {
    name?: string
    phone?: string
    address?: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }

  // Places endpoints
  async getPlaces(params: {
    page?: number
    limit?: number
    category?: string
    subcategory?: string
    minPrice?: number
    maxPrice?: number
    rating?: number
    search?: string
    lat?: number
    lng?: number
    radius?: number
    sort?: string
    features?: string[]
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return this.request<any>(`/places?${searchParams.toString()}`)
  }

  async getPlace(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/places/${id}`)
  }

  async createPlace(placeData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/places', {
      method: 'POST',
      body: JSON.stringify(placeData),
    })
  }

  async updatePlace(id: string, placeData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placeData),
    })
  }

  async deletePlace(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/places/${id}`, {
      method: 'DELETE',
    })
  }

  async addImageByUrl(id: string, imageUrl: string, alt: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/places/${id}/add-image-by-url`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl, alt }),
    })
  }

  async deletePlaceImage(placeId: string, imageId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/places/${placeId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  async getPlaceReviews(placeId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any>(`/places/${placeId}/reviews?${searchParams.toString()}`)
  }

  async getCategories(): Promise<ApiResponse<any>> {
    return this.request<any>('/places/categories/list')
  }

  // Reviews endpoints
  async getReviews(params: {
    page?: number
    limit?: number
    place?: string
    user?: string
    rating?: number
    sort?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any>(`/reviews?${searchParams.toString()}`)
  }

  async getReview(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}`)
  }

  async createReview(reviewData: {
    place: string
    rating: number
    title: string
    content: string
    visitDate: string
    visitType?: string
    pricePaid?: number
    groupSize?: number
    tags?: string[]
    aspects?: any
    images?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }

  async updateReview(id: string, reviewData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    })
  }

  async deleteReview(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleReviewHelpful(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}/helpful`, {
      method: 'POST',
    })
  }

  async getUserReviews(userId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any>(`/reviews/user/${userId}?${searchParams.toString()}`)
  }

  // Users endpoints
  async getUsers(params: {
    page?: number
    limit?: number
    role?: string
    isActive?: boolean
    search?: string
    sort?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any>(`/users?${searchParams.toString()}`)
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`)
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  async getUserPlaces(userId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<any>(`/users/${userId}/places?${searchParams.toString()}`)
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/stats/overview')
  }

  // Itinerary endpoints
  async getItineraries(): Promise<ApiResponse<any>> {
    return this.request<any>('/itineraries');
  }

  async getItinerary(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/itineraries/${id}`);
  }

  async createItinerary(itineraryData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/itineraries', {
      method: 'POST',
      body: JSON.stringify(itineraryData),
    });
  }

  async updateItinerary(id: string, itineraryData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itineraryData),
    });
  }

  async deleteItinerary(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  }

  async getAiSuggestion(promptData: {
    location: string;
    budget: string;
    interests: string[];
    duration: number;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/itineraries/ai-suggestion', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  }

  // Subscription endpoints
  async getPlans(): Promise<ApiResponse<any>> {
    return this.request<any>('/plans');
  }

  async getPlan(planId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/plans/${planId}`);
  }

  async subscribeToPlan(planId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getAllSubscriptions(): Promise<ApiResponse<any>> {
    return this.request<any>('/subscriptions');
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications')
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications/unread-count')
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST'
    })
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST'
    })
  }

  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/notifications/${id}`, {
      method: 'DELETE'
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/health')
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL)

// Export types
export type { ApiResponse }

// Utility functions
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const logout = (reason?: string): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  const reasonQuery = reason ? `?reason=${reason}` : ''
  window.location.href = `/auth/login${reasonQuery}`
}

export const setAuthData = (token: string, user: any): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
