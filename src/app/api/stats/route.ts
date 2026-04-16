import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      resumes,
      applications,
      interviews,
      probations,
      statusGroups,
      companyGroups,
      empTypeGroups,
      totalDepartments,
      totalPositions,
    ] = await Promise.all([
      prisma.applicationForm.count({ where: { resumeUrl: { not: null } } }),
      prisma.applicationForm.count({ where: { status: { not: "DRAFT" } } }),
      prisma.interviewEvaluation.count(),
      prisma.probationEvaluation.count(),
      prisma.applicationForm.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: { status: { not: "DRAFT" } },
      }),
      prisma.applicationForm.groupBy({
        by: ["company"],
        _count: { _all: true },
        where: { status: { not: "DRAFT" } },
      }),
      prisma.applicationForm.groupBy({
        by: ["employeeType"],
        _count: { _all: true },
        where: { status: { not: "DRAFT" } },
      }),
      prisma.department.count({ where: { active: true } }),
      prisma.jobPosition.count({ where: { active: true } }),
    ]);

    const byStatus: Record<string, number> = {};
    statusGroups.forEach((g) => (byStatus[g.status] = g._count._all));

    const byCompany: Record<string, number> = {};
    companyGroups.forEach((g) => (byCompany[g.company] = g._count._all));

    const byEmployeeType: Record<string, number> = {};
    empTypeGroups.forEach((g) => (byEmployeeType[g.employeeType] = g._count._all));

    return NextResponse.json({
      resumes,
      applications,
      interviews,
      probations,
      byStatus,
      byCompany,
      byEmployeeType,
      totalDepartments,
      totalPositions,
    });
  } catch (e) {
    console.error("Stats error:", e);
    return NextResponse.json({
      resumes: 0,
      applications: 0,
      interviews: 0,
      probations: 0,
    });
  }
}
