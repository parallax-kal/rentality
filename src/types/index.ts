export interface User {
  id: string;
  email: string;
  name: string;
  role: "RENTER" | "HOST";
  image?: string;
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
  mediaUrls: string[];
  _count: {
    bookings: number;
  };
}

export interface Booking {
  id: string;
  propertyId: string;
  property: Property;
  renterId: string;
  renter: User;
  checkIn: Date;
  checkOut: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
