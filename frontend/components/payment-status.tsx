'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, CreditCard, Calendar, DollarSign, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

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
  confirmedAt?: string;
  rejectedAt?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentStatus() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/user/history', {
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
          description: 'Không thể tải lịch sử thanh toán',
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
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xác nhận
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xác nhận
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Đã từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (payment: Payment) => {
    switch (payment.status) {
      case 'pending':
        return {
          title: 'Đang chờ xác nhận',
          description: 'Thanh toán của bạn đang được admin xem xét. Quá trình này thường mất 1-24 giờ trong giờ làm việc.',
          variant: 'default' as const
        };
      case 'confirmed':
        return {
          title: 'Thanh toán đã được xác nhận',
          description: `Gói ${payment.subscriptionPlan.name} đã được kích hoạt. Bạn có thể sử dụng các tính năng AI ngay bây giờ.`,
          variant: 'default' as const
        };
      case 'rejected':
        return {
          title: 'Thanh toán bị từ chối',
          description: payment.adminNotes || 'Vui lòng kiểm tra lại thông tin thanh toán và thử lại.',
          variant: 'destructive' as const
        };
      default:
        return {
          title: 'Trạng thái không xác định',
          description: 'Vui lòng liên hệ hỗ trợ.',
          variant: 'destructive' as const
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lịch sử thanh toán</h2>
          <p className="text-muted-foreground">Theo dõi trạng thái thanh toán của bạn</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Bạn chưa có thanh toán nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusInfo = getStatusMessage(payment);
            
            return (
              <Card key={payment._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Gói {payment.subscriptionPlan.name}
                      </CardTitle>
                      <CardDescription>
                        Gửi lúc: {formatDate(payment.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(payment.status)}
                      <p className="text-lg font-semibold mt-1">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert variant={statusInfo.variant} className="mb-4">
                    <AlertDescription>
                      <strong>{statusInfo.title}:</strong> {statusInfo.description}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="w-4 h-4" />
                        Số tiền chuyển
                      </div>
                      <p>{formatCurrency(payment.bankTransferInfo.transferAmount)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        Ngày chuyển
                      </div>
                      <p>{formatDate(payment.bankTransferInfo.transferDate)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Ngân hàng
                      </div>
                      <p>{payment.bankTransferInfo.bankName}</p>
                    </div>
                  </div>

                  {payment.status === 'confirmed' && payment.subscriptionStartDate && payment.subscriptionEndDate && (
                    <Alert className="mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Gói đã kích hoạt:</strong> Từ {formatDate(payment.subscriptionStartDate)} đến {formatDate(payment.subscriptionEndDate)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Chi tiết thanh toán</DialogTitle>
                        <DialogDescription>
                          Thông tin chi tiết về thanh toán chuyển khoản
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedPayment && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Gói đăng ký</h4>
                              <p>{selectedPayment.subscriptionPlan.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(selectedPayment.subscriptionPlan.price)} - {selectedPayment.subscriptionPlan.duration} ngày
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Trạng thái</h4>
                              <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Ngân hàng chuyển</h4>
                              <p>{selectedPayment.bankTransferInfo.bankName}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Số tài khoản</h4>
                              <p>{selectedPayment.bankTransferInfo.accountNumber}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Chủ tài khoản</h4>
                              <p>{selectedPayment.bankTransferInfo.accountHolder}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Số tiền chuyển</h4>
                              <p className="text-lg font-semibold">
                                {formatCurrency(selectedPayment.bankTransferInfo.transferAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Ngày chuyển</h4>
                              <p>{formatDate(selectedPayment.bankTransferInfo.transferDate)}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Ngày gửi</h4>
                              <p>{formatDate(selectedPayment.createdAt)}</p>
                            </div>
                          </div>

                          {selectedPayment.bankTransferInfo.transferNote && (
                            <div>
                              <h4 className="font-medium">Nội dung chuyển khoản</h4>
                              <p>{selectedPayment.bankTransferInfo.transferNote}</p>
                            </div>
                          )}

                          {selectedPayment.bankTransferInfo.transferReference && (
                            <div>
                              <h4 className="font-medium">Mã tham chiếu</h4>
                              <p>{selectedPayment.bankTransferInfo.transferReference}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium">Ảnh chứng minh</h4>
                            <div className="mt-2">
                              <img 
                                src={selectedPayment.proofOfPayment} 
                                alt="Proof of payment" 
                                className="max-w-full h-auto rounded-lg border"
                              />
                            </div>
                          </div>

                          {selectedPayment.adminNotes && (
                            <div>
                              <h4 className="font-medium">Ghi chú từ admin</h4>
                              <p className="text-sm bg-muted p-3 rounded-lg">{selectedPayment.adminNotes}</p>
                            </div>
                          )}

                          {selectedPayment.status === 'confirmed' && selectedPayment.confirmedAt && (
                            <div>
                              <h4 className="font-medium">Thời gian xác nhận</h4>
                              <p>{formatDate(selectedPayment.confirmedAt)}</p>
                            </div>
                          )}

                          {selectedPayment.status === 'rejected' && selectedPayment.rejectedAt && (
                            <div>
                              <h4 className="font-medium">Thời gian từ chối</h4>
                              <p>{formatDate(selectedPayment.rejectedAt)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}