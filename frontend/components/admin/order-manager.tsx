'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- INTERFACES ---
interface Subscription {
  _id: string;
  name: string; // User name
  email: string; // User email
  subscriptionEndDate: string;
  subscriptionStatus: string;
  paymentStatus: string;
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
  };
}

// --- COMPONENTS ---

function SubscriptionTableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-2 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function OrderManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllSubscriptions();
      if (response.success && response.data) {
        setSubscriptions(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch subscriptions');
      }
    } catch (error: any) {
      toast({ title: 'Lỗi', description: `Không thể tải danh sách đơn hàng: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    setIsUpdating(editingSubscription._id);
    try {
      const updateData: any = {};
      
      if (newStatus && newStatus !== editingSubscription.subscriptionStatus) {
        updateData.subscriptionStatus = newStatus;
      }
      
      if (newPaymentStatus && newPaymentStatus !== editingSubscription.paymentStatus) {
        updateData.paymentStatus = newPaymentStatus;
      }
      
      if (newEndDate && newEndDate !== editingSubscription.subscriptionEndDate.split('T')[0]) {
        updateData.subscriptionEndDate = newEndDate;
      }

      console.log('Update data:', updateData);
      console.log('Editing subscription ID:', editingSubscription._id);

      if (Object.keys(updateData).length === 0) {
        toast({ title: 'Thông báo', description: 'Không có thay đổi nào để cập nhật', variant: 'default' });
        setEditingSubscription(null);
        return;
      }

      const response = await api.updateSubscription(editingSubscription._id, updateData);
      console.log('API response:', response);
      
      if (response.success) {
        toast({ title: 'Thành công', description: 'Cập nhật subscription thành công!', variant: 'default' });
        setEditingSubscription(null);
        console.log('Refreshing subscriptions...');
        await fetchSubscriptions(); // Refresh the list
        console.log('Subscriptions refreshed');
      } else {
        throw new Error(response.message || 'Failed to update subscription');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast({ title: 'Lỗi', description: `Không thể cập nhật: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsUpdating(null);
    }
  };

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setNewStatus(subscription.subscriptionStatus);
    setNewPaymentStatus(subscription.paymentStatus);
    setNewEndDate(subscription.subscriptionEndDate.split('T')[0]); // Format for date input
  };

  const isSubscriptionActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'pending_payment': return 'outline';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Đơn hàng / Gói dịch vụ</CardTitle>
        <CardDescription>
          Xem và cập nhật trạng thái đăng ký gói dịch vụ của tất cả người dùng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SubscriptionTableSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Gói dịch vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{sub.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-sm text-muted-foreground">{sub.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.subscriptionPlan.name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(sub.subscriptionStatus)}>
                        {sub.subscriptionStatus === 'active' ? 'Hoạt động' :
                         sub.subscriptionStatus === 'expired' ? 'Hết hạn' :
                         sub.subscriptionStatus === 'cancelled' ? 'Đã hủy' :
                         sub.subscriptionStatus === 'pending_payment' ? 'Chờ thanh toán' : 'Không có'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusBadgeVariant(sub.paymentStatus)}>
                        {sub.paymentStatus === 'confirmed' ? 'Đã xác nhận' :
                         sub.paymentStatus === 'pending' ? 'Chờ xử lý' :
                         sub.paymentStatus === 'rejected' ? 'Bị từ chối' : 'Chưa có'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.subscriptionEndDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub.subscriptionPlan.price.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(sub)}
                          >
                            Chỉnh sửa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Cập nhật Subscription</DialogTitle>
                            <DialogDescription>
                              Cập nhật trạng thái subscription cho {editingSubscription?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="status" className="text-right">
                                Trạng thái
                              </Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Không có</SelectItem>
                                  <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                                  <SelectItem value="active">Hoạt động</SelectItem>
                                  <SelectItem value="expired">Hết hạn</SelectItem>
                                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="payment-status" className="text-right">
                                Thanh toán
                              </Label>
                              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Chưa có</SelectItem>
                                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                  <SelectItem value="rejected">Bị từ chối</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="end-date" className="text-right">
                                Ngày hết hạn
                              </Label>
                              <Input
                                id="end-date"
                                type="date"
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              onClick={handleUpdateSubscription}
                              disabled={isUpdating === editingSubscription?._id}
                            >
                              {isUpdating === editingSubscription?._id ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Không có đơn hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}