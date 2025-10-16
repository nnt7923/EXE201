'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for the itinerary for type safety
interface Itinerary {
  _id: string;
  title: string;
  date: string;
  description?: string;
}

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setIsLoading(true);
        const response = await api.getItineraries();
        if (response.success && response.data && response.data.itineraries) {
          setItineraries(response.data.itineraries);
        } else {
          setError(response.message || 'Failed to fetch itineraries');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch itineraries. Please make sure you are logged in.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lịch trình của tôi</h1>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
          <Link href="/itineraries/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tạo lịch trình mới
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!isLoading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {itineraries.length > 0 ? (
            itineraries
              .filter((itinerary) => itinerary._id) // Filter out items without valid _id
              .map((itinerary) => (
              <Link href={`/itineraries/${itinerary._id}`} key={itinerary._id}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className='truncate'>{itinerary.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      {new Date(itinerary.date).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {itinerary.description || 'Chưa có mô tả'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold">Chưa có lịch trình nào</h3>
                <p className="text-muted-foreground mt-2">Bắt đầu tạo một kế hoạch cho chuyến đi của bạn ngay!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
