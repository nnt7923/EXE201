'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { api, isAuthenticated } from '@/lib/api';
import { Header } from '@/components/header';

interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  aiSuggestionLimit: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [choosingPlanId, setChoosingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPlans();
        if (response.success && response.data) {
          setPlans(response.data);
        } else {
          setError(response.message || 'Failed to fetch plans.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChoosePlan = (planId: string) => {
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=/checkout/${planId}`);
      return;
    }
    setChoosingPlanId(planId);
    router.push(`/checkout/${planId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">Error: {error}</div>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                      Chọn Gói Dịch Vụ Của Bạn
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                      Khai phá toàn bộ tiềm năng lập kế hoạch du lịch bằng AI quanh khu vực Hòa Lạc.
                    </p>
                  </div>
        
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                  {plans.map((plan) => (
                    <Card 
                      key={plan._id} 
                      className={`flex flex-col ${plan.name === 'Chuyên nghiệp' ? 'border-primary border-2' : ''} ${plan.name === 'Không giới hạn' ? 'bg-secondary' : ''}`}
                    >
                      <CardHeader className="relative">
                        {plan.name === 'Chuyên nghiệp' && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-md -mt-px -mr-px">
                            Phổ Biến Nhất
                          </div>
                        )}
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="mb-6">
                          <span className="text-5xl font-extrabold">{plan.price.toLocaleString('vi-VN')}</span>
                          <span className="text-lg font-medium text-muted-foreground ml-1">VND/tháng</span>
                        </div>
                        <ul className="space-y-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleChoosePlan(plan._id)}
                          disabled={choosingPlanId === plan._id}
                          variant={plan.name === 'Chuyên nghiệp' ? 'default' : 'outline'}
                        >
                          {choosingPlanId === plan._id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</>
                          ) : (
                            'Chọn Gói'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}      </div>
        </div>
      </>
    );
}