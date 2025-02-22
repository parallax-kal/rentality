"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { ModeToggle } from "./mode-toggler";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  const navs = [
    { name: "Home", href: "/" },
    { name: "Rentals", href: "/rentals" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > (window.innerWidth > 1086 ? 100 : 50));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="w-full">
                {session.user.name}
              </Link>
            </DropdownMenuItem>
            {session.user?.role === "HOST" && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/host" className="w-full">
                  Host Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/bookings" className="w-full">
                My Bookings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout" className="w-full">
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      )}
      <ModeToggle />
    </div>
  );

  const pathname = usePathname();

  return (
    <div
      className={cn(
        "z-50 px-4 sm:px-8 lg:px-16 py-2 lg:py-3 border-b fixed top-0 w-screen bg-background transition-all left-1/2 -translate-x-1/2",
        {
          "bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-70 shadow-sm":
            scrolled,
        }
      )}
    >
      <div className="max-w-[80rem] mx-auto flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 mt-2">
            {navs.map((nav) => (
              <DropdownMenuItem key={nav.name}>
                <Link href={nav.href} className="w-full">
                  {nav.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {navs.map((nav) => (
            <Link
              key={nav.name}
              href={nav.href}
              className={cn(
                "font-medium text-lg text-muted-foreground hover:text-primary transition-colors",
                {
                  "text-primary font-semibold": pathname === nav.href,
                }
              )}
            >
              {nav.name}
            </Link>
          ))}
        </nav>

        <AuthButtons />
      </div>
    </div>
  );
};

export default Navbar;
