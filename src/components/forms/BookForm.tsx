/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format, differenceInDays } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { renterBookingSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useSetRecoilState } from "recoil";
import { redirectAtom } from "@/lib/atom";
import { useRouter } from "next/navigation";
import { Property } from "@/types";

const BookForm = ({
  property,
  onBook,
}: {
  onBook: () => void;
  property: Property;
}) => {
  const [totalCost, setTotalCost] = useState(0);
  const defaultTo = addDays(new Date(), 7);
  const [nights, setNights] = useState(
    differenceInDays(defaultTo, new Date()) + 1
  );

  const { data: session } = useSession();

  const form = useForm<z.infer<typeof renterBookingSchema>>({
    resolver: zodResolver(renterBookingSchema),
    defaultValues: {
      checkin: {
        from: new Date(),
        to: defaultTo,
      },
      totalCost: property.pricePerNight * nights,
    },
  });

  // Calculate total cost when dates change
  useEffect(() => {
    const dateRange = form.watch("checkin");
    if (dateRange.from && dateRange.to) {
      const nightCount = differenceInDays(dateRange.to, dateRange.from) + 1;
      const totalPrice = nightCount * property.pricePerNight;
      setNights(nightCount);
      setTotalCost(totalPrice);
      form.setValue("totalCost", totalPrice);
    }
  }, [form.watch("checkin"), property]);
  const setRedirect = useSetRecoilState(redirectAtom);
  const router = useRouter();

  function onSubmit(data: z.infer<typeof renterBookingSchema>) {
    const propertyId = property.id;
    if (!session?.user) {
      toast.error("You need to be logged in to book a property.");
      setRedirect(`/rentals?id=${propertyId}`);
      router.push("/auth/login");
      return;
    }
    toast.promise(
      fetch(
        `/api/properties/${propertyId}/bookings`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            throw new Error(result.error || "Something went wrong");
          }
        }),
      {
        loading: `Booking ${property.title}...`,
        error: (error) =>
          error?.response?.data?.message ?? "Error booking property.",
        success: () => {
          onBook();
          return property.title + " booked successfully.";
        },
      }
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Book Your Stay</CardTitle>
            <CardDescription>
              Select dates to see availability and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-0">
            <FormField
              control={form.control}
              name="checkin"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel className="font-medium">Select Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "MMM d, yyyy")} –{" "}
                                {format(field.value.to, "MMM d, yyyy")}
                              </>
                            ) : (
                              format(field.value.from, "MMM d, yyyy")
                            )
                          ) : (
                            <span>Select check-in and check-out dates</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {nights > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">
                    {property.pricePerNight.toLocaleString()}&nbsp;RWF x{" "}
                    {nights} night
                    {nights !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg mt-4">
                  <span>Total</span>
                  <span>{totalCost.toLocaleString()}&nbsp;RWF</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t">
            <Button
              type="submit"
              variant="secondary"
              className="w-full bg-primary mt-3 py-4 hover:bg-primary/50 text-base font-semibold"
            >
              Book Now
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default BookForm;
