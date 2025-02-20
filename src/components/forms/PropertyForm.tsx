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
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

type PropertyForm = z.infer<typeof propertySchema>;

const PropertyFormComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Use usePlacesService hook to fetch place predictions
  const { placesService, placePredictions, getPlacePredictions } =
    usePlacesService({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const form = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      media: undefined,
    },
  });
  useEffect(() => {
    // Fetch place details for the first place prediction when predictions are available
    if (placePredictions.length) {
      placesService?.getDetails(
        {
          placeId: placePredictions[0].place_id,
        },
        (placeDetails) => {
          const lat = placeDetails?.geometry?.location?.lat() ?? 0;
          const long = placeDetails?.geometry?.location?.lng() ?? 0;
          const location = placeDetails?.formatted_address;
          if (location) {
            form.setValue("location", location);
            form.setValue("longitude", long);
            form.setValue("latitude", lat);
          }
        }
      );
    }
  }, [placePredictions, placesService]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        alert("Some files exceed the 20MB limit and were not added.");
      }
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
      form.setValue("media", [...uploadedFiles, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    form.setValue("media", updatedFiles);
  };

  // Handle form submission
  const onSubmit = async (data: PropertyForm) => {
    try {
      setIsLoading(true);

      console.log(data); // You can make an API call here to save the property
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
                <Label>Price per Night &#40;RWF&#41;</Label>
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
                        {field.value || "Search and select location"}
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
                                  field.onChange(currentValue);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === prediction.description
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
            name="media"
            render={() => (
              <FormItem>
                <Label>Upload Media (Max 20MB each)</Label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600">
                    Drag & drop media here, or click to select files
                  </p>
                </div>
                <FormMessage />

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        onClick={() => setPreviewFile(file)}
                        className="relative w-24 h-24"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Add Property"}
          </Button>
        </form>
      </Form>
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
                onClick={() => setPreviewFile(null)}
              >
                ✕
              </button>
            </DialogClose>
          </DialogHeader>
          <div className="flex justify-center">
            {previewFile &&
              (previewFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(previewFile)}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] rounded"
                />
              ) : (
                <video
                  src={URL.createObjectURL(previewFile)}
                  controls
                  className="max-w-full max-h-[80vh] rounded"
                />
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyFormComponent;
