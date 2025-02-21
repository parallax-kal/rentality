"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { RecoilRoot } from "recoil";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <RecoilRoot>{children}</RecoilRoot>
    </NextThemesProvider>
  );
}
