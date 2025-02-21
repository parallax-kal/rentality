import { propertySchema } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { BASE_URL } from "@/lib/utils";

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
          mesasgae: "Validation error",
          details: safeData.error.errors
            .map((error) => error.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const mediaFiles = formData.getAll("media") as File[];
    const mediaUrls: string[] = [];

    if (mediaFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/properties");
      const propertyDir = path.join(uploadDir, propertyId);

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      if (!existsSync(propertyDir)) {
        await mkdir(propertyDir, { recursive: true });
      }

      for (const file of mediaFiles) {
        const fileExtension = file.name.split(".").pop() || "";
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(propertyDir, fileName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filePath, buffer);

        const relativePath = filePath.replace(
          path.join(process.cwd(), "public"),
          ""
        );

        const fileUrl = `${BASE_URL}${relativePath}`;
        mediaUrls.push(fileUrl);
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
        mediaUrls: mediaUrls,
      },
    });

    return NextResponse.json({
      message: "Property updated successfully.",
      property: updatedProperty,
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

    const propertyDir = path.join(
      process.cwd(),
      "public/properties",
      propertyId
    );
    if (existsSync(propertyDir)) {
      const files = await readdir(propertyDir);
      for (const file of files) {
        await unlink(path.join(propertyDir, file));
      }
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
