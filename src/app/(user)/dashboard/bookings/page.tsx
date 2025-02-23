"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import BookForm from "@/components/forms/BookForm";
import PaginationContainer from "@/components/common/Pagination";
import { Booking } from "@/types";
import BookingCard from "@/components/common/BookingCard";

const BookingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: bookingsData,
    isLoading,
    isError,
  } = useQuery<{ bookings: Booking[]; total: number }>({
    queryKey: ["userBookings", page],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const bookings = bookingsData?.bookings || [];
  const totalBookings = bookingsData?.total || 0;
  const totalPages = Math.ceil(totalBookings / limit);

  const handleCancelBooking = async (booking: Booking) => {
    toast.promise(
      fetch(`/api/properties/${booking.propertyId}/bookings/${booking.id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            throw new Error(result.error || "Something went wrong");
          }
        }),
      {
        loading: "Canceling booking...",
        error: (error) => error?.message ?? "Error canceling booking",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["userBookings"] });
          return "Booking canceled successfully.";
        },
      }
    );
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditBookingDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    setIsEditBookingDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (isError || !bookingsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error Loading Bookings</CardTitle>
            <CardDescription>
              There was an error loading your bookings. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 hover:bg-secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>

      {bookings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                onEdit={handleEditBooking}
              />
            ))}
          </div>

          <PaginationContainer
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You have no bookings yet. Start exploring properties!
          </p>
          <Button onClick={() => router.push("/rentals")} className="mt-4">
            Browse Rentals
          </Button>
        </div>
      )}

      <Dialog
        open={isEditBookingDialogOpen}
        onOpenChange={setIsEditBookingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <BookForm
              property={selectedBooking.property}
              booking={selectedBooking}
              onBook={handleUpdateBooking}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditBookingDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
