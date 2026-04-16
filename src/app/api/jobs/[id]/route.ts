import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posting = await prisma.jobPosting.findUnique({
      where: { id: params.id },
      include: {
        position: {
          include: { department: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!posting) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(posting);
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "HR"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      positionId,
      description,
      requirements,
      salary,
      employmentType,
      locationText,
      openings,
      status,
      closingDate,
    } = body;

    const existing = await prisma.jobPosting.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (positionId !== undefined) data.positionId = positionId;
    if (description !== undefined) data.description = description;
    if (requirements !== undefined) data.requirements = requirements;
    if (salary !== undefined) data.salary = salary;
    if (employmentType !== undefined) data.employmentType = employmentType;
    if (locationText !== undefined) data.locationText = locationText;
    if (openings !== undefined) data.openings = openings;
    if (closingDate !== undefined)
      data.closingDate = closingDate ? new Date(closingDate) : null;

    if (status !== undefined) {
      data.status = status;
      if (status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const posting = await prisma.jobPosting.update({
      where: { id: params.id },
      data,
      include: {
        position: {
          include: { department: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(posting);
  } catch (error) {
    console.error("PUT /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "HR"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existing = await prisma.jobPosting.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    if (existing._count.applications > 0) {
      return NextResponse.json(
        { error: "Cannot delete posting with existing applications" },
        { status: 400 }
      );
    }

    await prisma.jobPosting.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
