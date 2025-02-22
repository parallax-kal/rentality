import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _: NextRequest,
  { params }: { params: { propertyId: string; reviewId: string } }
) {
  try {
    const { propertyId, reviewId } = params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "HOST") {
      // Check if the host owns the property
      const property = await prisma.property.findUnique({
        where: { id: propertyId, userId: session.user.id },
      });

      if (!property) {
        return NextResponse.json(
          { message: "Unauthorized: You don't own this property." },
          { status: 403 }
        );
      }
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where:
        session.user.role === "RENTER"
          ? {
              propertyId,
              renterId: session.user.id,
              id: reviewId,
            }
          : {
              propertyId,
              id: reviewId,
            },
    });

    if (!review) {
      return NextResponse.json(
        {
          message: "Review not found or you're not authorized to delete it.",
        },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { propertyId: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to update a review" },
        { status: 401 }
      );
    }

    const { propertyId, reviewId } = params;

    const { rating, comment } = await req.json();

    if (!propertyId || !reviewId || !rating || !comment) {
      return NextResponse.json(
        { message: "Property ID, review ID, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
        propertyId,
        renterId: session.user.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { message: "Review not found or you are not authorized to update it" },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment,
      },
    });

    return NextResponse.json(
      {
        success: true,
        review: updatedReview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
