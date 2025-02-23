import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10); 
    const limit = parseInt(searchParams.get("limit") ?? "10", 10); 
    const skip = (page - 1) * limit;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        renterId: userId,
      },
      skip,
      take: limit,
      include: {
        property: {
          include: {
            host: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalBookings = await prisma.booking.count({
      where: {
        renterId: userId,
      },
    });

    return NextResponse.json(
      {
        bookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
        totalResults: totalBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
};
