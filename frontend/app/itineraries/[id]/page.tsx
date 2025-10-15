'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityForm, Activity } from '@/components/itinerary/activity-form';
import { Clock, MapPin, Utensils, Film, Bus, PlusCircle, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// We can re-use the Activity type from the form

interface Itinerary {
  _id: string;
  title: string;
  date: string;
  description?: string;
  activities: Activity[];
}

export default function ItineraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const fetchItinerary = useCallback(async () => {
    try {
      const response = await api.getItinerary(id);
      setItinerary(response as unknown as Itinerary);
    } catch (err) {
      setError('Không thể tải chi tiết lịch trình.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchItinerary();
    }
  }, [id, fetchItinerary]);

  const handleSaveActivity = async (activityToSave: Activity) => {
    if (!itinerary) return;

    let updatedActivities;
    if (editingActivity) {
      // Editing existing activity
      updatedActivities = itinerary.activities.map(act => 
        act._id === editingActivity._id ? { ...act, ...activityToSave } : act
      );
    } else {
      // Adding new activity
      const newActivity = { ...activityToSave, _id: new Date().toISOString() }; // temp ID
      updatedActivities = [...itinerary.activities, newActivity];
    }

    try {
      const activitiesForApi = updatedActivities.map(act => {
        // If the activity is new (i.e., its _id is not in the original itinerary),
        // then we strip the temporary _id before sending to the API.
        if (!itinerary.activities.find(originalAct => originalAct._id === act._id)) {
          const { _id, ...rest } = act;
          return rest;
        }
        return act;
      });

      const updatedItinerary = await api.updateItinerary(id, { activities: activitiesForApi });
      setItinerary(updatedItinerary as unknown as Itinerary);
      setIsFormOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Failed to save activity", error);
      alert("Error: Could not save the activity.");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!itinerary) return;

    const updatedActivities = itinerary.activities.filter(act => act._id !== activityId);
    try {
      const updatedItinerary = await api.updateItinerary(id, { activities: updatedActivities });
      setItinerary(updatedItinerary as unknown as Itinerary);
    } catch (error) {
      console.error("Failed to delete activity", error);
      alert("Error: Could not delete the activity.");
    }
  };

  const handleAddNewClick = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const getActivityIcon = (type: Activity['activityType']) => {
    switch (type) {
      case 'EAT': return <Utensils className="h-5 w-5" />;
      case 'VISIT': return <MapPin className="h-5 w-5" />;
      case 'ENTERTAINMENT': return <Film className="h-5 w-5" />;
      case 'TRAVEL': return <Bus className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  if (!itinerary) {
    return <p className="text-center mt-10">Không tìm thấy lịch trình.</p>;
  }

  return (
    <>
      <ActivityForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveActivity} 
        initialData={editingActivity}
      />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.push('/itineraries')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
        </Button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{itinerary.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {new Date(itinerary.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {itinerary.description && <p className="mt-4 text-gray-600">{itinerary.description}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Dòng thời gian</h2>
            <Button onClick={handleAddNewClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm hoạt động
            </Button>
          </div>
          <div className="space-y-8 border-l-2 border-border ml-3">
              {itinerary.activities.length > 0 ? itinerary.activities.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((activity) => (
                  <div key={activity._id} className="relative pl-8 group">
                      <div className="absolute -left-4 top-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground ring-8 ring-background">
                          {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="absolute top-0 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(activity)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Hoạt động này sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteActivity(activity._id!)} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                      <p className="font-semibold text-md text-primary">{activity.startTime}{activity.endTime ? ` - ${activity.endTime}` : ''}</p>
                      <h3 className="text-xl font-bold mt-1">{
                        (typeof activity.place === 'object' && activity.place?.name) || activity.customPlace
                      }</h3>
                      {typeof activity.place === 'object' && activity.place?.address && (
                        <p className="text-sm text-muted-foreground">
                          {typeof activity.place.address === 'string' 
                            ? activity.place.address 
                            : `${activity.place.address.street}, ${activity.place.address.ward}, ${activity.place.address.district}, ${activity.place.address.city}`
                          }
                        </p>
                      )}
                      {activity.notes && <p className="mt-2 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md">{activity.notes}</p>}
                  </div>
              )) : (
                  <div className="pl-8">
                      <p className="text-muted-foreground">Chưa có hoạt động nào được thêm vào.</p>
                  </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}