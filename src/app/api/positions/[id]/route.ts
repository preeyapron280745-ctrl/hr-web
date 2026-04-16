import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const position = await prisma.jobPosition.findUnique({
      where: { id: params.id },
      include: { department: true },
    });

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error("GET /api/positions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "HR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, departmentId, company, active } = body;

    const existing = await prisma.jobPosition.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (typeof title === "string" && title.trim().length > 0) {
      data.title = title.trim();
    }
    if (typeof departmentId === "string" && departmentId.length > 0) {
      data.departmentId = departmentId;
    }
    if (typeof company !== "undefined") {
      data.company = company || null;
    }
    if (typeof active === "boolean") {
      data.active = active;
    }

    const position = await prisma.jobPosition.update({
      where: { id: params.id },
      data,
      include: { department: true },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error("PUT /api/positions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "HR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existing = await prisma.jobPosition.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // Soft delete
    const position = await prisma.jobPosition.update({
      where: { id: params.id },
      data: { active: false },
      include: { department: true },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error("DELETE /api/positions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
