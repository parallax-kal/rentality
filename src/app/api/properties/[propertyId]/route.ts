import { propertySchema } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/claudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "HOST") {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    const propertyId = params.propertyId as string;

    const property = await prisma.property.findUnique({
      where: { id: propertyId, userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found or you're not the owner." },
        { status: 404 }
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
      // Upload new media files to Cloudinary
      const uploadPromises = mediaFiles.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      mediaUrls.push(...uploadedUrls);

      // Delete old media files from Cloudinary
      if (property.mediaUrls && property.mediaUrls.length > 0) {
        const deletePromises = property.mediaUrls.map(url => deleteFromCloudinary(url));
        await Promise.all(deletePromises);
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId, userId: session.user.id },
      data: {
        title: safeData.data.title,
        description: safeData.data.description,
        pricePerNight: parseFloat(safeData.data.price),
        location: safeData.data.location,
        longitude: safeData.data.longitude,
        latitude: safeData.data.latitude,
        mediaUrls: mediaFiles.length > 0 ? mediaUrls : property.mediaUrls,
      },
    });

    return NextResponse.json({
      message: "Property updated successfully.",
      property: updatedProperty,
      success: true,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "HOST") {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    const propertyId = params.propertyId as string;

    const property = await prisma.property.findUnique({
      where: { id: propertyId, userId: session.user.id },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found or you're not the owner." },
        { status: 404 }
      );
    }

    if (property.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You're not authorized to do this." },
        { status: 401 }
      );
    }

    // Delete media files from Cloudinary
    if (property.mediaUrls && property.mediaUrls.length > 0) {
      const deletePromises = property.mediaUrls.map(url => deleteFromCloudinary(url));
      await Promise.all(deletePromises);
    }

    await prisma.property.delete({
      where: { id: propertyId, userId: session.user.id },
    });

    return NextResponse.json(
      { message: "Property deleted successfully.", success: true },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const ownedByUser = searchParams.get("ownedByUser") === "true";

    let property;
    if (session?.user?.role === "HOST" && ownedByUser) {
      property = await prisma.property.findUnique({
        where: { id: params.propertyId, userId: session.user.id },
        include: {
          reviews: true,
          _count: {
            select: { bookings: true },
          },
          host: true,
          bookings: {
            include: {
              renter: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } else {
      property = await prisma.property.findUnique({
        where: { id: params.propertyId },
        include: {
          reviews: {
            include: {
              renter: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
      });
    }

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ property }, { status: 200 });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { message: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}