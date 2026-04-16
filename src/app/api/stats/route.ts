import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [resumes, applications, interviews] = await Promise.all([
      prisma.applicationForm.count({ where: { resumeUrl: { not: null } } }),
      prisma.applicationForm.count({ where: { status: "SUBMITTED" } }),
      prisma.interview.count(),
    ]);
    // probations is placeholder; no table yet
    return NextResponse.json({
      resumes,
      applications,
      interviews,
      probations: 0,
    });
  } catch (e) {
    return NextResponse.json({ resumes: 0, applications: 0, interviews: 0, probations: 0 });
  }
}
