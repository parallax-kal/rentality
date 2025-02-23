"use client";

import React from 'react';
import { useQuery } from "react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyCard from "@/components/common/PropertyCard";
import { Property } from "@/types";
import Link from "next/link";

const LoadingCard = () => (
  <div className="p-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-3 mt-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

const HomeCarousel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "6",
        sortBy: "reviews",
        sortOrder: "desc",
        ownedByUser: "false",
        bookingStatus: "notBooked",
      });
      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });

  const properties: Property[] = data?.properties || [];

  return (
    <div className="py-8">
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                <LoadingCard />
              </CarouselItem>
            ))
          ) : properties?.length > 0 ? (
            properties.map((property) => (
              <CarouselItem key={property.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                <Link href={`/rentals/${property.id}`}>
                  <PropertyCard property={property} />
                </Link>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem className="pl-2 md:pl-4 basis-full">
              <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                <p className="text-muted-foreground">No properties available</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default HomeCarousel;