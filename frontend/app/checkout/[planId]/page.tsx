'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, isAuthenticated } from '@/lib/api';
import { MockCheckoutForm } from '@/components/mock-checkout-form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export default function CheckoutPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const planId = params.planId as string;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=/checkout/${planId}`);
      return;
    }

    if (!planId) {
        setError("Không có ID gói nào được cung cấp.");
        setLoading(false);
        return;
    }

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await api.getPlan(planId);
        if (response.success) {
          setPlan(response.data);
        } else {
          setError(response.message || 'Không thể tải chi tiết gói.');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi không mong muốn.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, router]);

  const handleSubscriptionSuccess = async () => {
    if (!plan) return;

    setIsSubscribing(true);
    try {
      const response = await api.subscribeToPlan(plan._id);
      if (response.success) {
        // Refresh user data
        const userResponse = await api.getCurrentUser();
        if (userResponse.success) {
          // Update user data in localStorage or global state if needed
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
        
        toast({
          title: 'Đăng ký thành công!',
          description: `Bạn đã đăng ký thành công gói ${plan.name}.`,
        });
        router.push('/profile'); // Redirect to profile after success
      } else {
        toast({
          title: 'Đăng ký thất bại',
          description: response.message || 'Vui lòng thử lại.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Đã xảy ra lỗi',
        description: 'Không thể hoàn tất đăng ký. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-20">Lỗi: {error}</div>;
  }

  if (!plan) {
    return <div className="text-center text-muted-foreground py-20">Không tìm thấy gói.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Thanh toán</h1>
            <p className="mt-4 text-xl text-muted-foreground">Bạn chỉ còn một bước nữa để mở khóa các tính năng mới.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan Details Card */}
            <Card className="flex flex-col bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-2xl">Gói của bạn: {plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="mb-6">
                        <span className="text-5xl font-extrabold">{plan.price.toLocaleString('vi-VN')}</span>
                        <span className="text-lg font-medium text-muted-foreground ml-1">VND/tháng</span>
                    </div>
                    <h4 className="font-semibold mb-3">Các tính năng bao gồm:</h4>
                    <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2.5 flex-shrink-0 mt-1" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
                 <CardFooter>
                    <Button variant="link" onClick={() => router.push('/pricing')}>Thay đổi gói</Button>
                </CardFooter>
            </Card>

            {/* Checkout Form Card */}
            <Card className="flex flex-col justify-center">
                <CardHeader>
                    <CardTitle>Chi tiết thanh toán</CardTitle>
                    <CardDescription>Hoàn tất thanh toán để kích hoạt đăng ký.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Quét mã QR để thanh toán</h3>
                    <div className="flex justify-center mb-4">
                        <Image src="/QR1.jpg" alt="QR Code" width={200} height={200} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Sau khi quét mã, hãy nhấn nút bên dưới để xác nhận thanh toán của bạn.</p>
                    <Button onClick={handleSubscriptionSuccess} disabled={isSubscribing} className="w-full">
                        {isSubscribing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : 'Tôi đã thanh toán'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
