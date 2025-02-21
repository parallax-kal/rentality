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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import PropertyForm from "@/components/forms/PropertyForm";
import PropertyCard from "@/components/common/PropertyCard";
import { useSession } from "next-auth/react";

import { Property } from "@/types";
import PaginationContainer from "@/components/common/Pagination";

export default function HostDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property>();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const limit = 12;

  const sortOptions = [
    { value: "createdAt", label: "Date Added" },
    { value: "pricePerNight", label: "Price" },
    { value: "rating", label: "Rating" },
  ];

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleSortSelection = (value: string) => {
    if (value === sortBy) {
      toggleSortOrder();
    } else {
      setSortBy(value);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "hostProperties",
      page,
      sortBy,
      sortOrder,
      search,
      bookingStatus,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ownedByUser: "true",
      });

      if (bookingStatus) {
        queryParams.append("bookingStatus", bookingStatus);
      }

      if (search) queryParams.append("search", search);

      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });

  const properties: Property[] = data?.properties || [];
  const totalPages = data?.totalPages || 1;

  const clearFilters = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setBookingStatus("");
    setSearch("");
    setPage(1);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["hostProperties"] });
        setSelectedProperty(undefined);
      } else {
        throw new Error("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold">Your Properties</h1>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-5 w-5" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
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

      <div className="rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (page !== 1) setPage(1);
              }}
              className="w-full"
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex-grow">
              <Select value={sortBy} onValueChange={handleSortSelection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Select onValueChange={setBookingStatus} value={bookingStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Booking Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Booking Status</SelectItem>
              <SelectItem value="booked">Booked Properties</SelectItem>
              <SelectItem value="notBooked">Not Booked Properties</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
           {(sortBy !== "createdAt" ||
            sortOrder !== "desc" ||
            search ||
            bookingStatus) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {(sortBy !== "createdAt" ||
        sortOrder !== "desc" ||
        search ||
        bookingStatus) && (
        <div className="mb-4 text-sm bg-secondary p-3 rounded-lg">
          <p>
            <span className="font-medium">Results:</span> Sorted by{" "}
            {sortOptions.find((opt) => opt.value === sortBy)?.label || sortBy} (
            {sortOrder === "asc" ? "low to high" : "high to low"})
            {bookingStatus &&
              `, showing ${
                bookingStatus === "booked" ? "booked" : "not booked"
              } properties`}
            {search && `, matching "${search}"`}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {search || bookingStatus
              ? "No properties match your current filters. Try adjusting your search criteria."
              : "You haven't added any properties yet."}
          </p>
          {search || bookingStatus ? (
            <Button variant="outline" onClick={clearFilters} className="mr-2">
              Clear Filters
            </Button>
          ) : null}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" /> Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="grid min-h-[35rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              className="cursor-pointer"
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && properties.length > 0 && (
        <PaginationContainer
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}

      {selectedProperty && (
        <Dialog
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(undefined)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedProperty.title}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-2">
              <div className="rounded-md overflow-hidden mb-4 h-64">
                <img
                  src={selectedProperty.mediaUrls[0]}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedProperty.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">
                    {selectedProperty.pricePerNight.toLocaleString()} RWF/night
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="font-medium">
                    {selectedProperty._count.bookings || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium">
                    {selectedProperty.rating?.toFixed(1) || "No ratings yet"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviews</p>
                  <p className="font-medium">
                    {selectedProperty._count.reviews || 0}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {selectedProperty.description}
              </p>

              {session?.user?.id === selectedProperty.userId ? (
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      /* Handle Edit - Navigate to edit page or open edit modal */
                    }}
                    className="flex-1"
                  >
                    Edit Property
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProperty(selectedProperty.id)}
                    className="flex-1"
                  >
                    Delete Property
                  </Button>
                </div>
              ) : (
                <Button className="w-full">Book Now</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
