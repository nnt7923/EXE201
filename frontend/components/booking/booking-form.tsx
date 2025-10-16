'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, CreditCard, User, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { api } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface Place {
  _id: string
  name: string
  category: string
  address: {
    street: string
    ward: string
    district: string
    city: string
  }
  pricing?: {
    minPrice?: number
    maxPrice?: number
    currency?: string
  }
  images: Array<{
    url: string
    alt: string
    isMain: boolean
  }>
}

interface BookingFormProps {
  place: Place
  onBookingSuccess?: (bookingId: string) => void
}

export default function BookingForm({ place, onBookingSuccess }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false)

  const [formData, setFormData] = useState({
    // Customer info
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    
    // Booking details
    guests: 1,
    rooms: 1,
    bookingType: 'standard',
    specialRequests: '',
    
    // Payment
    paymentMethod: 'bank_transfer'
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) {
      return {
        nights: 0,
        basePrice: place.pricing?.minPrice || 0,
        roomPrice: 0,
        totalPrice: 0
      }
    }
    
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const basePrice = place.pricing?.minPrice || 0
    const roomPrice = basePrice * formData.rooms
    const totalPrice = roomPrice * nights
    
    return {
      nights,
      basePrice,
      roomPrice,
      totalPrice
    }
  }

  const pricing = calculateTotalPrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkInDate || !checkOutDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ngày nhận và trả phòng',
        variant: 'destructive'
      })
      return
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: 'Lỗi',
        description: 'Ngày trả phòng phải sau ngày nhận phòng',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const bookingData = {
        place: place._id,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        },
        bookingDetails: {
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          numberOfGuests: formData.guests,
          numberOfRooms: formData.rooms,
          specialRequests: formData.specialRequests
        },
        pricing: {
          roomPrice: pricing.basePrice || 0,
          totalAmount: pricing.totalPrice || 0,
          currency: place.pricing?.currency || 'VND'
        },
        paymentMethod: formData.paymentMethod
      }

      const response = await api.createBooking(bookingData)
      
      if (response.data.success) {
        toast({
          title: 'Thành công',
          description: 'Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
        })
        
        if (onBookingSuccess) {
          onBookingSuccess(response.data.data.booking._id)
        } else {
          router.push('/orders')
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Đặt phòng tại {place.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {place.address.street}, {place.address.ward}, {place.address.district}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerName"
                    placeholder="Nhập họ và tên"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    placeholder="Nhập số điện thoại"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chi tiết đặt phòng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check-in Date */}
              <div className="space-y-2">
                <Label>Ngày nhận phòng *</Label>
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date)
                        setIsCheckInOpen(false)
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label>Ngày trả phòng *</Label>
                <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={checkOutDate}
                      onSelect={(date) => {
                        setCheckOutDate(date)
                        setIsCheckOutOpen(false)
                      }}
                      disabled={(date) => date <= (checkInDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guests">Số khách</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guests}
                    onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Số phòng</Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingType">Loại đặt phòng</Label>
                <Select value={formData.bookingType} onValueChange={(value) => handleInputChange('bookingType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Tiêu chuẩn</SelectItem>
                    <SelectItem value="deluxe">Cao cấp</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
              <Textarea
                id="specialRequests"
                placeholder="Nhập yêu cầu đặc biệt (tùy chọn)"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                <SelectItem value="cash">Thanh toán tiền mặt</SelectItem>
                <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Summary */}
          {checkInDate && checkOutDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tổng kết giá</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Giá phòng/đêm:</span>
                  <span>{pricing.basePrice?.toLocaleString() || '0'} {place.pricing?.currency || 'VND'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số phòng:</span>
                  <span>{formData.rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số đêm:</span>
                  <span>{pricing.nights}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{pricing.totalPrice?.toLocaleString() || '0'} {place.pricing?.currency || 'VND'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading || !checkInDate || !checkOutDate}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang xử lý...' : 'Đặt phòng ngay'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}