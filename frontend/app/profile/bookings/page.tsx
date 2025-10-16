'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Users, Clock, Star, MessageCircle, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'

interface Booking {
  _id: string
  bookingNumber: string
  place: {
    _id: string
    name: string
    images: Array<{
      url: string
      alt: string
      isMain: boolean
    }>
    address: {
      street: string
      ward: string
      district: string
      city: string
    }
  }
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  numberOfRooms: number
  bookingType: 'hourly' | 'daily' | 'monthly'
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  specialRequests?: string
  createdAt: string
  review?: {
    _id: string
    rating: number
    title: string
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800'
}

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành'
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const paymentStatusLabels = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại'
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.getUserBookings()
      setBookings(response.data?.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đặt phòng',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.cancelBooking(bookingId)
      toast({
        title: 'Thành công',
        description: 'Đã hủy đặt phòng thành công'
      })
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy đặt phòng',
        variant: 'destructive'
      })
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true
    if (activeTab === 'upcoming') return booking.status === 'confirmed' || booking.status === 'pending'
    if (activeTab === 'completed') return booking.status === 'completed'
    if (activeTab === 'cancelled') return booking.status === 'cancelled'
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Đặt phòng của tôi</h1>
        <p className="text-muted-foreground">Quản lý tất cả các đặt phòng của bạn</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có đặt phòng nào</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'all' 
                ? 'Bạn chưa có đặt phòng nào. Hãy khám phá các địa điểm thú vị!'
                : `Không có đặt phòng nào trong danh mục "${activeTab === 'upcoming' ? 'Sắp tới' : activeTab === 'completed' ? 'Hoàn thành' : 'Đã hủy'}"`
              }
            </p>
            <Link href="/search">
              <Button>Khám phá địa điểm</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Image */}
                  <div className="w-32 h-32 relative flex-shrink-0">
                    <Image
                      src={booking.place.images.find(img => img.isMain)?.url || '/placeholder.jpg'}
                      alt={booking.place.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          <Link 
                            href={`/places/${booking.place._id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {booking.place.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.place.address.street}, {booking.place.address.ward}, {booking.place.address.district}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mã đặt phòng: <span className="font-mono">{booking.bookingNumber}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                        <Badge variant="outline" className={paymentStatusColors[booking.paymentStatus]}>
                          {paymentStatusLabels[booking.paymentStatus]}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Check-in</p>
                          <p className="text-muted-foreground">{formatDate(booking.checkInDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Check-out</p>
                          <p className="text-muted-foreground">{formatDate(booking.checkOutDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Khách</p>
                          <p className="text-muted-foreground">{booking.numberOfGuests} người</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Loại</p>
                          <p className="text-muted-foreground">
                            {booking.bookingType === 'hourly' ? 'Theo giờ' : 
                             booking.bookingType === 'daily' ? 'Theo ngày' : 'Theo tháng'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold">{formatPrice(booking.totalPrice)}</p>
                        <p className="text-sm text-muted-foreground">
                          Đặt ngày {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {booking.status === 'completed' && !booking.review && (
                          <Link href={`/places/${booking.place._id}?write-review=true&booking=${booking._id}`}>
                            <Button size="sm" variant="outline">
                              <Star className="w-4 h-4 mr-1" />
                              Viết đánh giá
                            </Button>
                          </Link>
                        )}
                        {booking.review && (
                          <Link href={`/reviews/${booking.review._id}`}>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Xem đánh giá
                            </Button>
                          </Link>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Hủy đặt phòng
                          </Button>
                        )}
                        <Link href={`/booking/${booking.place._id}/${booking._id}`}>
                          <Button size="sm" variant="outline">
                            Chi tiết
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}