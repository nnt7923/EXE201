'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Clock, DollarSign, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('-createdAt')

  const categories = {
    restaurant: 'Nhà hàng',
    cafe: 'Cà phê',
    accommodation: 'Nhà trọ',
    entertainment: 'Giải trí',
    study: 'Học tập'
  }

  const featuredPlaces = [
    {
      id: '1',
      name: 'Phở Bò Hòa Lạc',
      category: 'restaurant',
      subcategory: 'Phở',
      rating: 4.5,
      price: '25,000 - 45,000đ',
      image: '/vietnamese-bun-bo-hue-restaurant.png',
      description: 'Phở bò ngon nhất khu vực Hòa Lạc'
    },
    {
      id: '2',
      name: 'Cafe Study Zone',
      category: 'cafe',
      subcategory: 'Cà phê học bài',
      rating: 4.8,
      price: '15,000 - 35,000đ',
      image: '/modern-study-cafe-with-students.png',
      description: 'Không gian học tập yên tĩnh với WiFi tốc độ cao'
    },
    {
      id: '3',
      name: 'Ký túc xá FPT',
      category: 'accommodation',
      subcategory: 'Ký túc xá',
      rating: 4.2,
      price: '2,000,000 - 3,500,000đ/tháng',
      image: '/modern-student-dormitory-room.png',
      description: 'Ký túc xá hiện đại cho sinh viên FPT'
    }
  ]

  useEffect(() => {
    fetchPlaces()
  }, [searchQuery, selectedCategory, sortBy])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockPlaces: Place[] = [
        {
          _id: '1',
          name: 'Phở Bò Hòa Lạc',
          description: 'Phở bò ngon nhất khu vực Hòa Lạc với nước dùng đậm đà',
          category: 'restaurant',
          subcategory: 'Phở',
          address: {
            street: '123 Đường Hòa Lạc',
            ward: 'Phường Hòa Lạc',
            district: 'Huyện Thạch Thất',
            city: 'Hà Nội'
          },
          pricing: { minPrice: 25000, maxPrice: 45000, currency: 'VND' },
          rating: { average: 4.5, count: 128 },
          images: [{ url: '/vietnamese-bun-bo-hue-restaurant.png', alt: 'Phở Bò', isMain: true }],
          tags: ['phở', 'bò', 'truyền thống']
        },
        {
          _id: '2',
          name: 'Cafe Study Zone',
          description: 'Không gian học tập yên tĩnh với WiFi tốc độ cao',
          category: 'cafe',
          subcategory: 'Cà phê học bài',
          address: {
            street: '456 Đường Hòa Lạc',
            ward: 'Phường Hòa Lạc',
            district: 'Huyện Thạch Thất',
            city: 'Hà Nội'
          },
          pricing: { minPrice: 15000, maxPrice: 35000, currency: 'VND' },
          rating: { average: 4.8, count: 95 },
          images: [{ url: '/modern-study-cafe-with-students.png', alt: 'Cafe Study', isMain: true }],
          tags: ['cafe', 'học bài', 'wifi']
        },
        {
          _id: '3',
          name: 'Ký túc xá FPT',
          description: 'Ký túc xá hiện đại cho sinh viên FPT',
          category: 'accommodation',
          subcategory: 'Ký túc xá',
          address: {
            street: '789 Đường Hòa Lạc',
            ward: 'Phường Hòa Lạc',
            district: 'Huyện Thạch Thất',
            city: 'Hà Nội'
          },
          pricing: { minPrice: 2000000, maxPrice: 3500000, currency: 'VND' },
          rating: { average: 4.2, count: 67 },
          images: [{ url: '/modern-student-dormitory-room.png', alt: 'Ký túc xá', isMain: true }],
          tags: ['ký túc xá', 'sinh viên', 'fpt']
        }
      ]

      // Filter mock data
      let filteredPlaces = mockPlaces

      if (searchQuery) {
        filteredPlaces = filteredPlaces.filter(place =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      if (selectedCategory) {
        filteredPlaces = filteredPlaces.filter(place => place.category === selectedCategory)
      }

      setPlaces(filteredPlaces)
    } catch (error) {
      console.error('Fetch places error:', error)
    } finally {
      setLoading(false)
    }
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
                />
              </div>
            </div>

            <Link href="/search">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Tìm kiếm nâng cao
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Featured Places */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Địa điểm nổi bật</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPlaces.map((place) => (
                <Card key={place.id} className="hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-background/80">
                        {categories[place.category as keyof typeof categories]}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{place.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{place.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* All Places */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tất cả địa điểm</h2>
              <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {Object.entries(categories).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
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
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
                ))}
              </div>
            ) : places.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Không tìm thấy địa điểm nào</h3>
                  <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
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
                              {place.tags.slice(0, 1).map((tag) => (
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
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
