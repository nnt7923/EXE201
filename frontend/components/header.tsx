'use client';

import { Search, Menu, User, Bell, LogOut, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api"; // Import helpers

// Define a type for the user object for better type safety
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  // Add other fields you expect in the user object
}

export function Header() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // The user object is now stored in localStorage by setAuthData
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout(); // Use the centralized logout function
  };

  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Ăn Gì Ở Đâu Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Ăn Gì Ở Đâu</h1>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Link href="/search">
                <Input
                  placeholder="Tìm quán ăn, nhà trọ..."
                  className="pl-10 bg-input border-border cursor-pointer"
                  readOnly
                />
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {/* Admin Dashboard Link */}
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" title="Admin Dashboard">
                      <Shield className="w-5 h-5" />
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Bell className="w-5 h-5" />
                </Button>

                <Link href="/itineraries">
                  <Button variant="ghost" size="icon" title="My Itineraries">
                    <Calendar className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" title="My Profile">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button>Đăng nhập</Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Link href="/search">
              <Input
                placeholder="Tìm quán ăn, nhà trọ..."
                className="pl-10 bg-input border-border cursor-pointer"
                readOnly
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
