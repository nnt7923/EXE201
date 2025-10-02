'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MockCheckoutForm } from '@/components/mock-checkout-form'; // Changed import
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

// Định nghĩa kiểu dữ liệu cho một gói
interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  // const [clientSecret, setClientSecret] = useState<string | null>(null); // Removed clientSecret
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'succeeded' | 'failed'>('idle');

  useEffect(() => {
    if (!packageId) {
        setLoading(false);
        setError("Không tìm thấy mã gói.");
        return;
    };

    async function setupCheckout() {
      try {
        // Call the updated API method
        const result = await api.getCheckoutDetails(packageId);

        if (result.success && result.data) {
          setPackage(result.data.package);
        } else {
          throw new Error(result.message || 'Không thể tải thông tin gói.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    setupCheckout();
  }, [packageId]);

  // Updated success handler
  const handlePaymentSuccess = () => {
    console.log(`Mock Payment successful!`);
    setPaymentStatus('succeeded');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[80vh]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
        <div className="container mx-auto py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Đã có lỗi xảy ra</h1>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={() => router.push('/pricing')} className="mt-6">Quay lại trang chọn gói</Button>
        </div>
    );
  }

  if (paymentStatus === 'succeeded') {
    return (
        <div className="container mx-auto py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
            <p className="text-muted-foreground mt-2">Cảm ơn bạn đã mua gói. Lượt tạo AI đã được cộng vào tài khoản của bạn (giả lập).</p>
            <Button onClick={() => router.push('/itineraries/create')} className="mt-6">Bắt đầu tạo lịch trình</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12 max-w-2xl">
        {pkg ? ( // Condition changed to only check for pkg
            <Card>
                <CardHeader>
                    <CardTitle>Xác nhận thanh toán</CardTitle>
                    <CardDescription>Bạn đang thanh toán cho gói: <span className="font-bold text-primary">{pkg.name}</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{pkg.name} (+{pkg.credits} lượt tạo)</p>
                        </div>
                        <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                        </p>
                    </div>
                    {/* Use the new MockCheckoutForm */}
                    <MockCheckoutForm onSuccess={handlePaymentSuccess} />
                </CardContent>
            </Card>
        ) : (
            // This should ideally not be shown if loading and error states are handled properly
            <p>Đang tải thông tin thanh toán...</p>
        )}
    </div>
  );
}