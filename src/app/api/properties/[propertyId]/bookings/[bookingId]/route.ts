import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { renterBookingSchema, hostBookingUpdateSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { propertyId: string; bookingId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    const propertyId = params.propertyId as string;
    const bookingId = params.bookingId as string;

    if (session?.user?.role === "HOST") {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, userId: session.user.id },
      });

      if (!property) {
        return NextResponse.json(
          { message: "Property not found or you're not the owner." },
          { status: 404 }
        );
      }

      const body = await req.json();
      const safeStatusUpdate = hostBookingUpdateSchema.safeParse(body);

      if (!safeStatusUpdate.success) {
        return NextResponse.json(
          { error: "Validation error", details: safeStatusUpdate.error.errors },
          { status: 400 }
        );
      }

      const { status } = safeStatusUpdate.data;

      const booking = await prisma.booking.update({
        where: { id: bookingId, propertyId },
        data: { status },
      });

      return NextResponse.json(
        { booking, success: true, message: "Booking updated" },
        { status: 200 }
      );
    }

    if (session?.user?.role === "RENTER") {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, renterId: session.user.id, propertyId },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found or you're not the renter." },
          { status: 404 }
        );
      }

      const body = await req.json();
      const safeBooking = renterBookingSchema.safeParse(body);

      if (!safeBooking.success) {
        return NextResponse.json(
          { error: "Validation error", details: safeBooking.error.errors },
          { status: 400 }
        );
      }


      const { checkin } = safeBooking.data;

      const { from: checkInDate, to: checkOutDate } = checkin;

      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          propertyId,
          status: { not: "CANCELED" },
          OR: [
            {
              checkInDate: {
                lte: checkInDate,
                gte: checkInDate,
              },
            },
            {
              checkOutDate: {
                lte: checkOutDate,
                gte: checkOutDate,
              },
            },
          ],
        },
      });

      if (overlappingBooking) {
        return NextResponse.json(
          { error: "Property already booked for these dates" },
          { status: 409 }
        );
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId, propertyId, renterId: session.user.id },
        data: { checkInDate, checkOutDate },
      });

      return NextResponse.json(
        { booking: updatedBooking, success: true, message: "Booking updated" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update property", details: error },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _: NextRequest,
  { params }: { params: { propertyId: string; bookingId: string } }
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    const propertyId = params.propertyId as string;
    const bookingId = params.bookingId as string;

    if (session?.user?.role === "HOST") {
      const property = await prisma.property.findFirst({
        where: { id: propertyId, userId: session.user.id },
      });

      if (!property) {
        return NextResponse.json(
          { message: "Property not found or you're not the owner." },
          { status: 404 }
        );
      }

      const booking = await prisma.booking.delete({
        where: { id: bookingId, propertyId },
      });

      return NextResponse.json(
        { booking, success: true, message: "Booking deleted" },
        { status: 200 }
      );
    }

    if (session?.user?.role === "RENTER") {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, renterId: session.user.id, propertyId },
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking not found or you're not the renter." },
          { status: 404 }
        );
      }

      const deletedBooking = await prisma.booking.delete({
        where: { id: bookingId, propertyId, renterId: session.user.id },
      });

      return NextResponse.json(
        { booking: deletedBooking, success: true, message: "Booking deleted" },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking", details: error },
      { status: 500 }
    );
  }
};
