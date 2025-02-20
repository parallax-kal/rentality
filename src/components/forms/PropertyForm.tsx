"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { propertySchema } from "@/lib/schema"; // Correct path to your schema
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService"; // Import the hook for place prediction
import z from "zod";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PropertyForm = z.infer<typeof propertySchema>;

const PropertyFormComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>("");

  // Use usePlacesService hook to fetch place predictions
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
  
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, 
    
  });

  useEffect(() => {
    // Fetch place details for the first place prediction when predictions are available
    if (placePredictions.length) {
      placesService?.getDetails(
        {
          placeId: placePredictions[0].place_id,
        },
        (placeDetails) => {
          const lat = (placeDetails?.geometry?.location?.lat())
          setLocation(placeDetails.formatted_address); // Update location with the selected address
        }
      );
    }
  }, [placePredictions, placesService]);

  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      image: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: PropertyForm) => {
    try {
      setIsLoading(true);
      const propertyData = { ...data, location: location || data.location };
      console.log(propertyData); // You can make an API call here to save the property
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <Label>Title</Label>
                <FormControl>
                  <Input placeholder="Property Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <Label>Description</Label>
                <FormControl>
                  <Textarea placeholder="Property Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <Label>Price per Night</Label>
                <FormControl>
                  <Input type="number" placeholder="Price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <Label>Location</Label>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={true}
                        className="w-full justify-between"
                      >
                        {location || "Search and select location"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search location..."
                          onChangeCapture={(e) => {
                            getPlacePredictions({ input: e.target.value });
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {placePredictions.map((prediction) => (
                              <CommandItem
                                key={prediction.place_id}
                                value={prediction.description}
                                onSelect={(currentValue) => {
                                  setLocation(currentValue);
                                  console.log(prediction)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    location === prediction.description
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {prediction.description}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <Label>Property Image URL</Label>
                <FormControl>
                  <Input type="text" placeholder="Image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Add Property"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PropertyFormComponent;
