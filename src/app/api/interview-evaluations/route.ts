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

    const evaluations = await prisma.interviewEvaluation.findMany({
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
    console.error("GET /api/interview-evaluations error:", error);
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
      round,
      personality,
      communication,
      knowledge,
      experience,
      attitude,
      overallScore,
      recommendation,
      strengths,
      weaknesses,
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

    const evaluation = await prisma.interviewEvaluation.create({
      data: {
        formId,
        evaluatorId,
        evaluationDate: evalDate,
        round: typeof round === "number" ? round : parseInt(round || "1") || 1,
        personality: personality != null ? Number(personality) : null,
        communication: communication != null ? Number(communication) : null,
        knowledge: knowledge != null ? Number(knowledge) : null,
        experience: experience != null ? Number(experience) : null,
        attitude: attitude != null ? Number(attitude) : null,
        overallScore: overallScore != null ? Number(overallScore) : null,
        recommendation: recommendation || null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        notes: notes || null,
      },
    });

    // Update ApplicationForm status to INTERVIEWED
    await prisma.applicationForm.update({
      where: { id: formId },
      data: { status: "INTERVIEWED" },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("POST /api/interview-evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
