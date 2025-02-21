"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import PropertyForm from "@/components/forms/PropertyForm";
import { Property } from "@/types";
import PropertyCard from "@/components/common/PropertyCard";

export default function HostDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState([]);

  const limit = 12;
  // Fetch properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["hostProperties"],
    queryFn: async () => {
      const res = await fetch(`/api/properties?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      return data.properties;
    },
  });

  console.log(properties);

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
            <PropertyForm
              closeModal={() => {
                queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
                setIsModalOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties?.map((property) => (
            <PropertyCard property={property} key={property.id} />
          ))}
        </div>
      )}
    </div>
  );
}
