import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const isStaff =
      session && ["ADMIN", "HR", "MANAGER"].includes(session.user.role);

    const where: any = {};

    if (!isStaff) {
      where.status = "PUBLISHED";
    } else if (status) {
      where.status = status;
    }

    const postings = await prisma.jobPosting.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(postings);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
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

    if (!title || !positionId || !description || !requirements) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const posting = await prisma.jobPosting.create({
      data: {
        title,
        positionId,
        description,
        requirements,
        salary,
        employmentType: employmentType || "FULL_TIME",
        locationText,
        openings: openings || 1,
        status: status || "DRAFT",
        closingDate: closingDate ? new Date(closingDate) : null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdById: session.user.id,
      },
      include: {
        position: {
          include: { department: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(posting, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
