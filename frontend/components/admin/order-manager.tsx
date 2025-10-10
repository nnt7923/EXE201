'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// --- INTERFACES ---
interface Subscription {
  _id: string;
  name: string; // User name
  email: string; // User email
  subscriptionEndDate: string;
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
  const { toast } = useToast();

  useEffect(() => {
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
    fetchSubscriptions();
  }, [toast]);

  const isSubscriptionActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Đơn hàng / Gói dịch vụ</CardTitle>
        <CardDescription>
          Xem lịch sử đăng ký gói dịch vụ của tất cả người dùng.
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
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead className="text-right">Giá</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {/* Assuming no user avatar in this specific response */}
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
                      <Badge variant={isSubscriptionActive(sub.subscriptionEndDate) ? 'default' : 'outline'} 
                             className={isSubscriptionActive(sub.subscriptionEndDate) ? 'bg-green-500 text-white' : ''}>
                        {isSubscriptionActive(sub.subscriptionEndDate) ? 'Còn hạn' : 'Hết hạn'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.subscriptionEndDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {sub.subscriptionPlan.price.toLocaleString('vi-VN')} VND
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
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