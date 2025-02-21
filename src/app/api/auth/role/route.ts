import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "You're not authorized" },
        { status: 401 }
      );
    }

    const { role } = await req.json();

    if (role !== "RENTER" && role !== "HOST") {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error updating role:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
