"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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
import { Booking } from "@/types";
import { isPicture } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
  onCancel: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
}

const BookingCard = ({ booking, onCancel, onEdit }: BookingCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === booking.property.mediaUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? booking.property.mediaUrls.length - 1 : prev - 1
      );
    }
  };

  return (
    <Card key={booking.id} className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col items-start gap-4">
          <div className="relative flex justify-center items-center w-full h-48 rounded-lg overflow-hidden">
            {booking.property.mediaUrls.length > 0 ? (
              isPicture(booking.property.mediaUrls[currentImageIndex]) ? (
                <Image
                  src={booking.property.mediaUrls[currentImageIndex]}
                  alt={`${booking.property.title} - image ${
                    currentImageIndex + 1
                  }`}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <video
                  src={booking.property.mediaUrls[currentImageIndex]}
                  controls
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <ImageIcon className="h-24 w-24 text-gray-400" />
            )}

            {booking.property.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {currentImageIndex + 1}/{booking.property.mediaUrls.length}
                </div>
              </>
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{booking.property.title}</CardTitle>
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

        {/* Host Information */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            {booking.property.host?.image ? (
              <Image
                src={booking.property.host.image}
                alt={booking.property.host.name || "Host"}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-bold">
                  {booking.property.host?.name?.charAt(0) || "H"}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {booking.property.host?.name || "Property Host"}
            </p>
            {booking.property.host?.email && (
              <p className="text-xs text-muted-foreground">
                {booking.property.host.email}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {booking.status === "PENDING" && (
          <Button variant="destructive" onClick={() => onCancel(booking)}>
            Cancel Booking
          </Button>
        )}
        <Button variant="outline" onClick={() => onEdit(booking)}>
          Edit Booking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
