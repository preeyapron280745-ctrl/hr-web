import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string; department?: string } | undefined;

    // Build base where clause for Manager scoping
    const baseWhere: Prisma.ApplicationFormWhereInput = {};
    let formIdsForManager: string[] | null = null;

    if (user?.role === "MANAGER" && user.department) {
      const dept = await prisma.department.findUnique({
        where: { name: user.department },
        select: { positions: { select: { id: true } } },
      });
      const positionIds = dept?.positions.map((p) => p.id) || [];
      if (positionIds.length === 0) {
        return NextResponse.json({
          resumes: 0,
          applications: 0,
          interviews: 0,
          probations: 0,
          byStatus: {},
          byCompany: {},
          byEmployeeType: {},
          totalDepartments: 1,
          totalPositions: 0,
          scope: "department",
          department: user.department,
        });
      }
      baseWhere.positionId = { in: positionIds };

      // For evaluations: get all formIds in scope first
      const inScopeForms = await prisma.applicationForm.findMany({
        where: { positionId: { in: positionIds } },
        select: { id: true },
      });
      formIdsForManager = inScopeForms.map((f) => f.id);
    }

    const evalWhere: any =
      formIdsForManager !== null ? { formId: { in: formIdsForManager } } : undefined;

    // Application statuses (ใบสมัครจริง — ไม่รวม TANK/RESUME/DRAFT)
    const appStatuses = ["SUBMITTED", "SCREENING", "INTERVIEW_SCHEDULED", "INTERVIEWED", "PROBATION", "HIRED", "REJECTED"] as any[];

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
      // Resume = เฉพาะ status RESUME
      prisma.applicationForm.count({
        where: { ...baseWhere, status: "RESUME" as any },
      }),
      // ใบสมัครงาน = เฉพาะ SUBMITTED ขึ้นไป (ไม่รวม TANK/RESUME/DRAFT)
      prisma.applicationForm.count({
        where: { ...baseWhere, status: { in: appStatuses } },
      }),
      prisma.interviewEvaluation.count({ where: evalWhere }),
      prisma.probationEvaluation.count({ where: evalWhere }),
      // Pipeline — เฉพาะใบสมัครจริง
      prisma.applicationForm.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: { ...baseWhere, status: { in: appStatuses } },
      }),
      // แยกบริษัท — เฉพาะใบสมัครจริง
      prisma.applicationForm.groupBy({
        by: ["company"],
        _count: { _all: true },
        where: { ...baseWhere, status: { in: appStatuses } },
      }),
      // แยกประเภทพนักงาน — เฉพาะใบสมัครจริง
      prisma.applicationForm.groupBy({
        by: ["employeeType"],
        _count: { _all: true },
        where: { ...baseWhere, status: { in: appStatuses } },
      }),
      user?.role === "MANAGER"
        ? Promise.resolve(1)
        : prisma.department.count({ where: { active: true } }),
      user?.role === "MANAGER" && user.department
        ? prisma.jobPosition.count({
            where: { active: true, department: { name: user.department } },
          })
        : prisma.jobPosition.count({ where: { active: true } }),
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
      scope: user?.role === "MANAGER" ? "department" : "all",
      department: user?.role === "MANAGER" ? user.department : null,
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
