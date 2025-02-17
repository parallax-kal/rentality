import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { ThemeProvider } from "@/providers/theme-provider";

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
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
