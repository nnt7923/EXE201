'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, PlusCircle, Trash2, Pencil, Settings } from 'lucide-react';

// --- INTERFACES ---
interface PlaceImage {
  _id?: string;
  url: string;
  alt: string;
}

interface Place {
  _id: string;
  name: string;
  images: PlaceImage[];
  // Add other fields as needed for the edit form
}

// --- DETAIL SHEET COMPONENTS ---

function AddImageDialog({ place, onImageAdded }: { place: Place; onImageAdded: (placeId: string, newImages: PlaceImage[]) => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập URL hình ảnh.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.addImageByUrl(place._id, imageUrl, altText);
      if (response.success && response.data) {
        toast({ title: 'Thành công', description: 'Đã thêm ảnh mới vào địa điểm.' });
        onImageAdded(place._id, response.data.place.images);
        setImageUrl('');
        setAltText('');
        setIsOpen(false); // Close dialog on success
      } else {
        throw new Error(response.message || 'Không thể thêm ảnh');
      }
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm ảnh mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm ảnh cho "{place.name}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="altText"
              placeholder="Mô tả ảnh (ví dụ: không gian quán)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Hủy</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu ảnh
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImageManager({ place, onUpdate }: { place: Place, onUpdate: (updatedPlace: Place) => void }) {
  const { toast } = useToast();

  const handleDeleteImage = async (imageId: string) => {
    if (!imageId) return;
    try {
      const response = await api.deletePlaceImage(place._id, imageId);
      if (response.success && response.data) {
        toast({ title: 'Thành công', description: 'Đã xóa hình ảnh.' });
        onUpdate(response.data.place);
      } else {
        throw new Error(response.message || 'Không thể xóa hình ảnh');
      }
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <AddImageDialog place={place} onImageAdded={(placeId, newImages) => onUpdate({ ...place, images: newImages })} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
        {place.images.map((img) => (
          <Card key={img._id} className="relative group">
            <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover rounded-t-lg" />
            <div className="p-2 text-xs truncate">
              <p className="font-medium">{img.alt || '(No alt text)'}</p>
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-7 w-7">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa ảnh này?</AlertDialogTitle>
                    <AlertDialogDescription>Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa ảnh này không?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteImage(img._id!)}>
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
      {place.images.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Không có hình ảnh nào.</p>}
    </div>
  );
}

function PlaceEditForm({ place }: { place: Place }) {
  // Placeholder for the full edit form
  return (
    <div className="p-8 border rounded-lg text-center">
      <Pencil className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium">Chỉnh sửa thông tin địa điểm</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Chức năng chỉnh sửa chi tiết địa điểm sẽ được triển khai ở đây.
      </p>
    </div>
  );
}

function PlaceDetailSheet({ place, onUpdate }: { place: Place, onUpdate: (updatedPlace: Place) => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Quản lý
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{place.name}</SheetTitle>
          <SheetDescription>Chỉnh sửa thông tin và quản lý hình ảnh cho địa điểm này.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Tabs defaultValue="images">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images">Quản lý ảnh</TabsTrigger>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
            </TabsList>
            <TabsContent value="images" className="mt-4">
              <ImageManager place={place} onUpdate={onUpdate} />
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <PlaceEditForm place={place} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- MAIN LIST COMPONENTS ---

function PlaceImagesCell({ images }: { images: PlaceImage[] }) {
  if (images.length === 0) {
    return <span className="text-sm text-muted-foreground">Chưa có ảnh</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {images.slice(0, 5).map((img, index) => (
        <div key={img._id || index} className="relative w-12 h-12">
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover rounded-md border" />
        </div>
      ))}
      {images.length > 5 && <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-md">+{images.length - 5}</div>}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-10 w-28" />
        </div>
      ))}
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function AdminPlaceManager() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const response = await api.getPlaces({ limit: 100, sort: '-updatedAt' });
        if (response.success && response.data) {
          setPlaces(response.data.places);
        } else {
          throw new Error(response.message || 'Failed to fetch places');
        }
      } catch (error: any) {
        toast({ title: 'Lỗi', description: `Không thể tải danh sách địa điểm: ${error.message}`, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, [toast]);

  const handlePlaceUpdate = (updatedPlace: Place) => {
    setPlaces(currentPlaces =>
      currentPlaces.map(p => (p._id === updatedPlace._id ? updatedPlace : p))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Địa điểm</CardTitle>
        <CardDescription>
          Xem và quản lý chi tiết các địa điểm trong hệ thống.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Tên địa điểm</TableHead>
                <TableHead>Hình ảnh</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.length > 0 ? (
                places.map((place) => (
                  <TableRow key={place._id}>
                    <TableCell className="font-medium">{place.name}</TableCell>
                    <TableCell>
                      <PlaceImagesCell images={place.images} />
                    </TableCell>
                    <TableCell className="text-right">
                       <PlaceDetailSheet place={place} onUpdate={handlePlaceUpdate} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Không có địa điểm nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}