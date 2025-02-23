import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import authOptions from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const propertyId = params.propertyId;

    if (!propertyId) {
      return NextResponse.json(
        { message: "Property ID is required" },
        { status: 400 }
      );
    }

    const whereCondition: Record<string, string> = { propertyId };

    const reviews = await prisma.review.findMany({
      where: whereCondition,
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        reviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const propertyId = params.propertyId;

    const { rating, comment } = await req.json();

    if (!propertyId || !rating || !comment) {
      return NextResponse.json(
        { message: "Property ID, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        propertyId,
        renterId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this property" },
        { status: 400 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        propertyId,
        renterId: session.user.id,
        rating,
        comment,
      },
    });

    return NextResponse.json(
      {
        success: true,
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

