/* eslint-disable react-hooks/exhaustive-deps */
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
import z from "zod";
import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Property } from "@/types";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAP_DEFAULT_CENTER = { lat: -1.9501, lng: 30.0586 }; // Default: Kigali, Rwanda

const PropertyFormComponent = ({
  closeModal,
  property = undefined,
}: {
  closeModal: () => void;
  property?: Property;
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title ?? "",
      description: property?.description ?? "",
      price: property?.pricePerNight.toString() ?? "1",
      location: property?.location ?? "Kigali, Rwanda",
      media: undefined,
      longitude: property?.longitude ?? MAP_DEFAULT_CENTER.lng,
      latitude: property?.latitude ?? MAP_DEFAULT_CENTER.lat,
    },
  });

  const geocodeAddress = async (address: string) => {
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const { lat, lng } = results[0].geometry.location;
          form.setValue("latitude", lat());
          form.setValue("longitude", lng());
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  useEffect(() => {
    if (placePredictions.length) {
      placesService?.getDetails(
        {
          placeId: placePredictions[0].place_id,
        },
        (placeDetails) => {
          const location = placeDetails?.formatted_address;
          if (location) {
            form.setValue("location", location);
            geocodeAddress(location);
          }
        }
      );
    }
  }, [placePredictions, placesService, form]);

  const onSubmit = async (data: z.infer<typeof propertySchema>) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("location", data.location);

    if (data.longitude) formData.append("longitude", data.longitude.toString());
    if (data.latitude) formData.append("latitude", data.latitude.toString());

    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => {
        if (file) formData.append("media", file);
      });
    }

    if (property) {
      formData.append("previousMedia", JSON.stringify(property.mediaUrls));
    }

    const fetchPromise = property
      ? fetch("/api/properties/" + property.id, {
          method: "PUT",
          body: formData,
        })
      : fetch("/api/properties", {
          method: "POST",
          body: formData,
        });

    toast.promise(
      fetchPromise
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            throw new Error(result.error || "Something went wrong");
          }

          form.reset();
          setUploadedFiles([]);
          closeModal();
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
          throw error;
        }),
      {
        loading: "Submitting property...",
        success: "Property submitted successfully! 🎉",
        error: (error) =>
          error?.response?.data?.message ?? "Error submitting property",
      }
    );
  };

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
                        className="w-full justify-between truncate"
                      >
                        {field.value || "Search and select location"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search location..."
                          onChangeCapture={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            getPlacePredictions({ input: e.target.value });
                          }}
                        />
                        <CommandList>
                          {isPlacePredictionsLoading ? (
                            <div className="min-h-10 flex items-center justify-center">
                              <Loader2 className="animate-spin h-8 w-8" />
                            </div>
                          ) : (
                            <>
                              <CommandEmpty>No location found.</CommandEmpty>
                              <CommandGroup>
                                {placePredictions.map((prediction) => (
                                  <CommandItem
                                    key={prediction.place_id}
                                    value={prediction.description}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue);
                                      geocodeAddress(currentValue);
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
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?key=${
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              }&q=${form.watch("latitude")},${form.watch("longitude")}`}
            />
          </div>

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
                        onClick={() => {
                          setPreviewFile(file);
                        }}
                        className="relative w-24 h-24"
                      >
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
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

          <Button type="submit" className="w-full">
            {property ? "Edit property" : "Add property"}
          </Button>
        </form>
      </Form>
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex justify-center">
            {previewFile &&
              (previewFile.type.startsWith("image/") ? (
                <Image
                  src={URL.createObjectURL(previewFile)}
                  alt="Preview"
                  height={0}
                  width={0}
                  className="!max-w-full object-cover object-top !w-auto !h-[80vh] rounded"
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
