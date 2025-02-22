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

import { Property } from "@/types";
import PaginationContainer from "@/components/common/Pagination";
import Link from "next/link";

const PropertiesDisplay = ({ owned = false }: { owned?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const limit = 12;

  const sortOptions = [
    { value: "createdAt", label: "Date Added" },
    { value: "pricePerNight", label: "Price" },
    { value: "reviews", label: "Rating" },
    { value: "bookings", label: "Bookings" },
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ownedByUser: owned ? "true" : "false",
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

  return (
    <div className="mx-auto p-6 ">
      {owned && (
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
                  queryClient.invalidateQueries({
                    queryKey: ["hostProperties"],
                  });
                  setIsModalOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Input
              placeholder="Search properties..."
              value={search}
              type="search"
              onChange={(e) => {
                setSearch(e.target.value);
                if (page !== 1) setPage(1);
              }}
              className="w-full"
            />
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
          {owned && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-5 w-5" /> Add Your First Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid min-h-[35rem] xs:grid-cols-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Link
              href={`/rentals/${property.id}${owned ? "?owned=true" : ""}`}
              key={property.id}
              className="cursor-pointer"
            >
              <PropertyCard property={property} />
            </Link>
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
    </div>
  );
};

export default PropertiesDisplay;
