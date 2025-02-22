

export interface User {
  id: string;
  email: string;
  name: string;
  role: "RENTER" | "HOST";
  image: string;
}

export interface Review {
  id: string;
  comment: string;
  rating: number;
  renter: User;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  latitude: number;
  longitude: number;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  lastBookedAt: string;
  host: User;
  mediaUrls: string[];
  _count: {
    bookings: number;
  };
  bookings: Booking[];
  reviews: Review[];
}

export interface Booking {
  id: string;
  propertyId: string;
  property: Property;
  renterId: string;
  renter: User;
  checkInDate: Date,
  checkOutDate: Date,
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}
