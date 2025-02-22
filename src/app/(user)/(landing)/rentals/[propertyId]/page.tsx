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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, isPicture } from "@/lib/utils";
import BookForm from "@/components/forms/BookForm";
import { Property, Review } from "@/types";
import PropertyFormComponent from "@/components/forms/PropertyForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "@/lib/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import moment from "moment";

const PropertyDetailsPage = () => {
  const { propertyId } = useParams();
  const searchParams = useSearchParams();
  const owned = searchParams.get("owned") === "true";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [isEditPropertyFormOpen, setIsEditPropertyFormOpen] = useState(false);
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

  const [isEditReviewDialogOpen, setIsEditReviewDialogOpen] =
    useState<Review | null>(null);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: isEditReviewDialogOpen?.rating ?? 0,
      comment: isEditReviewDialogOpen?.comment ?? "",
    },
  });

  useEffect(() => {
    if (isEditReviewDialogOpen) {
      form.reset({
        rating: isEditReviewDialogOpen.rating,
        comment: isEditReviewDialogOpen.comment,
      });
    }
  }, [isEditReviewDialogOpen, form]);

  const onReviewSubmit = async (data: z.infer<typeof reviewSchema>) => {
    if (!property || !session?.user?.id) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    toast.promise(
      fetch(
        isEditReviewDialogOpen
          ? `/api/properties/${property.id}/reviews/${isEditReviewDialogOpen.id}`
          : `/api/properties/${property.id}/reviews`,
        {
          method: isEditReviewDialogOpen ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      ).then(async(response) => {
        if (!response.ok) {
          const error = await response.json();
          console.log(error);
          throw error;
        }
      }),
      {
        loading: isEditReviewDialogOpen
          ? `Updating review for ${property.title}`
          : `Reviewing ${property.title}`,
        error: (error) =>
          error?.message ?? isEditReviewDialogOpen
            ? `Error updating review for ${property.title}`
            : `Error reviewing ${property.title}`,
        success: () => {
          queryClient.invalidateQueries(["propertyDetails", propertyId]);
          queryClient.invalidateQueries(["userReviews", propertyId]);
          setIsReviewDialogOpen(false);
          setIsEditReviewDialogOpen(null);
          return isEditReviewDialogOpen
            ? `Review for ${property.title} deleted successfully!`
            : `Reviewed ${property.title}`;
        },
      }
    );
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!property || !session?.user?.id) {
      toast.error("You must be logged in to delete a review");
      return;
    }

    toast.promise(
      fetch(`/api/properties/${property.id}/reviews/${reviewId}`, {
        method: "DELETE",
      }),
      {
        loading: `Deleting review for ${property.title}`,
        error: (error) =>
          error?.message ?? `Error deleting review for ${property.title}`,
        success: () => {
          queryClient.invalidateQueries(["propertyDetails", propertyId]);
          return `Review for ${property.title} deleted successfully!`;
        },
      }
    );
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
        error: (error) => error?.message ?? "Error deleting " + property?.title,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["properties"] });
          router.push("/rentals");
          return property?.title + " deleted successfully.";
        },
      }
    );
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    if (!property) return;

    toast.promise(
      fetch(`/api/properties/${propertyId}/bookings/${bookingId}?ownedByUser=true`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            throw new Error(result.message || "Something went wrong");
          }
        }),
      {
        loading: "Updating booking status...",
        error: (error) => error?.message ?? "Error updating booking status",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["propertyDetails", propertyId],
          });
          return "Booking status updated successfully.";
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
    !property.reviews.find((review) => review?.renter?.id === session.user.id);

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

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews &#40;{property.reviews.length}&#41;
              </TabsTrigger>
              {property.bookings && (
                <TabsTrigger value="bookings">
                  Bookings &#40;{property.bookings.length}&#41;
                </TabsTrigger>
              )}
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
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.latitude},${property.longitude}`}
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
                            src={review.renter.image}
                            alt={review.renter.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-base">
                              <div>{review.renter.name}</div>
                              <span className="text-sm text-muted-foreground">
                                {review.renter.email}
                              </span>
                            </CardTitle>
                            <div className="flex items-center mt-1">
                              <Rating
                                initialValue={review.rating}
                                readonly
                                size={16}
                              />
                              <span className="ml-2 text-sm text-muted-foreground">
                                Last Edited at &nbsp;
                                {moment(review.updatedAt).format(
                                  "DD/MM/YYYY h:mm A"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                      {(session?.user?.id === review.renter.id ||
                        (review.propertyId === property.id &&
                          property.userId === session?.user.id)) && (
                        <CardFooter className="flex gap-2">
                          {session?.user?.id === review.renter.id && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditReviewDialogOpen(review);
                                setIsReviewDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            Delete
                          </Button>
                        </CardFooter>
                      )}
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
            <TabsContent value="bookings">
              {property.bookings && property.bookings.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {property.bookings.map((booking) => (
                    <Card key={booking.id} className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-4">
                          <Image
                            src={
                              booking.renter.image ||
                              "/images/placeholder-user.png"
                            }
                            alt={booking.renter.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-base">
                              <div>{booking.renter.name}</div>
                              <span className="text-sm text-muted-foreground">
                                {booking.renter.email}
                              </span>
                            </CardTitle>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  booking.checkInDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  booking.checkOutDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Status:{" "}
                              <span
                                className={cn("font-semibold", {
                                  "text-green-500":
                                    booking.status === "CONFIRMED",
                                  "text-red-500": booking.status === "CANCELED",
                                  "text-yellow-500":
                                    booking.status === "PENDING",
                                })}
                              >
                                {booking.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <p className="text-gray-700">
                          Total Cost: {booking.totalCost.toLocaleString()} RWF
                        </p>
                        {session?.user?.role === "HOST" &&
                          booking.status === "PENDING" && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                onClick={() => {
                                  handleBookingAction(booking.id, "CONFIRMED");
                                }}
                                className="px-3 py-1 text-white bg-green-500 rounded-md"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => {
                                  handleBookingAction(booking.id, "CANCELLED");
                                }}
                                className="px-3 py-1 text-white bg-red-500 rounded-md"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No bookings yet. Be the first to review!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

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
                {session?.user?.id === property.userId ? (
                  <div className="space-y-4">
                    <Dialog
                      open={isEditPropertyFormOpen}
                      onOpenChange={setIsEditPropertyFormOpen}
                    >
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
                            setIsEditPropertyFormOpen(false);
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
                  <Dialog
                    open={isBookFormOpen}
                    onOpenChange={setIsBookFormOpen}
                  >
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
                          setIsBookFormOpen(false);
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

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">About the Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    {property.host?.image ? (
                      <Image
                        src={property.host.image}
                        alt={property.host.name || "Host"}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {property.host?.name?.charAt(0) || "H"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Host Details */}
                  <div>
                    {/* Host Name */}
                    <p className="font-medium">
                      {property.host?.name || "Property Host"}
                    </p>

                    {/* Host Email */}
                    {property.host?.email && (
                      <p className="text-sm text-muted-foreground">
                        {property.host.email}
                      </p>
                    )}

                    {/* Host Since */}
                    <p className="text-sm text-muted-foreground">
                      Host last updated At
                      {moment(property.updatedAt).format("DD/MM/YYYY h:mm A")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {property.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onReviewSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="rating">Your Rating</FormLabel>
                    <FormControl>
                      <Rating
                        onClick={field.onChange}
                        initialValue={field.value}
                        size={30}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="comment">Your Review</FormLabel>
                    <FormControl>
                      <Textarea
                        id="comment"
                        placeholder="What did you like or dislike about your stay?"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditReviewDialogOpen ? "Edit Review" : "Submit review"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailsPage;
