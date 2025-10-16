'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, CreditCard, MapPin } from 'lucide-react';

interface Place {
  _id: string;
  name: string;
  address: string;
  pricePerNight: number;
  images?: string[];
}

interface OrderFormProps {
  place: Place;
  onSuccess?: (order: any) => void;
  onCancel?: () => void;
}

interface OrderFormData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  orderDetails: {
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    roomType: string;
    specialRequests: string;
  };
  paymentMethod: string;
}

export default function OrderForm({ place, onSuccess, onCancel }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    orderDetails: {
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: 1,
      roomType: 'standard',
      specialRequests: ''
    },
    paymentMethod: 'credit_card'
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateDuration = () => {
    if (!formData.orderDetails.checkInDate || !formData.orderDetails.checkOutDate) return 0;
    const checkIn = new Date(formData.orderDetails.checkInDate);
    const checkOut = new Date(formData.orderDetails.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculatePricing = () => {
    const duration = calculateDuration();
    const basePrice = place.pricePerNight * duration;
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxes = basePrice * 0.08; // 8% taxes
    const totalAmount = basePrice + serviceFee + taxes;

    return {
      basePrice,
      serviceFee,
      taxes,
      totalAmount,
      duration
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleInputChange = (section: keyof OrderFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const { customerInfo, orderDetails } = formData;
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin khách hàng',
        variant: 'destructive'
      });
      return false;
    }

    if (!orderDetails.checkInDate || !orderDetails.checkOutDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ngày nhận và trả phòng',
        variant: 'destructive'
      });
      return false;
    }

    const checkIn = new Date(orderDetails.checkInDate);
    const checkOut = new Date(orderDetails.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast({
        title: 'Lỗi',
        description: 'Ngày nhận phòng không thể là ngày trong quá khứ',
        variant: 'destructive'
      });
      return false;
    }

    if (checkOut <= checkIn) {
      toast({
        title: 'Lỗi',
        description: 'Ngày trả phòng phải sau ngày nhận phòng',
        variant: 'destructive'
      });
      return false;
    }

    if (orderDetails.numberOfGuests < 1) {
      toast({
        title: 'Lỗi',
        description: 'Số khách phải ít nhất là 1',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const pricing = calculatePricing();

      const orderData = {
        placeId: place._id,
        customerInfo: formData.customerInfo,
        orderDetails: formData.orderDetails,
        paymentMethod: formData.paymentMethod,
        pricing: {
          basePrice: pricing.basePrice,
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          totalAmount: pricing.totalAmount
        }
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Thành công',
          description: 'Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.'
        });
        onSuccess?.(result.data);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Đặt phòng thất bại');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt phòng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const pricing = calculatePricing();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Place Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Thông tin địa điểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {place.images && place.images[0] && (
              <img 
                src={place.images[0]} 
                alt={place.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{place.name}</h3>
              <p className="text-gray-600">{place.address}</p>
              <p className="text-blue-600 font-medium mt-1">
                {formatCurrency(place.pricePerNight)}/đêm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  value={formData.customerInfo.name}
                  onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                  placeholder="Nhập email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={formData.customerInfo.phone}
                  onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.customerInfo.address}
                  onChange={(e) => handleInputChange('customerInfo', 'address', e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Chi tiết đặt phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">Ngày nhận phòng *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.orderDetails.checkInDate}
                  onChange={(e) => handleInputChange('orderDetails', 'checkInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">Ngày trả phòng *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.orderDetails.checkOutDate}
                  onChange={(e) => handleInputChange('orderDetails', 'checkOutDate', e.target.value)}
                  min={formData.orderDetails.checkInDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="numberOfGuests">Số khách *</Label>
                <Select 
                  value={formData.orderDetails.numberOfGuests.toString()} 
                  onValueChange={(value) => handleInputChange('orderDetails', 'numberOfGuests', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'khách' : 'khách'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roomType">Loại phòng</Label>
                <Select 
                  value={formData.orderDetails.roomType} 
                  onValueChange={(value) => handleInputChange('orderDetails', 'roomType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Phòng tiêu chuẩn</SelectItem>
                    <SelectItem value="deluxe">Phòng deluxe</SelectItem>
                    <SelectItem value="suite">Phòng suite</SelectItem>
                    <SelectItem value="family">Phòng gia đình</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
              <Textarea
                id="specialRequests"
                value={formData.orderDetails.specialRequests}
                onChange={(e) => handleInputChange('orderDetails', 'specialRequests', e.target.value)}
                placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Phương thức thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        {pricing.duration > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Giá cơ bản ({pricing.duration} đêm)</span>
                <span>{formatCurrency(pricing.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ (10%)</span>
                <span>{formatCurrency(pricing.serviceFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế và phí (8%)</span>
                <span>{formatCurrency(pricing.taxes)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatCurrency(pricing.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={loading || pricing.duration === 0} className="flex-1">
            {loading ? 'Đang xử lý...' : 'Đặt phòng'}
          </Button>
        </div>
      </form>
    </div>
  );
}