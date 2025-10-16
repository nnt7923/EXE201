'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CreditCard, 
  Phone, 
  Mail, 
  User,
  Star,
  MessageCircle,
  X,
  ArrowLeft,
  Download
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'

interface BookingDetail {
  _id: string
  bookingNumber: string
  place: {
    _id: string
    name: string
    description: string
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
    contact: {
      phone?: string
      email?: string
    }
    pricing: {
      minPrice: number
      maxPrice: number
      currency: string
    }
  }
  user: {
    _id: string
    name: string
    email: string
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
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  createdAt: string
  updatedAt: string
  review?: {
    _id: string
    rating: number
    title: string
    content: string
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

export default function BookingDetailPage() {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail()
    }
  }, [bookingId])

  const fetchBookingDetail = async () => {
    try {
      setLoading(true)
      const response = await api.getBooking(bookingId)
      setBooking(response.data)
    } catch (error) {
      console.error('Error fetching booking detail:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin đặt phòng',
        variant: 'destructive'
      })
      router.push('/profile/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!booking) return
    
    try {
      await api.cancelBooking(booking._id)
      toast({
        title: 'Thành công',
        description: 'Đã hủy đặt phòng thành công'
      })
      fetchBookingDetail()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy đặt phòng',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const calculateDuration = () => {
    if (!booking) return ''
    
    const checkIn = new Date(booking.checkInDate)
    const checkOut = new Date(booking.checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    
    if (booking.bookingType === 'hourly') {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      return `${diffHours} giờ`
    } else if (booking.bookingType === 'daily') {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} ngày`
    } else {
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
      return `${diffMonths} tháng`
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy đặt phòng</h3>
            <p className="text-muted-foreground mb-4">
              Đặt phòng này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Link href="/profile/bookings">
              <Button>Quay lại danh sách</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chi tiết đặt phòng</h1>
            <p className="text-muted-foreground">
              Mã đặt phòng: <span className="font-mono">{booking.bookingNumber}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[booking.status]}>
            {statusLabels[booking.status]}
          </Badge>
          <Badge variant="outline" className={paymentStatusColors[booking.paymentStatus]}>
            {paymentStatusLabels[booking.paymentStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Place Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin địa điểm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src={booking.place.images.find(img => img.isMain)?.url || '/placeholder.jpg'}
                    alt={booking.place.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    <Link 
                      href={`/places/${booking.place._id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {booking.place.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {booking.place.address.street}, {booking.place.address.ward}, {booking.place.address.district}, {booking.place.address.city}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {booking.place.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết đặt phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-sm text-muted-foreground">{formatDate(booking.checkInDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-sm text-muted-foreground">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Số khách</p>
                    <p className="text-sm text-muted-foreground">{booking.numberOfGuests} người</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Thời gian</p>
                    <p className="text-sm text-muted-foreground">{calculateDuration()}</p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <>
                  <hr className="border-border" />
                  <div>
                    <p className="font-medium mb-2">Yêu cầu đặc biệt</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tên khách hàng</p>
                    <p className="text-sm text-muted-foreground">{booking.customerInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{booking.customerInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Số điện thoại</p>
                    <p className="text-sm text-muted-foreground">{booking.customerInfo.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng kết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Loại đặt phòng:</span>
                <span className="font-medium">
                  {booking.bookingType === 'hourly' ? 'Theo giờ' : 
                   booking.bookingType === 'daily' ? 'Theo ngày' : 'Theo tháng'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span className="font-medium">{calculateDuration()}</span>
              </div>
              <div className="flex justify-between">
                <span>Số phòng:</span>
                <span className="font-medium">{booking.numberOfRooms} phòng</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Thanh toán: {booking.paymentMethod}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === 'completed' && !booking.review && (
                <Link href={`/places/${booking.place._id}?write-review=true&booking=${booking._id}`}>
                  <Button className="w-full">
                    <Star className="w-4 h-4 mr-2" />
                    Viết đánh giá
                  </Button>
                </Link>
              )}
              
              {booking.review && (
                <Link href={`/reviews/${booking.review._id}`}>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Xem đánh giá
                  </Button>
                </Link>
              )}

              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleCancelBooking}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy đặt phòng
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải hóa đơn
              </Button>
            </CardContent>
          </Card>

          {/* Booking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đặt phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium">Đặt phòng được tạo</p>
                  <p className="text-muted-foreground">{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
              
              {booking.updatedAt !== booking.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-medium">Cập nhật lần cuối</p>
                    <p className="text-muted-foreground">{formatDateTime(booking.updatedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}