import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId");
    const evaluatorId = searchParams.get("evaluatorId");

    const where: any = {};
    if (formId) where.formId = formId;
    if (evaluatorId) where.evaluatorId = evaluatorId;

    const evaluations = await prisma.probationEvaluation.findMany({
      where,
      include: {
        form: {
          select: {
            id: true,
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
            positionTitle: true,
            company: true,
            status: true,
            photoUrl: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { evaluationDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("GET /api/probation-evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const {
      formId,
      workQuality,
      discipline,
      teamwork,
      responsibility,
      learningAbility,
      overallScore,
      result,
      notes,
      evaluationDate,
    } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "formId is required" },
        { status: 400 }
      );
    }

    const existingForm = await prisma.applicationForm.findUnique({
      where: { id: formId },
      select: { id: true },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: "ApplicationForm not found" },
        { status: 404 }
      );
    }

    const evaluatorId =
      (session?.user as any)?.id ||
      (session?.user as any)?.sub ||
      null;

    const evalDate = evaluationDate ? new Date(evaluationDate) : new Date();

    const evaluation = await prisma.probationEvaluation.create({
      data: {
        formId,
        evaluatorId,
        evaluationDate: evalDate,
        workQuality: workQuality != null ? Number(workQuality) : null,
        discipline: discipline != null ? Number(discipline) : null,
        teamwork: teamwork != null ? Number(teamwork) : null,
        responsibility: responsibility != null ? Number(responsibility) : null,
        learningAbility:
          learningAbility != null ? Number(learningAbility) : null,
        overallScore: overallScore != null ? Number(overallScore) : null,
        result: result || null,
        notes: notes || null,
      },
    });

    // If result is PASS, update status to HIRED; if FAIL, REJECTED
    if (result === "PASS") {
      await prisma.applicationForm.update({
        where: { id: formId },
        data: { status: "HIRED" },
      });
    } else if (result === "FAIL") {
      await prisma.applicationForm.update({
        where: { id: formId },
        data: { status: "REJECTED" },
      });
    }

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("POST /api/probation-evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
