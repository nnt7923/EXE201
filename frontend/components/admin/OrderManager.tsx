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
import { DataPagination } from '@/components/ui/data-pagination';
import { 
  Package, 
  Calendar, 
  User, 
  MapPin, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  place: {
    _id: string;
    name: string;
    address: string;
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

interface OrderStats {
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  totalOrders: number;
  totalRevenue: number;
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
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

export default function AdminOrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter, currentPage, limit]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/orders/admin/all?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đơn hàng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes
        })
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Cập nhật trạng thái đơn hàng thành công'
        });
        setIsUpdateDialogOpen(false);
        setNewStatus('');
        setAdminNotes('');
        fetchOrders();
        fetchStats();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái đơn hàng',
        variant: 'destructive'
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

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
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

          {stats.statusBreakdown.map((stat) => (
            <Card key={stat._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {stat._id === 'pending' ? 'Chờ xử lý' :
                   stat._id === 'confirmed' ? 'Đã xác nhận' :
                   stat._id === 'cancelled' ? 'Đã hủy' :
                   stat._id === 'completed' ? 'Hoàn thành' : stat._id}
                </CardTitle>
                {statusIcons[stat._id as keyof typeof statusIcons]}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stat.totalAmount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">Không có đơn hàng nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge className={statusColors[order.status]}>
                        {order.status === 'pending' ? 'Chờ xử lý' :
                         order.status === 'confirmed' ? 'Đã xác nhận' :
                         order.status === 'cancelled' ? 'Đã hủy' :
                         order.status === 'completed' ? 'Hoàn thành' : order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{order.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{order.place.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.orderDetails.checkInDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(order.pricing.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Chi tiết đơn hàng {order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-semibold">Thông tin khách hàng</Label>
                              <div className="mt-1 space-y-1 text-sm">
                                <p>Tên: {order.customerInfo.name}</p>
                                <p>Email: {order.customerInfo.email}</p>
                                <p>Điện thoại: {order.customerInfo.phone}</p>
                                {order.customerInfo.address && (
                                  <p>Địa chỉ: {order.customerInfo.address}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="font-semibold">Chi tiết đặt phòng</Label>
                              <div className="mt-1 space-y-1 text-sm">
                                <p>Ngày nhận phòng: {formatDate(order.orderDetails.checkInDate)}</p>
                                <p>Ngày trả phòng: {formatDate(order.orderDetails.checkOutDate)}</p>
                                <p>Số khách: {order.orderDetails.numberOfGuests}</p>
                                {order.orderDetails.roomType && (
                                  <p>Loại phòng: {order.orderDetails.roomType}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="font-semibold">Chi tiết giá</Label>
                            <div className="mt-1 space-y-1 text-sm">
                              <p>Giá cơ bản: {formatCurrency(order.pricing.basePrice)}</p>
                              <p>Phí dịch vụ: {formatCurrency(order.pricing.serviceFee)}</p>
                              <p>Thuế: {formatCurrency(order.pricing.taxes)}</p>
                              <p className="font-semibold">Tổng cộng: {formatCurrency(order.pricing.totalAmount)}</p>
                            </div>
                          </div>

                          {order.orderDetails.specialRequests && (
                            <div>
                              <Label className="font-semibold">Yêu cầu đặc biệt</Label>
                              <p className="mt-1 text-sm">{order.orderDetails.specialRequests}</p>
                            </div>
                          )}

                          {order.notes.adminNotes && (
                            <div>
                              <Label className="font-semibold">Ghi chú admin</Label>
                              <p className="mt-1 text-sm">{order.notes.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setAdminNotes(order.notes.adminNotes || '');
                          }}
                        >
                          Cập nhật
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cập nhật đơn hàng {selectedOrder?.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Chờ xử lý</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                                <SelectItem value="completed">Hoàn thành</SelectItem>
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
                            <Button onClick={updateOrderStatus}>
                              Cập nhật
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {pagination && (
          <div className="mt-6">
            <DataPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}