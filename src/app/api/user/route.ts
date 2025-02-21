import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { profileSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export const PUT = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const safeData = profileSchema.safeParse(body);
    if (safeData.error) {
      return NextResponse.json({ message: safeData.error }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: safeData.data.role, name: safeData.data.name },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
