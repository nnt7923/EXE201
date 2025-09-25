'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Filter, Star, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'

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
  features: {
    wifi: boolean
    parking: boolean
    airConditioning: boolean
    outdoor: boolean
    petFriendly: boolean
    delivery: boolean
    takeaway: boolean
    cardPayment: boolean
  }
  tags: string[]
  distance?: number
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minPrice: 0,
    maxPrice: 1000000,
    rating: 0,
    features: [] as string[],
    sort: '-createdAt'
  })

  const categories = {
    restaurant: 'Nhà hàng',
    cafe: 'Cà phê',
    accommodation: 'Nhà trọ',
    entertainment: 'Giải trí',
    study: 'Học tập'
  }

  const subcategories = {
    restaurant: ['Cơm tấm', 'Phở', 'Bún bò Huế', 'Bún chả', 'Bánh mì', 'Chả cá', 'Lẩu', 'Nướng', 'Hải sản', 'Đồ chay'],
    cafe: ['Cà phê truyền thống', 'Cà phê hiện đại', 'Trà sữa', 'Sinh tố', 'Nước ép', 'Smoothie'],
    accommodation: ['Phòng trọ', 'Ký túc xá', 'Homestay', 'Khách sạn mini', 'Căn hộ cho thuê'],
    entertainment: ['Karaoke', 'Game center', 'Cinema', 'Bowling', 'Billiards', 'Escape room'],
    study: ['Thư viện', 'Cà phê học bài', 'Co-working space', 'Lớp học', 'Trung tâm ngoại ngữ']
  }

  const featureOptions = [
    { key: 'wifi', label: 'WiFi' },
    { key: 'parking', label: 'Chỗ đỗ xe' },
    { key: 'airConditioning', label: 'Điều hòa' },
    { key: 'outdoor', label: 'Ngoài trời' },
    { key: 'petFriendly', label: 'Thú cưng' },
    { key: 'delivery', label: 'Giao hàng' },
    { key: 'takeaway', label: 'Mang về' },
    { key: 'cardPayment', label: 'Thanh toán thẻ' }
  ]

  const searchPlaces = async () => {
    setLoading(true)
    try {
      const res = await api.getPlaces({
        search: searchQuery || undefined,
        category: filters.category || undefined,
        subcategory: filters.subcategory || undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 1000000 ? filters.maxPrice : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        features: filters.features.length > 0 ? filters.features : undefined,
        sort: filters.sort,
      })
      if (res?.success && (res as any).data?.places) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPlaces(((res as any).data.places) as Place[])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchPlaces()
  }, [filters])

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
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
                  placeholder="Tìm quán ăn, nhà trọ, cafe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Danh mục</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value, subcategory: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                      {Object.entries(categories).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Filter */}
                {filters.category && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Loại hình</label>
                    <Select value={filters.subcategory} onValueChange={(value) => setFilters(prev => ({ ...prev, subcategory: value === 'all' ? '' : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hình" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {subcategories[filters.category as keyof typeof subcategories]?.map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Giá: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={([min, max]) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0đ</span>
                      <span>1M+</span>
                    </div>
                  </div>
        </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Đánh giá tối thiểu</label>
                  <Select value={filters.rating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đánh giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tất cả</SelectItem>
                      <SelectItem value="1">1+ sao</SelectItem>
                      <SelectItem value="2">2+ sao</SelectItem>
                      <SelectItem value="3">3+ sao</SelectItem>
                      <SelectItem value="4">4+ sao</SelectItem>
                      <SelectItem value="5">5 sao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Features Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tính năng</label>
                  <div className="space-y-2">
                    {featureOptions.map((feature) => (
                      <div key={feature.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature.key}
                          checked={filters.features.includes(feature.key)}
                          onCheckedChange={() => handleFeatureToggle(feature.key)}
                        />
                        <label htmlFor={feature.key} className="text-sm">
                          {feature.label}
                        </label>
                      </div>
                    ))}
              </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sắp xếp</label>
                  <Select value={filters.sort} onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-createdAt">Mới nhất</SelectItem>
                      <SelectItem value="createdAt">Cũ nhất</SelectItem>
                      <SelectItem value="-rating">Đánh giá cao</SelectItem>
                      <SelectItem value="rating">Đánh giá thấp</SelectItem>
                      <SelectItem value="name">Tên A-Z</SelectItem>
                      <SelectItem value="-name">Tên Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
              </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${places.length} địa điểm`}
              </h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : places.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Không tìm thấy địa điểm nào</h3>
                    <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
              ) : (
                places.map((place) => (
                  <Card key={place._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-muted">
                          {place.images?.[0] ? (
                            <Image
                              src={place.images[0].url}
                              alt={place.images[0].alt || place.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {getCategoryIcon(place.category)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                                {place.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{place.address.ward}, {place.address.district}</span>
                                </div>
                                {place.distance && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{place.distance.toFixed(1)}km</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{place.rating.average.toFixed(1)}</span>
                                <span className="text-muted-foreground text-sm">({place.rating.count})</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                <span>
                                  {place.pricing.minPrice > 0 && formatPrice(place.pricing.minPrice)}
                                  {place.pricing.minPrice > 0 && place.pricing.maxPrice > place.pricing.minPrice && ' - '}
                                  {place.pricing.maxPrice > place.pricing.minPrice && formatPrice(place.pricing.maxPrice)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-2">
                              <Badge variant="secondary">{categories[place.category as keyof typeof categories]}</Badge>
                              <Badge variant="outline">{place.subcategory}</Badge>
                              {place.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>

                            <Link href={`/places/${place._id}`}>
                              <Button size="sm">Xem chi tiết</Button>
          </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}