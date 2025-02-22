"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Rating } from "react-simple-star-rating";
import toast from "react-hot-toast";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Star,
  ArrowLeft,
  ImageIcon,
  MonitorPlay,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPicture } from "@/lib/utils";
import BookForm from "@/components/forms/BookForm";
import { Property } from "@/types";
import PropertyFormComponent from "@/components/forms/PropertyForm";

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const searchParams = useSearchParams();
  const owned = searchParams.get("owned") === "true";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Redirect to rentals page if no property ID provided
  useEffect(() => {
    if (!propertyId) {
      router.push("/rentals");
    }
  }, [propertyId, router]);

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery<Property>({
    queryKey: ["propertyDetails", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;

      const res = await fetch(
        `/api/properties/${propertyId}?ownedByUser=${owned}`
      );
      if (!res.ok) throw new Error("Failed to fetch property details");

      const data = await res.json();
      return data.property;
    },
    enabled: !!propertyId,
  });

  // Check if user has already reviewed this property
  const { data: userReviews } = useQuery({
    queryKey: ["userReviews", propertyId],
    queryFn: async () => {
      if (!propertyId || !session?.user?.id) return null;

      const res = await fetch(
        `/api/reviews?propertyId=${propertyId}&userId=${session.user.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch user reviews");

      return res.json();
    },
    enabled: !!propertyId && !!session?.user?.id,
  });

  const hasUserReviewed = userReviews?.reviews?.length > 0;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property) return;

    if (property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === property.mediaUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property) return;

    if (property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.mediaUrls.length - 1 : prev - 1
      );
    }
  };

  const handleCopyLink = () => {
    if (!property) return;

    navigator.clipboard.writeText(
      `${window.location.origin}/rentals/${property.id}`
    );
    toast.success("Property link copied to clipboard!", {
      position: "bottom-right",
    });
  };

  const submitReview = async () => {
    if (!property || !session?.user?.id) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please provide a review comment");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setReviewRating(0);
      setReviewComment("");
      setIsReviewDialogOpen(false);

      // Refetch property details to update reviews
      queryClient.invalidateQueries(["propertyDetails", propertyId]);
      queryClient.invalidateQueries(["userReviews", propertyId]);
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    toast.promise(
      fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            throw new Error(result.error || "Something went wrong");
          }
        }),
      {
        loading: "Deleting " + property?.title,
        error: (error) =>
          error?.response?.data?.message ?? "Error deleting " + property?.title,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
          router.push("/rentals");
          return property?.title + " deleted successfully.";
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Loading property details...
        </p>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
            <CardDescription>
              The property you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/rentals")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rentals
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const userCanReview =
    session?.user?.id &&
    session?.user?.id !== property.userId &&
    !hasUserReviewed;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 hover:bg-secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">
                  {property.rating?.toFixed(1) || "New"}{" "}
                  {property.reviews.length > 0 &&
                    `(${property.reviews.length} reviews)`}
                </span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span>{property.location}</span>
            </div>
          </div>

          {/* Property Images */}
          <div className="relative rounded-xl overflow-hidden bg-black/5 border">
            <div className="aspect-[16/9] flex items-center justify-center w-full relative">
              {property.mediaUrls.length > 0 ? (
                isPicture(property.mediaUrls[currentImageIndex]) ? (
                  <Image
                    src={property.mediaUrls[currentImageIndex]}
                    alt={`${property.title} - image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <video
                    src={property.mediaUrls[currentImageIndex]}
                    controls
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <ImageIcon className="h-24 w-24 text-gray-400" /> // Shows image icon if no media
              )}

              {property.mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1}/{property.mediaUrls.length}
                  </div>
                </>
              )}
            </div>

            {property.mediaUrls.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto pb-2">
                {property.mediaUrls.map((media, idx) => (
                  <div
                    key={idx}
                    className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                      idx === currentImageIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    {isPicture(media) ? (
                      <Image
                        src={media}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-black h-full w-full flex items-center justify-center">
                        <MonitorPlay className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Details & Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({property.reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {property.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-6">
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.longitude},${property.latitude}`}
                />
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="flex flex-col gap-6">
                {property.reviews.length > 0 ? (
                  property.reviews.map((review) => (
                    <Card key={review.id} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-4">
                          <Image
                            src={
                              review.renter.image ||
                              "/images/placeholder-user.png"
                            }
                            alt={review.renter.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-base">
                              {review.renter.name}
                            </CardTitle>
                            <div className="flex items-center mt-1">
                              <Rating
                                initialValue={review.rating}
                                readonly
                                rtl={true}
                                size={16}
                              />
                              <span className="ml-2 text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                )}

                {userCanReview && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setIsReviewDialogOpen(true)}
                      className="w-full"
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {property.pricePerNight.toLocaleString()} RWF
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / night
                  </span>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>
                      {property.rating?.toFixed(1) || "New"}{" "}
                      {property.reviews.length > 0 &&
                        `• ${property.reviews.length} reviews`}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Booking Button or Host Actions */}
                {session?.user?.id === property.userId ? (
                  <div className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Edit Property
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {property.title}</DialogTitle>
                        </DialogHeader>
                        <PropertyFormComponent
                          property={property}
                          closeModal={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["propertyDetails", propertyId],
                            });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleDeleteProperty}
                      variant="destructive"
                      className="w-full"
                    >
                      Delete Property
                    </Button>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full mb-4">Book Now</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book {property.title}</DialogTitle>
                      </DialogHeader>
                      <BookForm
                        property={property}
                        onBook={() => {
                          queryClient.invalidateQueries({
                            queryKey: ["propertyDetails", propertyId],
                          });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full flex items-center gap-2 mt-4"
                >
                  <Copy className="h-4 w-4" /> Share Property
                </Button>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center text-sm text-muted-foreground">
                  <p>Total Bookings: {property._count?.bookings || 0}</p>
                </div>
              </CardFooter>
            </Card>

            {/* Host Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">About the Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-bold">
                      {property.host?.name?.charAt(0) || "H"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {property.host?.name || "Property Host"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Host since {new Date(property.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {property.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Your Rating</Label>
              <div className="mt-2 ">
                <Rating
                  onClick={(rate: number) => setReviewRating(rate)}
                  initialValue={reviewRating}
                  size={30}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="What did you like or dislike about your stay?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={isSubmittingReview}>
              {isSubmittingReview && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailsPage;
