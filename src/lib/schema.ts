import { z } from "zod";
import { zfd } from "zod-form-data";
import { BookingStatus } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["RENTER", "HOST"], {
    required_error: "Please select a role",
  }),
});

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.string().regex(/^(?!0(\.0+)?$)(\d+(\.\d+)?|\.\d+)$|^([1-9]\d*)$/, {
    message: "Price must be a number greater than or equal to 1",
  }),
  location: z.string().min(3, "Location must be at least 3 characters."),
  longitude: z.number(),
  latitude: z.number(),
  media: z.array(
    zfd.file().refine((file) => file.size < MAX_FILE_SIZE, {
      message: "File can't be bigger than 1MB.",
    })
  ),
});

export const renterBookingSchema = z.object({
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
});

export const hostBookingUpdateSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: "Invalid status. Use CONFIRMED or CANCELED" }),
  }),
});
