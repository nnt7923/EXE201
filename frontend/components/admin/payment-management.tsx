'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DataPagination } from '@/components/ui/data-pagination';
import { 
  CreditCard, 
  Calendar, 
  User, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '@/lib/api';
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

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
  }>;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
  limit?: number;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [pagination.current, statusFilter, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPayments();
      
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
        setStats(response.data.stats || null);
        setPagination(response.data.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 10
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thanh toán",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    try {
      const response = await api.confirmPayment(selectedPayment._id, adminNotes);
      
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã xác nhận thanh toán",
        });
        setIsConfirmDialogOpen(false);
        setAdminNotes('');
        fetchPayments();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận thanh toán",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    try {
      const response = await api.rejectPayment(selectedPayment._id, adminNotes);
      
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã từ chối thanh toán",
        });
        setIsRejectDialogOpen(false);
        setAdminNotes('');
        fetchPayments();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể từ chối thanh toán",
        variant: "destructive",
      });
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.subscriptionPlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bankTransferInfo.accountHolder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thanh toán</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          {stats.statusBreakdown.map((status) => (
            <Card key={status._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {status._id === 'pending' ? 'Đang chờ' : 
                   status._id === 'confirmed' ? 'Đã xác nhận' : 
                   status._id === 'rejected' ? 'Bị từ chối' : status._id}
                </CardTitle>
                {status._id === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                {status._id === 'confirmed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {status._id === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.count}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(status.totalRevenue)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên gói hoặc người thanh toán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thanh toán ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Không có thanh toán nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{payment.subscriptionPlan.name}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Người thanh toán:</strong> {payment.bankTransferInfo.accountHolder}</p>
                          <p><strong>Số tiền:</strong> {formatCurrency(payment.amount)}</p>
                          <p><strong>Ngày tạo:</strong> {formatDate(payment.createdAt)}</p>
                          {payment.bankTransferInfo.transferDate && (
                            <p><strong>Ngày chuyển khoản:</strong> {formatDate(payment.bankTransferInfo.transferDate)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsConfirmDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Xác nhận
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <DataPagination
          currentPage={pagination.current}
          totalPages={pagination.pages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
        />
      )}

      {/* Payment Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="font-semibold">Gói dịch vụ</Label>
                  <p className="mt-1">{selectedPayment.subscriptionPlan.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Số tiền</Label>
                  <p className="mt-1">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Ngày tạo</Label>
                  <p className="mt-1">{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Thông tin chuyển khoản</Label>
                <div className="mt-2 bg-gray-50 p-3 rounded-lg space-y-2">
                  <p><strong>Ngân hàng:</strong> {selectedPayment.bankTransferInfo.bankName}</p>
                  <p><strong>Số tài khoản:</strong> {selectedPayment.bankTransferInfo.accountNumber}</p>
                  <p><strong>Chủ tài khoản:</strong> {selectedPayment.bankTransferInfo.accountHolder}</p>
                  <p><strong>Số tiền chuyển:</strong> {formatCurrency(selectedPayment.bankTransferInfo.transferAmount)}</p>
                  {selectedPayment.bankTransferInfo.transferDate && (
                    <p><strong>Ngày chuyển:</strong> {formatDate(selectedPayment.bankTransferInfo.transferDate)}</p>
                  )}
                  {selectedPayment.bankTransferInfo.transferNote && (
                    <p><strong>Ghi chú:</strong> {selectedPayment.bankTransferInfo.transferNote}</p>
                  )}
                </div>
              </div>

              {selectedPayment.proofOfPayment && (
                <div>
                  <Label className="font-semibold">Chứng minh thanh toán</Label>
                  <div className="mt-2 relative w-full h-64 border rounded-lg overflow-hidden">
                    <Image
                      src={selectedPayment.proofOfPayment}
                      alt="Chứng minh thanh toán"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.adminNotes && (
                <div>
                  <Label className="font-semibold">Ghi chú admin</Label>
                  <div className="mt-1 bg-gray-50 p-3 rounded-lg">
                    <p>{selectedPayment.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Payment Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xác nhận thanh toán này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmNotes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="confirmNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminNotes('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Payment Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối thanh toán này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectNotes">Lý do từ chối *</Label>
              <Textarea
                id="rejectNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminNotes('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectPayment}
              disabled={!adminNotes.trim()}
            >
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}