import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const allowedFields = [
      "reviewer1", "reviewer2", "reviewer3",
      "reviewerStatus1", "reviewerStatus2", "reviewerStatus3",
      "tankStatus", "tankRejectReason",
      "interviewSlot1Date", "interviewSlot1Time", "interviewSlot1Location",
      "interviewSlot2Date", "interviewSlot2Time", "interviewSlot2Location",
      "interviewSlot3Date", "interviewSlot3Time", "interviewSlot3Location",
    ];

    const data: any = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) {
        // Convert date strings
        if (f.includes("Date") && body[f]) {
          data[f] = new Date(body[f]);
        } else {
          data[f] = body[f];
        }
      }
    }

    // Also update main status if provided
    if (body.status) {
      data.status = body.status;
    }

    const updated = await prisma.applicationForm.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH reviewer ${params.id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
