"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";

const BookingsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userBookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      return data.bookings;
    },
    enabled: !!session?.user?.id, // Only fetch if the user is logged in
  });

  const handleCancelBooking = async (bookingId: string) => {
    toast.promise(
      fetch(`/api/bookings/${bookingId}`, {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (isError || !bookings) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                    <Image
                      src={booking.property.mediaUrls[0] || "/images/placeholder-property.jpg"}
                      alt={booking.property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {booking.property.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {booking.property.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Check-In:</span>{" "}
                    {moment(booking.checkInDate).format("DD/MM/YYYY")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Check-Out:</span>{" "}
                    {moment(booking.checkOutDate).format("DD/MM/YYYY")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Total Cost:</span>{" "}
                    {booking.totalCost.toLocaleString()} RWF
                  </p>
                  <p className="text-sm">
                    Status:{" "}
                    <span
                      className={cn("font-semibold", {
                        "text-green-500": booking.status === "CONFIRMED",
                        "text-red-500": booking.status === "CANCELED",
                        "text-yellow-500": booking.status === "PENDING",
                      })}
                    >
                      {booking.status}
                    </span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {booking.status === "PENDING" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push(`/rentals/${booking.property.id}`)}
                >
                  View Property
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
    </div>
  );
};

export default BookingsPage;