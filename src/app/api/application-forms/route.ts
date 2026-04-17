import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string; department?: string } | undefined;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const company = searchParams.get("company");
    const employeeType = searchParams.get("employeeType");
    const positionId = searchParams.get("positionId");
    const hasResume = searchParams.get("hasResume");
    const q = searchParams.get("q");

    const where: Prisma.ApplicationFormWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status as any;
    } else {
      // Exclude DRAFT by default when no specific status filter applied
      where.status = { not: "DRAFT" as any };
    }

    if (company) {
      where.company = company as any;
    }

    if (employeeType) {
      where.employeeType = employeeType as any;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (hasResume === "true") {
      where.resumeUrl = { not: null };
    } else if (hasResume === "false") {
      where.resumeUrl = null;
    }

    // Manager: filter access
    if (user?.role === "MANAGER") {
      const userName = (user as any)?.name || "";

      if (status === "RESUME") {
        // Resume page: Manager sees only resumes sent to them (reviewer1/2/3 matches their name)
        // Find matching reviewer nicknames for this user
        const reviewerNames: string[] = [];
        if (userName) {
          reviewerNames.push(userName);
          // Also check Reviewer table for nickname matches
          const matchingReviewers = await (prisma as any).reviewer.findMany({
            where: {
              OR: [
                { name: { contains: userName, mode: "insensitive" } },
                { nickname: { contains: userName, mode: "insensitive" } },
              ],
            },
            select: { name: true, nickname: true },
          });
          matchingReviewers.forEach((r: any) => {
            if (r.nickname) reviewerNames.push(r.nickname);
            if (r.name) reviewerNames.push(r.name);
          });
        }

        if (reviewerNames.length > 0) {
          where.OR = [
            ...(where.OR || []),
            { reviewer1: { in: reviewerNames } },
            { reviewer2: { in: reviewerNames } },
            { reviewer3: { in: reviewerNames } },
          ];
        } else {
          return NextResponse.json([]);
        }
      } else if (user.department) {
        // Other pages: filter by department
        const dept = await prisma.department.findUnique({
          where: { name: user.department },
          select: { positions: { select: { id: true } } },
        });
        const positionIds = dept?.positions.map((p) => p.id) || [];
        if (positionIds.length === 0) {
          return NextResponse.json([]);
        }
        where.positionId = { in: positionIds };
      }
    }

    if (q && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { firstNameTh: { contains: term, mode: "insensitive" } },
        { lastNameTh: { contains: term, mode: "insensitive" } },
        { firstNameEn: { contains: term, mode: "insensitive" } },
        { lastNameEn: { contains: term, mode: "insensitive" } },
        { nicknameTh: { contains: term, mode: "insensitive" } },
        { nicknameEn: { contains: term, mode: "insensitive" } },
        { positionTitle: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ];
    }

    const forms = await prisma.applicationForm.findMany({
      where,
      select: {
        id: true,
        employeeType: true,
        company: true,
        positionId: true,
        positionTitle: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        nicknameTh: true,
        phone: true,
        email: true,
        photoUrl: true,
        resumeUrl: true,
        status: true,
        tankStatus: true,
        reviewer1: true,
        reviewerStatus1: true,
        reviewer2: true,
        reviewer3: true,
        interviewSlot1Date: true, interviewSlot1Time: true, interviewSlot1Location: true,
        interviewSlot2Date: true, interviewSlot2Time: true, interviewSlot2Location: true,
        interviewSlot3Date: true, interviewSlot3Time: true, interviewSlot3Location: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { submittedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("GET /api/application-forms error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
