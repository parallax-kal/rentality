import PropertiesDisplay from "@/components/common/PropertiesDisplay";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Rentals",
  description: "Rentals page",
};

const RentalsPage = () => {
  return <PropertiesDisplay />;
};

export default RentalsPage;
