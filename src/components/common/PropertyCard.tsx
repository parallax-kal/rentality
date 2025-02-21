import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { Property } from "@/types";
import Image from "next/image";
import { isPicture } from "@/lib/utils";

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === property.mediaUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.mediaUrls.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.mediaUrls.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:scale-[1.01]">
      <div className="relative h-44">
        {isPicture(property.mediaUrls[currentImageIndex]) ? (
          <Image
            src={property.mediaUrls[currentImageIndex]}
            alt={`${property.title} - image ${currentImageIndex + 1}`}
            fill
            className="w-full h-full object-top object-cover"
          />
        ) : (
          <video
            src={property.mediaUrls[currentImageIndex]}
            controls
            className="rounded-md"
          />
        )}

        {property.mediaUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
              {currentImageIndex + 1}/{property.mediaUrls.length}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold line-clamp-1">
            {property.title}
          </h2>
          <div className="flex items-center gap-1">
            <div>{property.rating}</div>
            <Rating
              initialValue={property.rating}
              readonly
              size={20}
              fillColor="#FFA534"
              emptyClassName="!flex"
              emptyColor="#D1D5DB"
            />
          </div>
        </div>

        <div className="flex items-center text-gray-500 mt-1 text-sm">
          <MapPin size={14} className="mr-1" />
          <p className="line-clamp-1">{property.location}</p>
        </div>

        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {property.description}
        </p>

        <div className="mt- flex justify-between items-center">
          <p className="font-bold text-lg">
            {property.pricePerNight.toLocaleString()}{" "}
            <span className="text-sm font-normal">RWF/night</span>
          </p>

          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-1" />
            <span>
              {property._count.bookings}{" "}
              {property._count.bookings === 1 ? "booking" : "bookings"}
            </span>
          </div>
        </div>

        {property.lastBookedAt && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>
              Last booked on{" "}
              {new Date(property.lastBookedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="pt-1 mt-1 border-t text-xs text-gray-500 flex justify-between">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>
              Listed on {new Date(property.createdAt).toLocaleDateString()}
            </span>
          </div>
          {property.mediaUrls.length > 0 && (
            <span>
              {property.mediaUrls.length}{" "}
              {property.mediaUrls.length === 1 ? "file" : "files"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
