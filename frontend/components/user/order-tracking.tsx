'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle, CreditCard, Calendar, DollarSign, FileText, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

interface Payment {
  _id: string;
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  };
  amount: number;
  currency: string;
  bankTransferInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferAmount: number;
    transferDate: string;
    transferNote?: string;
    transferReference?: string;
  };
  proofOfPayment: string;
  status: 'pending' | 'confirmed' | 'rejected';
  adminNotes?: string;
  confirmedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  confirmedAt?: string;
  rejectedAt?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/payments/my-payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPayments(result.data || []);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách đơn hàng',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Đang chờ</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusDescription = (payment: Payment) => {
    switch (payment.status) {
      case 'pending':
        return 'Thanh toán của bạn đang được xem xét. Chúng tôi sẽ xác nhận trong vòng 24 giờ.';
      case 'confirmed':
        return `Thanh toán đã được xác nhận vào ${formatDate(payment.confirmedAt!)}. Dịch vụ của bạn đã được kích hoạt.`;
      case 'rejected':
        return `Thanh toán bị từ chối vào ${formatDate(payment.rejectedAt!)}. ${payment.adminNotes || 'Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.'}`;
      default:
        return 'Trạng thái không xác định.';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào. Hãy đăng ký gói dịch vụ để bắt đầu!</p>
          <Button onClick={() => window.location.href = '/pricing'}>
            Xem gói dịch vụ
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');
  const rejectedPayments = payments.filter(p => p.status === 'rejected');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả ({payments.length})</TabsTrigger>
          <TabsTrigger value="pending">Đang chờ ({pendingPayments.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận ({confirmedPayments.length})</TabsTrigger>
          <TabsTrigger value="rejected">Bị từ chối ({rejectedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PaymentList payments={payments} onSelectPayment={setSelectedPayment} />
        </TabsContent>
        
        <TabsContent value="pending">
          <PaymentList payments={pendingPayments} onSelectPayment={setSelectedPayment} />
        </TabsContent>
        
        <TabsContent value="confirmed">
          <PaymentList payments={confirmedPayments} onSelectPayment={setSelectedPayment} />
        </TabsContent>
        
        <TabsContent value="rejected">
          <PaymentList payments={rejectedPayments} onSelectPayment={setSelectedPayment} />
        </TabsContent>
      </Tabs>

      {/* Payment Detail Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedPayment._id.slice(-8)}</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về thanh toán và trạng thái đơn hàng
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Trạng thái:</span>
                {getStatusBadge(selectedPayment.status)}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">{getStatusDescription(selectedPayment)}</p>
              </div>

              {/* Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Gói dịch vụ</label>
                  <p className="font-semibold">{selectedPayment.subscriptionPlan.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời hạn</label>
                  <p className="font-semibold">{selectedPayment.subscriptionPlan.duration} tháng</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Số tiền</label>
                  <p className="font-semibold text-lg">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày gửi</label>
                  <p className="font-semibold">{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>

              {/* Bank Transfer Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Thông tin chuyển khoản</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Ngân hàng:</label>
                    <p className="font-medium">{selectedPayment.bankTransferInfo.bankName}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Số tài khoản:</label>
                    <p className="font-medium">{selectedPayment.bankTransferInfo.accountNumber}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Chủ tài khoản:</label>
                    <p className="font-medium">{selectedPayment.bankTransferInfo.accountHolder}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Ngày chuyển:</label>
                    <p className="font-medium">{formatDate(selectedPayment.bankTransferInfo.transferDate)}</p>
                  </div>
                  {selectedPayment.bankTransferInfo.transferNote && (
                    <div className="col-span-2">
                      <label className="text-gray-600">Ghi chú:</label>
                      <p className="font-medium">{selectedPayment.bankTransferInfo.transferNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Payment */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Ảnh chứng minh thanh toán</h4>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={selectedPayment.proofOfPayment}
                    alt="Chứng minh thanh toán"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              {selectedPayment.adminNotes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Ghi chú từ admin</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedPayment.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Subscription Dates */}
              {selectedPayment.status === 'confirmed' && selectedPayment.subscriptionStartDate && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Thông tin dịch vụ</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Ngày bắt đầu:</label>
                      <p className="font-medium">{formatDate(selectedPayment.subscriptionStartDate)}</p>
                    </div>
                    {selectedPayment.subscriptionEndDate && (
                      <div>
                        <label className="text-gray-600">Ngày kết thúc:</label>
                        <p className="font-medium">{formatDate(selectedPayment.subscriptionEndDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PaymentList({ payments, onSelectPayment }: { payments: Payment[], onSelectPayment: (payment: Payment) => void }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Đang chờ</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">Không có đơn hàng nào trong danh mục này</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">#{payment._id.slice(-8)}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(payment.createdAt)}
                </CardDescription>
              </div>
              {getStatusBadge(payment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Gói dịch vụ</p>
                  <p className="font-semibold">{payment.subscriptionPlan.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Thời hạn</p>
                  <p className="font-semibold">{payment.subscriptionPlan.duration} tháng</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Chuyển khoản qua {payment.bankTransferInfo.bankName}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectPayment(payment)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Xem chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}