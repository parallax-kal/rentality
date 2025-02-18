import Navbar from "@/components/common/Navbar";
import DashProviders from "@/providers/dash-provider";
import React, { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <DashProviders>
      <Navbar />
      {children}
    </DashProviders>
  );
};

export default DashboardLayout;
