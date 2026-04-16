import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        applicant: {
          include: {
            educations: true,
            workExperiences: { orderBy: { startDate: "desc" } },
            skills: true,
            languages: true,
            trainings: true,
            references: true,
            emergencyContacts: true,
            documents: true,
          },
        },
        jobPosting: {
          include: {
            position: {
              include: { department: true },
            },
            createdBy: {
              select: { id: true, name: true },
            },
          },
        },
        screening: {
          include: {
            screenedBy: { select: { id: true, name: true } },
          },
        },
        interviews: {
          include: {
            interviewer: { select: { id: true, name: true } },
          },
          orderBy: { round: "asc" },
        },
        approval: {
          include: {
            approvedBy: { select: { id: true, name: true } },
          },
        },
        offer: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "APPLICANT" &&
      application.applicant.email !== session.user.email
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
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
      !["ADMIN", "HR", "MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes !== undefined ? notes : existing.notes,
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: status,
            changedBy: session.user.name,
            note: notes,
          },
        },
      },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            firstNameTh: true,
            lastNameTh: true,
          },
        },
        jobPosting: {
          include: {
            position: {
              include: { department: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("PUT /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
