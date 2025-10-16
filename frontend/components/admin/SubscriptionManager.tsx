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
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Subscription {
  _id: string;
  subscriptionNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  plan: {
    _id: string;
    name: string;
    price: number;
    features: string[];
  } | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  pricing: {
    planPrice: number;
    serviceFee: number;
    taxes: number;
    totalAmount: number;
  };
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  startDate: string;
  endDate: string;
  notes?: {
    adminNotes?: string;
    customerNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
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

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  const fetchSubscriptions = async (page = currentPage, pageLimit = limit) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageLimit,
      };
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.getAdminSubscriptions(params);
      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions || []);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.current || page,
            pages: response.data.pagination.pages || 1,
            total: response.data.pagination.total || 0,
            limit: pageLimit
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đăng ký',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getSubscriptionStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching subscription stats:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [currentPage, limit, statusFilter]);

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscription.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscription.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscription.plan?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Chờ xử lý' },
      active: { variant: 'default' as const, icon: CheckCircle, label: 'Đang hoạt động' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: 'Đã hủy' },
      expired: { variant: 'outline' as const, icon: AlertCircle, label: 'Đã hết hạn' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentStatusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Chờ thanh toán' },
      paid: { variant: 'default' as const, icon: CheckCircle, label: 'Đã thanh toán' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Thanh toán thất bại' },
      refunded: { variant: 'outline' as const, icon: AlertCircle, label: 'Đã hoàn tiền' },
    };

    const config = paymentStatusConfig[paymentStatus as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const updateSubscriptionStatus = async () => {
    if (!selectedSubscription || !newStatus) return;

    try {
      const response = await api.updateSubscriptionStatus(
        selectedSubscription._id,
        newStatus,
        adminNotes
      );

      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật trạng thái đăng ký',
        });
        setIsUpdateDialogOpen(false);
        setSelectedSubscription(null);
        setNewStatus('');
        setAdminNotes('');
        fetchSubscriptions();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedSubscription || !newPaymentStatus) return;

    try {
      await api.updateSubscriptionPaymentStatus(selectedSubscription._id, newPaymentStatus);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái thanh toán',
      });
      setIsPaymentDialogOpen(false);
      setNewPaymentStatus('');
      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái thanh toán',
        variant: 'destructive',
      });
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    try {
      const response = await api.deleteSubscription(subscriptionId);
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa đăng ký',
        });
        fetchSubscriptions();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa đăng ký',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                  <p className="text-2xl font-bold">
                    {stats.statusBreakdown.find(s => s._id === 'active')?.count || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                  <p className="text-2xl font-bold">
                    {stats.statusBreakdown.find(s => s._id === 'pending')?.count || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã đăng ký, tên khách hàng, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="expired">Đã hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy đăng ký nào</p>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <Card key={subscription._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{subscription.subscriptionNumber}</h3>
                          {getStatusBadge(subscription.status)}
                          {getPaymentStatusBadge(subscription.paymentStatus)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {subscription.user ? 
                                `${subscription.user.name} (${subscription.user.email})` : 
                                'Người dùng không xác định'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span>{subscription.plan?.name || 'Gói không xác định'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(subscription.pricing.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Chi tiết đăng ký {subscription.subscriptionNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Thông tin khách hàng</Label>
                                  <div className="mt-1 space-y-1 text-sm">
                                    <p>Tên: {subscription.customerInfo.name}</p>
                                    <p>Email: {subscription.customerInfo.email}</p>
                                    <p>Điện thoại: {subscription.customerInfo.phone}</p>
                                    {subscription.customerInfo.address && (
                                      <p>Địa chỉ: {subscription.customerInfo.address}</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold">Thông tin gói</Label>
                                  <div className="mt-1 space-y-1 text-sm">
                                    <p>Gói: {subscription.plan?.name || 'Gói không xác định'}</p>
                                    <p>Giá gói: {formatCurrency(subscription.pricing.planPrice)}</p>
                                    <p>Phí dịch vụ: {formatCurrency(subscription.pricing.serviceFee)}</p>
                                    <p>Thuế: {formatCurrency(subscription.pricing.taxes)}</p>
                                    <p className="font-semibold">Tổng: {formatCurrency(subscription.pricing.totalAmount)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="font-semibold">Thời gian</Label>
                                <div className="mt-1 space-y-1 text-sm">
                                  <p>Bắt đầu: {formatDate(subscription.startDate)}</p>
                                  <p>Kết thúc: {formatDate(subscription.endDate)}</p>
                                  <p>Ngày tạo: {formatDate(subscription.createdAt)}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Trạng thái gói</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(subscription.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold">Trạng thái thanh toán</Label>
                                  <div className="mt-1">
                                    {getPaymentStatusBadge(subscription.paymentStatus)}
                                  </div>
                                </div>
                              </div>

                              {subscription.notes?.customerNotes && (
                                <div>
                                  <Label className="font-semibold">Ghi chú khách hàng</Label>
                                  <p className="mt-1 text-sm">{subscription.notes.customerNotes}</p>
                                </div>
                              )}

                              {subscription.notes?.adminNotes && (
                                <div>
                                  <Label className="font-semibold">Ghi chú admin</Label>
                                  <p className="mt-1 text-sm">{subscription.notes.adminNotes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setNewStatus(subscription.status);
                            setAdminNotes(subscription.notes?.adminNotes || '');
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Cập nhật
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setNewPaymentStatus(subscription.paymentStatus);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Thanh toán
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa đăng ký {subscription.subscriptionNumber}? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSubscription(subscription._id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && (
            <DataPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="expired">Đã hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adminNotes">Ghi chú admin</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập ghi chú..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={updateSubscriptionStatus}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="failed">Thanh toán thất bại</SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={updatePaymentStatus}>
                Cập nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}