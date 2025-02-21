import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
export const metadata: Metadata = {
  title: {
    default: "Rentality",
    template: "Rentality | %s",
  },
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
