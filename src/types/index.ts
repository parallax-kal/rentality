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
  hostId: string;
  host: User;
  bookings?: Booking[];
  createdAt: Date;
  updatedAt: Date;
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
