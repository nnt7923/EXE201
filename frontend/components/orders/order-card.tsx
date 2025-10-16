'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  place: {
    _id: string;
    name: string;
    address: string;
    images?: string[];
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  orderDetails: {
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    roomType?: string;
    specialRequests?: string;
  };
  pricing: {
    basePrice: number;
    serviceFee: number;
    taxes: number;
    totalAmount: number;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: string;
  paymentStatus: string;
  notes: {
    adminNotes?: string;
    customerNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800'
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  completed: <AlertCircle className="w-4 h-4" />
};

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành'
};

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const calculateDuration = () => {
    const checkIn = new Date(order.orderDetails.checkInDate);
    const checkOut = new Date(order.orderDetails.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canCancel = order.status === 'pending';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Đặt ngày {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>
            <div className="flex items-center gap-1">
              {statusIcons[order.status]}
              {statusLabels[order.status]}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Place Info */}
        <div className="flex items-start gap-3">
          {order.place.images && order.place.images[0] && (
            <img 
              src={order.place.images[0]} 
              alt={order.place.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{order.place.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{order.place.address}</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Nhận phòng</p>
              <p className="text-gray-600">{formatDate(order.orderDetails.checkInDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Trả phòng</p>
              <p className="text-gray-600">{formatDate(order.orderDetails.checkOutDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Số khách</p>
              <p className="text-gray-600">{order.orderDetails.numberOfGuests} người</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Thời gian</p>
              <p className="text-gray-600">{calculateDuration()} đêm</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Tổng cộng:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(order.pricing.totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Chi tiết
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng {order.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Place Details */}
                <div>
                  <Label className="text-base font-semibold">Thông tin địa điểm</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{order.place.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {order.place.address}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <Label className="text-base font-semibold">Thông tin khách hàng</Label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{order.customerInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Điện thoại</p>
                        <p className="font-medium">{order.customerInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <Label className="text-base font-semibold">Chi tiết đặt phòng</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày nhận phòng</p>
                      <p className="font-medium">{formatDate(order.orderDetails.checkInDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày trả phòng</p>
                      <p className="font-medium">{formatDate(order.orderDetails.checkOutDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số khách</p>
                      <p className="font-medium">{order.orderDetails.numberOfGuests} người</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian lưu trú</p>
                      <p className="font-medium">{calculateDuration()} đêm</p>
                    </div>
                  </div>
                  {order.orderDetails.roomType && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Loại phòng</p>
                      <p className="font-medium">{order.orderDetails.roomType}</p>
                    </div>
                  )}
                  {order.orderDetails.specialRequests && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Yêu cầu đặc biệt</p>
                      <p className="font-medium">{order.orderDetails.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div>
                  <Label className="text-base font-semibold">Chi tiết giá</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Giá cơ bản ({calculateDuration()} đêm)</span>
                      <span>{formatCurrency(order.pricing.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí dịch vụ</span>
                      <span>{formatCurrency(order.pricing.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thuế và phí</span>
                      <span>{formatCurrency(order.pricing.taxes)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">{formatCurrency(order.pricing.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <Label className="text-base font-semibold">Thông tin thanh toán</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phương thức</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                      <p className="font-medium">{order.paymentStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {order.notes.adminNotes && (
                  <div>
                    <Label className="text-base font-semibold">Ghi chú từ admin</Label>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{order.notes.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {canCancel && onCancel && (
            <Button 
              variant="destructive" 
              onClick={() => onCancel(order._id)}
              className="flex-1"
            >
              Hủy đơn
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}