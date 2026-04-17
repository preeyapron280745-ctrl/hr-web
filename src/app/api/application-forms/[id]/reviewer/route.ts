import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reviewer1, reviewer2, reviewer3, tankStatus } = body;

    const updated = await prisma.applicationForm.update({
      where: { id: params.id },
      data: {
        ...(reviewer1 !== undefined ? { reviewer1 } : {}),
        ...(reviewer2 !== undefined ? { reviewer2 } : {}),
        ...(reviewer3 !== undefined ? { reviewer3 } : {}),
        ...(tankStatus !== undefined ? { tankStatus } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH reviewer ${params.id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
