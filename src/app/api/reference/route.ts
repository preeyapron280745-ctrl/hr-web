import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const company = url.searchParams.get("company");

  try {
    if (type === "hospitals") {
      const hospitals = await prisma.hospital.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(hospitals);
    }
    if (type === "provinces") {
      const provinces = await prisma.province.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(provinces);
    }
    if (type === "positions") {
      const employeeType = url.searchParams.get("employeeType");
      const positions = await prisma.jobPosition.findMany({
        where: {
          active: true,
          ...(company ? { company: company as any } : {}),
          ...(employeeType
            ? { OR: [{ employeeType }, { employeeType: null }] }
            : {}),
        },
        orderBy: { title: "asc" },
      });
      return NextResponse.json(positions);
    }
    return NextResponse.json({ error: "unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
