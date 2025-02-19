"use client";

import { SessionProvider } from "next-auth/react";
import React, { PropsWithChildren } from "react";

const DashProviders = ({ children }: PropsWithChildren) => {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
};

export default DashProviders;
