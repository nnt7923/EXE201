'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OrdersPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Chức năng đặt phòng đã được tạm dừng</h3>
          <p className="text-muted-foreground mb-4">
            Chức năng quản lý đơn hàng hiện tại không khả dụng. Bạn sẽ được chuyển hướng về trang chủ.
          </p>
          <Link href="/">
            <Button>Về trang chủ</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}