"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import { Loader2 } from "lucide-react";

const DashProviders = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider basePath="/api/auth">
      <SessionLoaderProvider>{children}</SessionLoaderProvider>
    </SessionProvider>
  );
};

const SessionLoaderProvider = ({ children }: PropsWithChildren) => {
  const {status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && pathname.startsWith("/dashboard")) {
      router.replace("/auth/login");
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <main>{children}</main>;
};

export default DashProviders;
