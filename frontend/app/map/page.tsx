'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { api } from '@/lib/api'
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false })
import Image from 'next/image'
import Link from 'next/link'

interface Place {
  _id: string
  name: string
  description: string
  category: string
  subcategory: string
  address: {
    street: string
    ward: string
    district: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  pricing: {
    minPrice: number
    maxPrice: number
    currency: string
  }
  rating: {
    average: number
    count: number
  }
  images: Array<{
    url: string
    alt: string
    isMain: boolean
  }>
  tags: string[]
  distance?: number
}

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const categories = {
    restaurant: 'Nhà hàng',
    cafe: 'Cà phê',
    accommodation: 'Nhà trọ',
    entertainment: 'Giải trí',
    study: 'Học tập'
  }

  useEffect(() => {
    fetchPlaces()
  }, [])

  useEffect(() => {
    filterPlaces()
  }, [places, searchQuery, selectedCategory])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const res = await api.getPlaces({ limit: 50, sort: '-createdAt' })
      if (res?.success && (res as any).data?.places) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPlaces(((res as any).data.places) as Place[])
      }
    } catch (error) {
      console.error('Fetch places error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPlaces = () => {
    let filtered = places

    if (searchQuery) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(place => place.category === selectedCategory)
    }

    setFilteredPlaces(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant': return '🍜'
      case 'cafe': return '☕'
      case 'accommodation': return '🏠'
      case 'entertainment': return '🎉'
      case 'study': return '📚'
      default: return '📍'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ĂG</span>
              </div>
              <h1 className="text-xl font-bold">Ăn Gì Ở Đâu</h1>
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm trên bản đồ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-80 bg-background border-r transition-all duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:block`}>
          <div className="p-4 space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Danh mục</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      {Object.entries(categories).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Places List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Địa điểm ({filteredPlaces.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPlaces.length === 0 ? (
                    <div className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Không tìm thấy địa điểm</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredPlaces.map((place) => (
                        <div
                          key={place._id}
                          className={`p-3 cursor-pointer hover:bg-muted transition-colors border-b last:border-b-0 ${
                            selectedPlace?._id === place._id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedPlace(place)}
                        >
                          <div className="flex gap-3">
                            <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {place.images?.[0] ? (
                                <Image
                                  src={place.images[0].url}
                                  alt={place.images[0].alt || place.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">
                                  {getCategoryIcon(place.category)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{place.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {place.address.ward}, {place.address.district}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{place.rating.average.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {place.pricing.minPrice > 0 && formatPrice(place.pricing.minPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Đang tải bản đồ...</p>
              </div>
            </div>
          ) : <LeafletMap />}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}