"use client";

import { useQuery } from "react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Property } from "@/types";

const TestimonialSkeleton = () => (
  <div className="flex justify-center items-center h-full">
    <div className="space-y-4 max-w-[14rem]">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);

export const Testimonials = () => {
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/properties?sortBy=reviews&limit=5");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data: { properties: Property[] } = await res.json();

      const formattedReviews = data.properties
        .flatMap((property) =>
          property.reviews.map((review) => ({
            quote: review.comment,
            name: review.renter.name,
            designation: `Stayed at ${property.title}`,
            src: review.renter.image,
            rating: review.rating,
          }))
        )
        .filter((review) => review.quote && review.name) // Filter out incomplete reviews
        .slice(0, 5); // Limit to 5 reviews

      return formattedReviews;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <TestimonialSkeleton />;
  }

  if (!reviewsData || reviewsData.length === 0) {
    return null;
  }

  return <AnimatedTestimonials testimonials={reviewsData} />;
};

export default Testimonials;