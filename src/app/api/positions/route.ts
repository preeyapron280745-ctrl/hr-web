import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const positions = await prisma.jobPosition.findMany({
      include: {
        department: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error("GET /api/positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "HR"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, departmentId, company, active } = body;

    if (!title || !departmentId) {
      return NextResponse.json(
        { error: "Title and departmentId are required" },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const position = await prisma.jobPosition.create({
      data: {
        title,
        departmentId,
        company: company || null,
        ...(typeof active === "boolean" ? { active } : {}),
      },
      include: { department: true },
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error("POST /api/positions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
