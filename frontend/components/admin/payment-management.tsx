'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, User, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
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

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'pending' 
        ? '/api/payments/admin/pending'
        : `/api/payments/admin/all?status=${activeTab === 'all' ? '' : activeTab}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPayments(result.data.payments || result.data);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách thanh toán',
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

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/payments/admin/confirm/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes: adminNotes })
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Thanh toán đã được xác nhận'
        });
        setSelectedPayment(null);
        setAdminNotes('');
        fetchPayments();
      } else {
        const error = await response.json();
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể xác nhận thanh toán',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối server',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/payments/admin/reject/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes: adminNotes })
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Thanh toán đã bị từ chối'
        });
        setSelectedPayment(null);
        setAdminNotes('');
        fetchPayments();
      } else {
        const error = await response.json();
        toast({
          title: 'Lỗi',
          description: error.message || 'Không thể từ chối thanh toán',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối server',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h2 className="text-2xl font-bold">Quản lý thanh toán</h2>
          <p className="text-muted-foreground">Xác nhận và quản lý thanh toán chuyển khoản</p>
        </div>
        <Button onClick={fetchPayments} variant="outline">
          Làm mới
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Không có thanh toán nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {payment.user.name}
                        </CardTitle>
                        <CardDescription>{payment.user.email}</CardDescription>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(payment.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium">Gói đăng ký</span>
                        </div>
                        <p>{payment.subscriptionPlan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.subscriptionPlan.duration} ngày
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">Số tiền</span>
                        </div>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Ngày chuyển</span>
                        </div>
                        <p>{formatDate(payment.bankTransferInfo.transferDate)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
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
                                  <Label>Người dùng</Label>
                                  <p>{selectedPayment.user.name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedPayment.user.email}</p>
                                </div>
                                <div>
                                  <Label>Trạng thái</Label>
                                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Gói đăng ký</Label>
                                  <p>{selectedPayment.subscriptionPlan.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(selectedPayment.subscriptionPlan.price)} - {selectedPayment.subscriptionPlan.duration} ngày
                                  </p>
                                </div>
                                <div>
                                  <Label>Số tiền chuyển</Label>
                                  <p className="text-lg font-semibold">
                                    {formatCurrency(selectedPayment.bankTransferInfo.transferAmount)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Ngân hàng</Label>
                                  <p>{selectedPayment.bankTransferInfo.bankName}</p>
                                </div>
                                <div>
                                  <Label>Số tài khoản</Label>
                                  <p>{selectedPayment.bankTransferInfo.accountNumber}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Chủ tài khoản</Label>
                                  <p>{selectedPayment.bankTransferInfo.accountHolder}</p>
                                </div>
                                <div>
                                  <Label>Ngày chuyển</Label>
                                  <p>{formatDate(selectedPayment.bankTransferInfo.transferDate)}</p>
                                </div>
                              </div>

                              {selectedPayment.bankTransferInfo.transferNote && (
                                <div>
                                  <Label>Ghi chú chuyển khoản</Label>
                                  <p>{selectedPayment.bankTransferInfo.transferNote}</p>
                                </div>
                              )}

                              {selectedPayment.bankTransferInfo.transferReference && (
                                <div>
                                  <Label>Mã tham chiếu</Label>
                                  <p>{selectedPayment.bankTransferInfo.transferReference}</p>
                                </div>
                              )}

                              <div>
                                <Label>Ảnh chứng minh</Label>
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
                                  <Label>Ghi chú admin</Label>
                                  <p>{selectedPayment.adminNotes}</p>
                                </div>
                              )}

                              {selectedPayment.status === 'pending' && (
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <Label htmlFor="adminNotes">Ghi chú admin (tùy chọn)</Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Nhập ghi chú cho quyết định này..."
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleConfirmPayment(selectedPayment._id)}
                                      disabled={actionLoading}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Xác nhận thanh toán
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectPayment(selectedPayment._id)}
                                      disabled={actionLoading}
                                      variant="destructive"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Từ chối thanh toán
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {payment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setAdminNotes('');
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setAdminNotes('');
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}