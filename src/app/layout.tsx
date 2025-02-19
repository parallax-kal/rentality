import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import DashProviders from "@/providers/dash-provider";

export const metadata: Metadata = {
  title: "Rentality",
  description: "Rentality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashProviders>{children}</DashProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
