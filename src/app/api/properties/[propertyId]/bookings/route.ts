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
        { error: "Validation error", message: safeBooking.error.errors
          .map((error) => error.message)
          .join(", "), },
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
        { message: "Property not found" },
        { status: 404 }
      );
    }

    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { not: "CANCELED" },
        OR: [
          // Case 1: New booking starts during an existing booking
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } }
            ]
          },
          // Case 2: New booking ends during an existing booking
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } }
            ]
          },
          // Case 3: New booking completely contains an existing booking
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } }
            ]
          },
          // Case 4: New booking is completely contained within an existing booking
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gte: checkOutDate } }
            ]
          }
        ],
      },
    });
    
    if (overlappingBooking) {
      return NextResponse.json(
        { message: "Property already booked for these dates" },
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
      { message: "Failed to create booking", details: error },
      { status: 500 }
    );
  }
}
