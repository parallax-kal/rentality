"use client";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";

export function Landing() {
  return (
    <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center dark:bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text dark:text-transparent bg-gradient-to-b dark:from-neutral-50  text-black dark:to-neutral-400 bg-opacity-50">
          Modern living for everyone
        </h1>
        <p className="mt-4 font-normal text-base text-black dark:text-neutral-300 max-w-lg text-center mx-auto">
          We provide a complete service for the sale, purchase or rental of
          properties. We have been operating worldwide more than 15 years.
        </p>
      </div>
    </div>
  );
}
