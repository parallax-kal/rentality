import Navbar from "@/components/common/Navbar";
// import DashProviders from "@/providers/dash-provider";
import React, { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main className="mt-20">{children}</main>
    </>
  );
};

export default DashboardLayout;
