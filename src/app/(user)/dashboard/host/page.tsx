"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Loader2, Plus } from "lucide-react";
import PropertyForm from "@/components/forms/PropertyForm";

export default function HostDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ["hostProperties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });

  // Handle form submission
  const addPropertyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/properties", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add property");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostProperties"] }); // Refresh list
      toast.success("Property added successfully!");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to add property. Try again.");
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Properties</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="mr-2 h-5 w-5" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <PropertyForm onSubmit={addPropertyMutation.mutateAsync} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <div key={property.id} className="border rounded-lg p-4 shadow-md">
              <img src={property.image} alt={property.title} className="w-full h-40 object-cover rounded-md" />
              <h2 className="text-lg font-semibold mt-2">{property.title}</h2>
              <p className="text-sm text-gray-500">{property.location}</p>
              <p className="font-bold text-gray-700">${property.price}/night</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
