"use client";

import React from "react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggler";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Rentals", href: "/rentals" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
  ];

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/KalisaIneza" },
    { name: "Instagram", href: "https://instagram.com/giovanni__kali" },
    { name: "LinkedIn", href: "https://linkedin.com/in/kalisa-ineza-giovanni" },
  ];

  return (
    <div className="bg-background border-t mt-20">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground">
              Your trusted partner for finding the perfect rental spaces. Explore
              our wide range of properties and enjoy a seamless booking
              experience.
            </p>
            <ModeToggle />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Norvege, Nyarugenge, Kigali, Rwanda</span>
              </li>
              <a href="tel:+250785964206" className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-5 h-5" />
                <span>+250785964206</span>
              </a>
              <a href="mailto:gthecoderkalisaineza@gmail.com" className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <span>gthecoderkalisaineza@gmail.com</span>
              </a>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subscribe to Our Newsletter</h3>
            <p className="text-muted-foreground">
              Get the latest updates and exclusive offers straight to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Rentality. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;