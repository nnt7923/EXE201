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
        // Token is invalid or expired, force logout
        logout('session_expired');
        // We throw an error to prevent further processing in the calling function
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  async updateProfile(profileData: {
    name?: string
    phone?: string
    address?: string
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }) {
    return this.request('/auth/change-password', {
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
  } = {}) {
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

    return this.request(`/places?${searchParams.toString()}`)
  }

  async getPlace(id: string) {
    return this.request(`/places/${id}`)
  }

  async createPlace(placeData: any) {
    return this.request('/places', {
      method: 'POST',
      body: JSON.stringify(placeData),
    })
  }

  async updatePlace(id: string, placeData: any) {
    return this.request(`/places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(placeData),
    })
  }

  async deletePlace(id: string) {
    return this.request(`/places/${id}`, {
      method: 'DELETE',
    })
  }

  async addImageByUrl(id: string, imageUrl: string, alt: string) {
    return this.request(`/places/${id}/add-image-by-url`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl, alt }),
    })
  }

  async deletePlaceImage(placeId: string, imageId: string) {
    return this.request(`/places/${placeId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  async getPlaceReviews(placeId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/places/${placeId}/reviews?${searchParams.toString()}`)
  }

  async getCategories() {
    return this.request('/places/categories/list')
  }

  // Reviews endpoints
  async getReviews(params: {
    page?: number
    limit?: number
    place?: string
    user?: string
    rating?: number
    sort?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/reviews?${searchParams.toString()}`)
  }

  async getReview(id: string) {
    return this.request(`/reviews/${id}`)
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
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }

  async updateReview(id: string, reviewData: any) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    })
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleReviewHelpful(id: string) {
    return this.request(`/reviews/${id}/helpful`, {
      method: 'POST',
    })
  }

  async getUserReviews(userId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/reviews/user/${userId}?${searchParams.toString()}`)
  }

  // Users endpoints
  async getUsers(params: {
    page?: number
    limit?: number
    role?: string
    isActive?: boolean
    search?: string
    sort?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/users?${searchParams.toString()}`)
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  async getUserPlaces(userId: string, params: {
    page?: number
    limit?: number
    sort?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return this.request(`/users/${userId}/places?${searchParams.toString()}`)
  }

  async getUserStats() {
    return this.request('/users/stats/overview')
  }

  // Itinerary endpoints
  async getItineraries() {
    return this.request('/itineraries');
  }

  async getItinerary(id: string) {
    return this.request(`/itineraries/${id}`);
  }

  async createItinerary(itineraryData: any) {
    return this.request('/itineraries', {
      method: 'POST',
      body: JSON.stringify(itineraryData),
    });
  }

  async updateItinerary(id: string, itineraryData: any) {
    return this.request(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itineraryData),
    });
  }

  async deleteItinerary(id: string) {
    return this.request(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  }

  async getAiSuggestion(promptData: {
    location: string;
    budget: string;
    interests: string[];
    duration: number;
  }) {
    return this.request('/itineraries/ai-suggestion', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  }

  // Subscription endpoints
  async getPlans() {
    return this.request('/plans');
  }

  async getPlan(planId: string) {
    return this.request(`/plans/${planId}`);
  }

  async subscribeToPlan(planId: string) {
    return this.request('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getAllSubscriptions() {
    return this.request('/subscriptions');
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
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
