'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { api, isAuthenticated } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Plan {
  _id: string;
  name: string;
  price: number;
  features: string[];
  aiSuggestionLimit: number;
}

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPlans();
        if (response.success) {
          // Show only the first 3 plans on the homepage
          setPlans(response.data.slice(0, 3));
        } else {
          setError(response.message || 'Failed to fetch plans.');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching plans.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChoosePlan = (e: React.MouseEvent, planName: string) => {
    if (!isAuthenticated()) {
      e.preventDefault(); // Prevent the Link from navigating
      router.push('/auth/login?redirect=/pricing');
    } else {
      toast({
        title: "Redirecting...",
        description: `Taking you to the main pricing page to confirm your choice.`,
      });
      // The Link component will handle the navigation to /pricing
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading Pricing Plans...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
       <section className="py-12 bg-red-50 dark:bg-red-900/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Các Gói Linh Hoạt
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Chọn một gói phù hợp với hành trình của bạn và mở khóa tính năng lập kế hoạch hành trình mạnh mẽ do AI cung cấp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan._id} className="flex flex-col border-2 hover:border-primary transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-5xl font-extrabold">{plan.price.toLocaleString('vi-VN')}</span>
                  <span className="text-lg font-medium text-muted-foreground ml-1">VND/tháng</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/pricing" className="w-full">
                  <Button 
                    className="w-full" 
                    onClick={(e) => handleChoosePlan(e, plan.name)}
                  >
                    Chọn gói
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}