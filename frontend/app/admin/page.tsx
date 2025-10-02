'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { Loader2, Shield } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      setIsAuthorized(true);
    } else {
      // Redirect to home page if not an admin
      router.replace('/');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    // This will be shown briefly before the redirect happens
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center space-x-4 mb-8">
        <Shield className="w-10 h-10 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <p>Welcome to the admin dashboard. This area is restricted to administrators.</p>
      {/* Admin components will go here */}
    </div>
  );
}
