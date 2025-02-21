export interface User {
  id: string;
  email: string;
  name: string;
  role: "RENTER" | "HOST";
  image?: string;
}

export interface Location {
  lat: number;
  long: number;
}

export interface Property {
  title: string;
  description: string;
  location: string;
  longitude: number;
  latitude: number;
  id: string;
  pricePerNight: number;
  userId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  mediaUrls: string[];
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
