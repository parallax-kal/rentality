import { z } from "zod";
import { zfd } from "zod-form-data";

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
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(1, "Price must be at least $1"),
  location: z.string().min(5, "Please select a valid location"),
  longitude: z.number(),
  latitude: z.number(),
  media: zfd.repeatable(
    z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Each file must be 10MB or less",
    })
  ),
});
