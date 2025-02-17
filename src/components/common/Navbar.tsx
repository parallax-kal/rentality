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

const Navbar = () => {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  const navs = [
    { name: "Home", href: "/" },
    { name: "Rentals", href: "/properties" },
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
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            {session.user?.role === "HOST" && (
              <DropdownMenuItem>
                <Link href="/host/dashboard" className="w-full">
                  Host Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Link href="/bookings" className="w-full">
                My Bookings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/api/auth/signout" className="w-full">
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}
      <ModeToggle />
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center px-4 sm:px-8 lg:px-16 py-2 lg:py-3 justify-between fixed top-0 w-screen z-50 transition-all max-w-[110rem] left-1/2 -translate-x-1/2",
        {
          "bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-70 shadow-sm":
            scrolled,
        }
      )}
    >
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
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {nav.name}
          </Link>
        ))}
      </nav>

      <AuthButtons />
    </div>
  );
};

export default Navbar;
