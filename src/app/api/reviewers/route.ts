import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviewers = await (prisma as any).reviewer.findMany({
      where: { active: true },
      orderBy: { nickname: "asc" },
    });
    return NextResponse.json(reviewers);
  } catch (e) {
    console.error("GET /api/reviewers error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
