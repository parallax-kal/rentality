"use client";

import { useQuery } from "react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Property } from "@/types";

const TestimonialSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

export const Testimonials = () => {
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      // Fetch reviews from top-rated properties
      const res = await fetch("/api/properties?sortBy=reviews&limit=5");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data: { properties: Property[] } = await res.json();

      // Extract and format reviews from properties
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg border">
            <TestimonialSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Don't render if no reviews
  if (!reviewsData || reviewsData.length === 0) {
    return null;
  }

  return <AnimatedTestimonials testimonials={reviewsData} />;
};

export default Testimonials;
