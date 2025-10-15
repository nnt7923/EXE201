'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, isAuthenticated } from '@/lib/api';
import BankTransferForm from '@/components/bank-transfer-form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';

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
        if (response.success && response.data) {
          setPlan(response.data);
        } else {
          setError(response.message || 'Không thể tải chi tiết gói.');
        }
      } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, router]);

  const handlePaymentSuccess = () => {
    toast({
      title: 'Thông tin đã được gửi!',
      description: 'Vui lòng chờ admin xác nhận thanh toán. Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.',
    });
    router.push('/profile?tab=payments'); // Redirect to profile payments tab
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
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Thanh toán
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Bạn chỉ còn một bước nữa để mở khóa các tính năng mới.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-12">
            {/* Plan Details Card - Sticky on desktop */}
            <div className="xl:col-span-2">
              <div className="xl:sticky xl:top-24 z-10">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
                  <div className="relative">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl lg:text-3xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-base">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Price Display */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-4xl lg:text-5xl font-extrabold">
                            {plan.price.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-lg font-medium text-blue-100">VND</span>
                        </div>
                        <p className="text-blue-100 mt-2">mỗi tháng</p>
                      </div>

                      {/* Features List */}
                      <div>
                        <h4 className="font-semibold mb-4 text-lg">Các tính năng bao gồm:</h4>
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <div className="p-1 bg-green-500 rounded-full mr-3 mt-0.5 flex-shrink-0">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-blue-50 leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="secondary" 
                        onClick={() => router.push('/pricing')}
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                      >
                        Thay đổi gói
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </div>
            </div>

            {/* Bank Transfer Form */}
            <div className="xl:col-span-3">
              <BankTransferForm plan={plan} onSuccess={handlePaymentSuccess} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
