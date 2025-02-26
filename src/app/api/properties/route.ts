import { propertySchema } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/claudinary";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const ownedByUser = searchParams.get("ownedByUser") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const search = searchParams.get("search")?.toLowerCase() || "";
    const bookingStatus = searchParams.get("bookingStatus");

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    if (ownedByUser && userId) {
      whereCondition.userId = userId;
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (bookingStatus === "booked") {
      whereCondition.bookings = { some: {} };
    } else if (bookingStatus === "notBooked") {
      whereCondition.bookings = { none: {} };
    }

    const orderBy: Record<string, unknown> = {};

    if (sortBy === "bookings" || sortBy === "reviews") {
      orderBy[sortBy] = {
        _count: sortOrder,
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const properties = await prisma.property.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            renter: true,
          },
        },
      },
    });

    const totalProperties = await prisma.property.count({
      where: whereCondition,
    });

    return NextResponse.json(
      {
        properties,
        totalPages: Math.ceil(totalProperties / limit),
        currentPage: page,
        totalResults: totalProperties,
        bookingStatus,
        sortBy,
        sortOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "HOST") {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const textFields = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      location: formData.get("location") as string,
      longitude: parseFloat(formData.get("longitude") as string),
      latitude: parseFloat(formData.get("latitude") as string),
      media: formData.getAll("media"),
    };

    const safeData = propertySchema.safeParse(textFields);

    if (!safeData.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: safeData.error.errors
            .map((error) => error.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const mediaFiles = formData.getAll("media") as File[];
    const mediaUrls: string[] = [];

    if (mediaFiles.length > 0) {
      const uploadPromises = mediaFiles.map((file) => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      mediaUrls.push(...uploadedUrls);
    }

    const property = await prisma.property.create({
      data: {
        title: safeData.data.title,
        userId: session.user.id,
        description: safeData.data.description,
        pricePerNight: parseFloat(safeData.data.price),
        location: safeData.data.location,
        longitude: safeData.data.longitude,
        latitude: safeData.data.latitude,
        mediaUrls: mediaUrls,
      },
    });

    return NextResponse.json(
      { message: "Property added successfully.", success: true, property },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing property submission:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error },
      { status: 500 }
    );
  }
}
