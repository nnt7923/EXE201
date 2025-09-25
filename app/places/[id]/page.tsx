'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Star, Clock, Phone, Globe, Facebook, Instagram, DollarSign, Wifi, Car, Wind, Sun, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    coordinates: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone?: string
    email?: string
    website?: string
    facebook?: string
    instagram?: string
  }
  pricing: {
    minPrice: number
    maxPrice: number
    currency: string
  }
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
  images: Array<{
    url: string
    alt: string
    isMain: boolean
  }>
  operatingHours: Array<{
    day: string
    open: string
    close: string
    isClosed: boolean
  }>
  rating: {
    average: number
    count: number
  }
  tags: string[]
  viewCount: number
  createdBy: {
    _id: string
    name: string
    avatar: string
  }
  recentReviews: Array<{
    _id: string
    rating: number
    title: string
    content: string
    user: {
      _id: string
      name: string
      avatar: string
    }
    createdAt: string
  }>
}

export default function PlaceDetailPage() {
  const params = useParams()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const categories = {
    restaurant: 'Nhà hàng',
    cafe: 'Cà phê',
    accommodation: 'Nhà trọ',
    entertainment: 'Giải trí',
    study: 'Học tập'
  }

  const days = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật'
  }

  const featureIcons = {
    wifi: Wifi,
    parking: Car,
    airConditioning: Wind,
    outdoor: Sun,
    petFriendly: Heart,
    delivery: MessageCircle,
    takeaway: MessageCircle,
    cardPayment: DollarSign
  }

  const featureLabels = {
    wifi: 'WiFi miễn phí',
    parking: 'Chỗ đỗ xe',
    airConditioning: 'Điều hòa',
    outdoor: 'Khu vực ngoài trời',
    petFriendly: 'Cho phép thú cưng',
    delivery: 'Giao hàng',
    takeaway: 'Mang về',
    cardPayment: 'Thanh toán thẻ'
  }

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        // Mock data for demonstration
        const mockPlace: Place = {
          _id: params.id as string,
          name: 'Phở Bò Hòa Lạc',
          description: 'Phở bò ngon nhất khu vực Hòa Lạc với nước dùng đậm đà, thịt bò tươi ngon và bánh phở dai giòn. Quán có không gian rộng rãi, thoáng mát và phục vụ nhiệt tình.',
          category: 'restaurant',
          subcategory: 'Phở',
          address: {
            street: '123 Đường Hòa Lạc',
            ward: 'Phường Hòa Lạc',
            district: 'Huyện Thạch Thất',
            city: 'Hà Nội',
            coordinates: { lat: 21.0285, lng: 105.8542 }
          },
          contact: {
            phone: '0123456789',
            email: 'phobohoa@gmail.com',
            website: 'https://phobohoa.com',
            facebook: 'https://facebook.com/phobohoa',
            instagram: 'https://instagram.com/phobohoa'
          },
          pricing: { minPrice: 25000, maxPrice: 45000, currency: 'VND' },
          features: {
            wifi: true,
            parking: true,
            airConditioning: true,
            outdoor: false,
            petFriendly: false,
            delivery: true,
            takeaway: true,
            cardPayment: true
          },
          images: [
            { url: '/vietnamese-bun-bo-hue-restaurant.png', alt: 'Phở Bò', isMain: true },
            { url: '/vietnamese-bun-bo-hue-restaurant.png', alt: 'Nội thất quán', isMain: false },
            { url: '/vietnamese-bun-bo-hue-restaurant.png', alt: 'Món ăn', isMain: false }
          ],
          operatingHours: [
            { day: 'monday', open: '06:00', close: '22:00', isClosed: false },
            { day: 'tuesday', open: '06:00', close: '22:00', isClosed: false },
            { day: 'wednesday', open: '06:00', close: '22:00', isClosed: false },
            { day: 'thursday', open: '06:00', close: '22:00', isClosed: false },
            { day: 'friday', open: '06:00', close: '22:00', isClosed: false },
            { day: 'saturday', open: '06:00', close: '23:00', isClosed: false },
            { day: 'sunday', open: '06:00', close: '23:00', isClosed: false }
          ],
          rating: { average: 4.5, count: 128 },
          tags: ['phở', 'bò', 'truyền thống', 'ngon', 'rẻ'],
          viewCount: 1250,
          createdBy: {
            _id: '1',
            name: 'Nguyễn Văn A',
            avatar: '/placeholder-user.jpg'
          },
          recentReviews: [
            {
              _id: '1',
              rating: 5,
              title: 'Phở rất ngon!',
              content: 'Nước dùng đậm đà, thịt bò tươi ngon. Sẽ quay lại!',
              user: { _id: '1', name: 'Nguyễn Thị B', avatar: '/placeholder-user.jpg' },
              createdAt: '2024-01-15T10:30:00Z'
            },
            {
              _id: '2',
              rating: 4,
              title: 'Tốt nhưng hơi đông',
              content: 'Món ăn ngon nhưng quán hơi đông, phải chờ lâu.',
              user: { _id: '2', name: 'Trần Văn C', avatar: '/placeholder-user.jpg' },
              createdAt: '2024-01-14T15:20:00Z'
            }
          ]
        }

        setPlace(mockPlace)
      } catch (error) {
        console.error('Fetch place error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlace()
    }
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  const isOpenNow = () => {
    if (!place?.operatingHours) return null
    
    const currentDay = getCurrentDay()
    const todayHours = place.operatingHours.find(h => h.day === currentDay)
    
    if (!todayHours || todayHours.isClosed) return false
    
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))
    
    return currentTime >= openTime && currentTime <= closeTime
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy địa điểm</h1>
          <Link href="/search">
            <Button>Quay lại tìm kiếm</Button>
          </Link>
        </div>
      </div>
    )
  }

  const mainImage = place.images.find(img => img.isMain) || place.images[0]
  const otherImages = place.images.filter(img => !img.isMain)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ĂG</span>
              </div>
              <h1 className="text-xl font-bold">Ăn Gì Ở Đâu</h1>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="sm">← Quay lại tìm kiếm</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Place Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{place.rating.average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({place.rating.count} đánh giá)</span>
                  </div>
                  <Badge variant="secondary">{categories[place.category as keyof typeof categories]}</Badge>
                  <Badge variant="outline">{place.subcategory}</Badge>
                  {isOpenNow() !== null && (
                    <Badge variant={isOpenNow() ? "default" : "destructive"}>
                      {isOpenNow() ? "Đang mở" : "Đã đóng"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{place.address.street}, {place.address.ward}, {place.address.district}, {place.address.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Yêu thích
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>

            {/* Price Range */}
            {place.pricing.minPrice > 0 && (
              <div className="flex items-center gap-1 text-lg font-medium">
                <DollarSign className="w-5 h-5" />
                <span>
                  {formatPrice(place.pricing.minPrice)}
                  {place.pricing.maxPrice > place.pricing.minPrice && ` - ${formatPrice(place.pricing.maxPrice)}`}
                </span>
              </div>
            )}
          </div>

          {/* Images */}
          {place.images.length > 0 && (
            <div className="space-y-4">
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-muted">
                {mainImage && (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt || place.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              
              {otherImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {otherImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-20 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setActiveImageIndex(index + 1)}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                  <TabsTrigger value="photos">Hình ảnh</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Mô tả</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{place.description}</p>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tính năng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(place.features).map(([key, value]) => {
                          if (!value) return null
                          const Icon = featureIcons[key as keyof typeof featureIcons]
                          return (
                            <div key={key} className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm">{featureLabels[key as keyof typeof featureLabels]}</span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {place.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {place.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {place.recentReviews.length > 0 ? (
                    place.recentReviews.map((review) => (
                      <Card key={review._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={review.user.avatar} />
                              <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.user.name}</span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <h4 className="font-medium mb-2">{review.title}</h4>
                              <p className="text-muted-foreground text-sm">{review.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-muted-foreground">Hãy là người đầu tiên đánh giá địa điểm này!</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                  {place.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {place.images.map((image, index) => (
                        <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={image.url}
                            alt={image.alt || place.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-4xl mb-4">📷</div>
                        <h3 className="text-lg font-medium mb-2">Chưa có hình ảnh</h3>
                        <p className="text-muted-foreground">Hình ảnh sẽ được cập nhật sớm!</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {place.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${place.contact.phone}`} className="text-sm hover:underline">
                        {place.contact.phone}
                      </a>
                    </div>
                  )}
                  {place.contact.email && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <a href={`mailto:${place.contact.email}`} className="text-sm hover:underline">
                        {place.contact.email}
                      </a>
                    </div>
                  )}
                  {place.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <a href={place.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  {place.contact.facebook && (
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-primary" />
                      <a href={place.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        Facebook
                      </a>
                    </div>
                  )}
                  {place.contact.instagram && (
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-primary" />
                      <a href={place.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                        Instagram
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operating Hours */}
              {place.operatingHours.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Giờ mở cửa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {place.operatingHours.map((hours) => (
                        <div key={hours.day} className="flex justify-between text-sm">
                          <span>{days[hours.day as keyof typeof days]}</span>
                          <span className={hours.isClosed ? 'text-muted-foreground' : ''}>
                            {hours.isClosed ? 'Đóng cửa' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Vị trí</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Bản đồ sẽ được hiển thị ở đây</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Viết đánh giá
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Thêm vào yêu thích
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
