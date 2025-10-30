'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Tính năng quản lý đơn hàng đã được tạm dừng</h3>
          <p className="text-muted-foreground mb-4">
            Tính năng quản lý đơn hàng hiện tại không khả dụng. Bạn sẽ được chuyển hướng về trang admin.
          </p>
          <Link href="/admin">
            <Button>Về trang admin</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}