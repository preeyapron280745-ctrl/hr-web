import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainings = [], workExperiences = [], languages = [], ...formData } = body;

    // Calculate age from dateOfBirth
    let age: number | undefined;
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    // Convert date strings to Date objects
    const dateFields = [
      "dateOfBirth",
      "availableStartDate",
      "internStartDate",
      "internEndDate",
    ];
    const data: any = { ...formData, age };
    for (const f of dateFields) {
      if (data[f]) data[f] = new Date(data[f]);
    }

    const form = await prisma.applicationForm.create({
      data: {
        ...data,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    // Insert child records
    if (trainings.length > 0) {
      await prisma.trainingItem.createMany({
        data: trainings.map((t: any) => ({ ...t, formId: form.id })),
      });
    }
    if (workExperiences.length > 0) {
      await prisma.workExperienceItem.createMany({
        data: workExperiences.map((w: any) => ({
          ...w,
          formId: form.id,
          startDate: w.startDate ? new Date(w.startDate) : null,
          endDate: w.endDate ? new Date(w.endDate) : null,
        })),
      });
    }
    if (languages.length > 0) {
      await prisma.languageItem.createMany({
        data: languages.map((l: any) => ({ ...l, formId: form.id })),
      });
    }

    return NextResponse.json({ id: form.id, success: true });
  } catch (e) {
    console.error("Form submit error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
