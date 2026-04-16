import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobPostingId = searchParams.get("jobPostingId");

    const where: any = {};

    if (session.user.role === "APPLICANT") {
      where.applicant = { email: session.user.email };
    }

    if (status) {
      where.status = status;
    }
    if (jobPostingId) {
      where.jobPostingId = jobPostingId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
            phone: true,
            photoUrl: true,
          },
        },
        jobPosting: {
          include: {
            position: {
              include: { department: true },
            },
          },
        },
        screening: true,
        interviews: {
          orderBy: { round: "asc" },
        },
        approval: true,
        offer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobPostingId,
      email,
      password,
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      titleTh,
      titleEn,
      phone,
      coverLetter,
      expectedSalary,
      availableDate,
      source,
    } = body;

    if (!jobPostingId || !email || !password || !firstNameTh || !lastNameTh) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const posting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });
    if (!posting || posting.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Job posting not found or not open" },
        { status: 404 }
      );
    }

    let applicant = await prisma.applicant.findUnique({
      where: { email },
    });

    if (!applicant) {
      const hashedPassword = await bcrypt.hash(password, 12);
      applicant = await prisma.applicant.create({
        data: {
          email,
          password: hashedPassword,
          firstNameTh,
          lastNameTh,
          firstNameEn,
          lastNameEn,
          titleTh,
          titleEn,
          phone,
        },
      });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        applicantId_jobPostingId: {
          applicantId: applicant.id,
          jobPostingId,
        },
      },
    });
    if (existingApplication) {
      return NextResponse.json(
        { error: "Already applied for this position" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        jobPostingId,
        coverLetter,
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        availableDate: availableDate ? new Date(availableDate) : null,
        source,
        statusHistory: {
          create: {
            toStatus: "APPLIED",
            note: "Application submitted",
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
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
