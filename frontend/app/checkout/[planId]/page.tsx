'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/header';
import { api, isAuthenticated } from '@/lib/api';
import { ArrowLeft, Check, Copy, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  aiSuggestionLimit: number;
}

interface PaymentFormData {
  fullName: string;
  email: string;
  phone: string;
  transferNote: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: '',
    email: '',
    phone: '',
    transferNote: ''
  });

  // Bank transfer information
  const bankInfo = {
    bankName: 'TP Bank',
    accountNumber: '0000 0111 480',
    accountHolder: 'DANG NHAT QUANG',
    branch: 'Chi nhánh Hòa Lạc'
  };

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push(`/auth/login?redirect=/checkout/${planId}`);
      return;
    }

    fetchPlan();
  }, [planId, router]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPlan(planId);
      
      if (response.success && response.data) {
        setPlan(response.data);
      } else {
        setError('Không tìm thấy gói dịch vụ');
      }
    } catch (err: any) {
      console.error('Error fetching plan:', err);
      setError(err.message || 'Không thể tải thông tin gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Đã sao chép',
        description: `${label} đã được sao chép vào clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép. Vui lòng sao chép thủ công.',
        variant: 'destructive'
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập họ tên',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập email',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập số điện thoại',
        variant: 'destructive'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Lỗi',
        description: 'Email không hợp lệ',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !plan) return;

    try {
      setSubmitting(true);
      
      // Create subscription for plan
      const subscriptionData = {
        planId: plan._id,
        customerInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: ''
        },
        paymentMethod: 'bank_transfer',
        customerNotes: `Đăng ký gói ${plan.name} - Thanh toán chuyển khoản. ${formData.transferNote || ''}`
      };

      const response = await api.createSubscription(subscriptionData);

      if (response.success) {
        toast({
          title: 'Đăng ký thành công!',
          description: 'Cảm ơn bạn đã đăng ký gói dịch vụ. Chúng tôi sẽ xác nhận thanh toán trong vòng 24h.',
        });
        
        // Redirect to profile page with subscriptions tab
        router.push('/profile?tab=subscriptions');
      } else {
        throw new Error(response.message || 'Không thể tạo đăng ký');
      }
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      
      // Handle specific error cases
      let errorTitle = 'Lỗi';
      let errorDescription = err.message || 'Không thể tạo đăng ký';
      
      // Check if it's a duplicate subscription error
      if (err.message && err.message.includes('đã có gói') && err.message.includes('đang hoạt động')) {
        errorTitle = 'Gói đã tồn tại';
        errorDescription = err.message;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </>
    );
  }

  if (error || !plan) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Không tìm thấy gói dịch vụ'}
            </h1>
            <Link href="/pricing">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại trang giá
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/pricing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.name === 'Chuyên nghiệp' && (
                  <Badge variant="default">Phổ biến</Badge>
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {plan.price.toLocaleString('vi-VN')}₫
                <span className="text-sm font-normal text-muted-foreground">/tháng</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Tính năng bao gồm:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator className="my-4" />
              
              <div className="text-sm text-muted-foreground">
                <p>• Thanh toán một lần cho 30 ngày sử dụng</p>
                <p>• Hỗ trợ 24/7 qua email</p>
                <p>• Có thể hủy bất cứ lúc nào</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Thông tin thanh toán
              </CardTitle>
              <CardDescription>
                Chúng tôi chỉ hỗ trợ thanh toán qua chuyển khoản ngân hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} data-testid="bank-transfer-form">
                <div className="space-y-4">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Thông tin khách hàng</h4>
                    
                    <div>
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0123456789"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="transferNote">Ghi chú chuyển khoản</Label>
                      <Textarea
                        id="transferNote"
                        name="transferNote"
                        value={formData.transferNote}
                        onChange={(e) => handleInputChange('transferNote', e.target.value)}
                        placeholder={`Thanh toán gói ${plan.name}`}
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Bank Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Thông tin chuyển khoản</h4>
                    
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ngân hàng:</span>
                        <span>{bankInfo.bankName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Số tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{bankInfo.accountNumber}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(bankInfo.accountNumber, 'Số tài khoản')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Chủ tài khoản:</span>
                        <span>{bankInfo.accountHolder}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Số tiền:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {plan.price.toLocaleString('vi-VN')}₫
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(plan.price.toString(), 'Số tiền')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>• Vui lòng chuyển khoản đúng số tiền để được xử lý nhanh chóng</p>
                      <p>• Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận trong vòng 24h</p>
                      <p>• Nếu có vấn đề, vui lòng liên hệ hỗ trợ</p>
                    </div>
                  </div>
                </div>

                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận đăng ký'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}