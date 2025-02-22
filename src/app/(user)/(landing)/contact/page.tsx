"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re here to help! Reach out to us for any questions or
            inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-[80rem] mx-auto px-4 sm:px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Send Us a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input type="text" placeholder="First Name" required />
                <Input type="text" placeholder="Last Name" required />
              </div>
              <Input type="email" placeholder="Email Address" required />
              <Input type="text" placeholder="Subject" required />
              <Textarea
                placeholder="Your Message"
                rows={5}
                className="resize-none"
                required
              />
              <Button type="submit" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Our Office</p>
                  <p className="text-muted-foreground">
                    Norvege, Kigali, Nyarugenge, Rwanda
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Phone Number</p>
                  <a href="tel:+250785964206" className="text-muted-foreground">
                    +250785964206
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">Email Address</p>
                  <a
                    href="mailto:gthecoderkalisaineza@gmail.com"
                    className="text-muted-foreground"
                  >
                    gthecoderkalisaineza@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
