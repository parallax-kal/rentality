import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { renterBookingSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "RENTER") {
      return NextResponse.json(
        { message: "You can't rent create a rent account." },
        { status: 401 }
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

    const renterId = session.user.id;
    const propertyId = params.propertyId;

    const { checkin, totalCost } = safeBooking.data;

    const { from: checkInDate, to: checkOutDate } = checkin;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // The overlapping booking query needs to check all possible overlap scenarios
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { not: "CANCELED" },
        OR: [
          // Case 1: New booking period contains an existing booking
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } },
            ],
          },
          // Case 2: New booking starts during an existing booking
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
          // Case 3: New booking ends during an existing booking
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
          // Case 4: Existing booking completely contains the new booking period
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
        ],
      },
    });

    // Additionally, check if this renter already has a booking for this property
    const existingRenterBooking = await prisma.booking.findFirst({
      where: {
        renterId,
        propertyId,
        status: { not: "CANCELED" },
        // Optional: Only check for active or upcoming bookings
        checkOutDate: { gte: new Date() },
      },
    });

    if (existingRenterBooking) {
      return NextResponse.json(
        { error: "You already have an active booking for this property" },
        { status: 409 }
      );
    }

    if (overlappingBooking) {
      return NextResponse.json(
        { error: "Property already booked for these dates" },
        { status: 409 }
      );
    }
    
    const newBooking = await prisma.booking.create({
      data: {
        renterId,
        propertyId,
        checkInDate,
        checkOutDate,
        totalCost,
      },
    });

    return NextResponse.json(
      {
        booking: newBooking,
        success: true,
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create booking", details: error },
      { status: 500 }
    );
  }
}
