import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isPicture = (url: string) => {
  const ext = url?.split(".").pop();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext?.toLowerCase() || "");
};

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
