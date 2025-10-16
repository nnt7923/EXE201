'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Star, Clock, Phone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import BookingForm from '@/components/booking/booking-form'
import { toast } from '@/hooks/use-toast'

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
  contact?: {
    phone?: string
    email?: string
    website?: string
    facebook?: string
    instagram?: string
  }
  pricing: {
    minPrice?: number
    maxPrice?: number
    currency?: string
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
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const placeId = params.placeId as string
  
  const [place, setPlace] = useState<Place | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setIsLoading(true)
        const response = await api.getPlace(placeId)
        
        if (response.success) {
          setPlace(response.data.place)
        } else {
          setError('Không thể tải thông tin địa điểm')
        }
      } catch (error: any) {
        console.error('Fetch place error:', error)
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin địa điểm')
      } finally {
        setIsLoading(false)
      }
    }

    if (placeId) {
      fetchPlace()
    }
  }, [placeId])

  const handleBookingSuccess = (bookingId: string) => {
    toast({
      title: 'Đặt phòng thành công!',
      description: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
    })
    router.push('/orders')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Place Info Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Booking Form Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Có lỗi xảy ra</h1>
          <p className="text-muted-foreground mb-6">{error || 'Không tìm thấy địa điểm'}</p>
          <Button asChild>
            <Link href="/places">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách địa điểm
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const mainImage = place.images.find(img => img.isMain) || place.images[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/places/${placeId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại thông tin địa điểm
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Đặt phòng tại {place.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{place.address.street}, {place.address.ward}, {place.address.district}</span>
            </div>
            {place.rating.count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{place.rating.average.toFixed(1)} ({place.rating.count} đánh giá)</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Place Information */}
          <div className="space-y-6">
            {/* Main Image */}
            {mainImage && (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Place Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Thông tin địa điểm</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Mô tả</h4>
                    <p className="text-muted-foreground">{place.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Danh mục</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{place.category}</Badge>
                      {place.subcategory && (
                        <Badge variant="outline">{place.subcategory}</Badge>
                      )}
                    </div>
                  </div>

                  {place.pricing && (place.pricing.minPrice || place.pricing.maxPrice) && (
                    <div>
                      <h4 className="font-medium mb-2">Giá phòng</h4>
                      <div className="text-lg font-semibold text-primary">
                        {place.pricing.minPrice && place.pricing.maxPrice ? (
                          `${place.pricing.minPrice.toLocaleString()} - ${place.pricing.maxPrice.toLocaleString()} ${place.pricing.currency || 'VND'}/đêm`
                        ) : place.pricing.minPrice ? (
                          `Từ ${place.pricing.minPrice.toLocaleString()} ${place.pricing.currency || 'VND'}/đêm`
                        ) : place.pricing.maxPrice ? (
                          `Tối đa ${place.pricing.maxPrice.toLocaleString()} ${place.pricing.currency || 'VND'}/đêm`
                        ) : (
                          'Liên hệ để biết giá'
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {place.contact && (place.contact.phone || place.contact.website) && (
                    <div>
                      <h4 className="font-medium mb-2">Liên hệ</h4>
                      <div className="space-y-2">
                        {place.contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{place.contact.phone}</span>
                          </div>
                        )}
                        {place.contact.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a 
                              href={place.contact.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {place.operatingHours.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Giờ hoạt động</h4>
                      <div className="space-y-1 text-sm">
                        {place.operatingHours.map((hour, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{hour.day}:</span>
                            <span>
                              {hour.isClosed ? 'Đóng cửa' : `${hour.open} - ${hour.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {Object.values(place.features).some(Boolean) && (
                    <div>
                      <h4 className="font-medium mb-2">Tiện ích</h4>
                      <div className="flex flex-wrap gap-2">
                        {place.features.wifi && <Badge variant="outline">WiFi</Badge>}
                        {place.features.parking && <Badge variant="outline">Bãi đỗ xe</Badge>}
                        {place.features.airConditioning && <Badge variant="outline">Điều hòa</Badge>}
                        {place.features.outdoor && <Badge variant="outline">Khu vực ngoài trời</Badge>}
                        {place.features.petFriendly && <Badge variant="outline">Thân thiện với thú cưng</Badge>}
                        {place.features.cardPayment && <Badge variant="outline">Thanh toán thẻ</Badge>}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <BookingForm 
              place={place} 
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  )
}