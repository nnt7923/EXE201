'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle, XCircle, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  type: 'payment_confirmed' | 'payment_rejected' | 'subscription_expired' | 'subscription_expiring';
  title: string;
  message: string;
  data?: {
    paymentId?: string;
    subscriptionPlan?: {
      name: string;
      price: number;
    };
    subscriptionEndDate?: string;
  };
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { api } = await import('@/lib/api');
      const result = await api.getNotifications();
      
      if (result.success) {
        setNotifications(result.data || []);
        setUnreadCount(result.data?.filter((n: Notification) => !n.read).length || 0);
      } else {
        console.error('Failed to fetch notifications:', result.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { api } = await import('@/lib/api');
      const result = await api.markNotificationAsRead(notificationId);

      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { api } = await import('@/lib/api');
      const result = await api.markAllNotificationsAsRead();

      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast({
          title: 'Thành công',
          description: 'Đã đánh dấu tất cả thông báo là đã đọc'
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast({
          title: 'Thành công',
          description: 'Đã xóa thông báo'
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'payment_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'subscription_expired':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      case 'subscription_expiring':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Không có thông báo nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook để sử dụng notification center
export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      // Check if user is authenticated before making API call
      const token = localStorage.getItem('token');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const { api } = await import('@/lib/api');
      const result = await api.getUnreadNotificationCount();

      if (result.success) {
        setUnreadCount(result.data.count || 0);
      }
    } catch (error) {
      // Only log error if it's not an authentication issue
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('Session expired') && !errorMessage.includes('401')) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
}