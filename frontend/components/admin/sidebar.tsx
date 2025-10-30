'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Shield, Users, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin/places', label: 'Quản lý Địa điểm', icon: MapPin },
  { href: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
  { href: '/admin/subscriptions', label: 'Quản lý Đăng ký', icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? 'default' : 'ghost' }),
                'w-full justify-start'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về trang chủ
        </Link>
      </div>
    </aside>
  );
}
