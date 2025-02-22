/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { useRecoilState } from "recoil";
import { redirectAtom } from "@/lib/atom";

const queryClient = new QueryClient();

const DashProviders = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={queryClient}>
        <SessionLoaderProvider>{children}</SessionLoaderProvider>
      </QueryClientProvider>
      <Toaster />
    </SessionProvider>
  );
};

const SessionLoaderProvider = ({ children }: PropsWithChildren) => {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [redirect, setRedirect] = useRecoilState(redirectAtom);

  useEffect(() => {
    if (redirect && status === "authenticated") {
      router.push(redirect);
      setRedirect(undefined);
    }
  }, [redirect, status]);

  useEffect(() => {
    if (status === "unauthenticated" && pathname.startsWith("/dashboard")) {
      setRedirect(pathname);
      return router.push("/auth/login");
    }
  }, [status, pathname, router]);

  if (status === "loading" && !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <main>{children}</main>;
};

export default DashProviders;
