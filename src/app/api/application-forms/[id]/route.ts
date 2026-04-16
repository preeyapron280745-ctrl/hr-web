import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function checkManagerAccess(
  session: any,
  positionId: string | null
): Promise<boolean> {
  const user = session?.user as { role?: string; department?: string } | undefined;
  if (user?.role !== "MANAGER") return true;
  if (!user.department || !positionId) return false;
  const dept = await prisma.department.findUnique({
    where: { name: user.department },
    select: { positions: { where: { id: positionId }, select: { id: true } } },
  });
  return (dept?.positions.length || 0) > 0;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const form = await prisma.applicationForm.findUnique({
      where: { id: params.id },
      include: {
        trainings: true,
        workExperiences: {
          orderBy: { startDate: "desc" },
        },
        languages: true,
        interviewEvaluations: {
          orderBy: [{ round: "asc" }, { evaluationDate: "desc" }],
        },
        probationEvaluations: {
          orderBy: { evaluationDate: "desc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "ApplicationForm not found" },
        { status: 404 }
      );
    }

    const allowed = await checkManagerAccess(session, form.positionId);
    if (!allowed) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึงใบสมัครนี้ (ไม่ใช่แผนกของคุณ)" },
        { status: 403 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error(`GET /api/application-forms/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, note } = body as { status?: string; note?: string };

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const VALID_STATUSES = [
      "DRAFT",
      "SUBMITTED",
      "SCREENING",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "PROBATION",
      "HIRED",
      "REJECTED",
    ];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const existing = await prisma.applicationForm.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, positionId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ApplicationForm not found" },
        { status: 404 }
      );
    }

    const allowed = await checkManagerAccess(session, existing.positionId);
    if (!allowed) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึงใบสมัครนี้" },
        { status: 403 }
      );
    }

    const updated = await prisma.applicationForm.update({
      where: { id: params.id },
      data: {
        status: status as any,
      },
    });

    // TODO: Persist to a history table once created
    console.log(
      `[ApplicationForm ${params.id}] status changed ${existing.status} -> ${status}` +
        (note ? ` | note: ${note}` : "")
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH /api/application-forms/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
