import authOptions from "@/lib/auth";
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

    const { searchParams } = new URL(req.url);
    const ownedByUser = searchParams.get("ownedByUser") === "true";

    const propertyId = params.propertyId as string;
    const bookingId = params.bookingId as string;

    if (session?.user?.role === "HOST" && ownedByUser) {
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
          {
            error: "Validation error",
            message: safeStatusUpdate.error.errors
              .map((error) => error.message)
              .join(", "),
          },
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

    // Check if the booking belongs to the current user
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
        {
          error: "Validation error",
          message: safeBooking.error.errors
            .map((error) => error.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { checkin } = safeBooking.data;

    const { from: checkInDate, to: checkOutDate } = checkin;

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { not: "CANCELED" },
        OR: [
          // Case 1: New booking starts during an existing booking
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
          // Case 2: New booking ends during an existing booking
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
          // Case 3: New booking completely contains an existing booking
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } },
            ],
          },
          // Case 4: New booking is completely contained within an existing booking
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        { message: "Property already booked for these dates" },
        { status: 409 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId, propertyId, renterId: session.user.id },
      data: { checkInDate, checkOutDate, status: "PENDING" }, // Set status to PENDING
    });

    return NextResponse.json(
      { booking: updatedBooking, success: true, message: "Booking updated" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booking", details: error },
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking", details: error },
      { status: 500 }
    );
  }
};
