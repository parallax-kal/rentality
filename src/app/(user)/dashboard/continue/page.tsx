"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowRight, Building2, Home, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const roleSchema = z.object({
  role: z.enum(["RENTER", "HOST"], {
    required_error: "Please select a role",
  }),
});

type RoleForm = z.infer<typeof roleSchema>;

export default function ContinuePage() {
  const router = useRouter();
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  });

  async function onSubmit(data: RoleForm) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: data.role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      await update();
      router.push(data.role === "HOST" ? "//dashboard/host" : "/");
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const roles = [
    {
      id: "RENTER",
      title: "I want to rent properties",
      description: "Browse and book properties listed by hosts",
      icon: Home,
    },
    {
      id: "HOST",
      title: "I want to list my properties",
      description: "List your properties and manage bookings",
      icon: Building2,
    },
  ];

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative z-10 hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Join our community of renters and hosts to experience hassle-free
              property rentals.
            </p>
            <footer className="text-sm">Welcome aboard</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] lg:w-[400px]">
          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Choose your role
              </CardTitle>
              <CardDescription>
                Select how you&apos;d like to use RentHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-4"
                          >
                            {roles.map((role) => (
                              <label
                                key={role.id}
                                htmlFor={role.id}
                                className={cn(
                                  "flex cursor-pointer items-start space-x-4 rounded-lg border p-4 hover:bg-muted",
                                  field.value === role.id && "border-primary"
                                )}
                              >
                                <RadioGroupItem
                                  id={role.id}
                                  value={role.id}
                                  className="mt-1"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center">
                                    <role.icon className="mr-2 h-5 w-5" />
                                    <p className="font-medium leading-none">
                                      {role.title}
                                    </p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {role.description}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
