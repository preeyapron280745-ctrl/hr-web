import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const existing = await prisma.applicationForm.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ApplicationForm not found" },
        { status: 404 }
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
