'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho một gói
interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
}

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Khởi tạo router

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('http://localhost:5000/api/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const result = await response.json();
        if (result.success) {
          setPackages(result.data.packages);
        } else {
          throw new Error(result.message || 'Could not retrieve packages');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, []);

  // Cập nhật hàm này để điều hướng
  const handlePurchaseClick = (packageId: string) => {
    // Chuyển người dùng đến trang checkout với ID của gói
    router.push(`/checkout/${packageId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-red-500">Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Mua thêm lượt tạo lịch trình AI
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Chọn gói phù hợp với bạn và bắt đầu tạo những chuyến đi tuyệt vời!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card key={pkg._id} className="flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-5xl font-extrabold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                </span>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span><span className="font-bold text-foreground">{pkg.credits}</span> lượt tạo lịch trình AI</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Gợi ý thông minh từ Gemini</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-lg py-6"
                onClick={() => handlePurchaseClick(pkg._id)}
              >
                Mua ngay
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}