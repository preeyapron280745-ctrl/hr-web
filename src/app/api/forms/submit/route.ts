import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// All valid fields in ApplicationForm (excluding id, createdAt, updatedAt, relations)
const VALID_FIELDS = new Set([
  "employeeType", "company", "positionId", "positionTitle",
  "positionId2", "positionTitle2", "positionId3", "positionTitle3",
  "applicationCode", "channel",
  "sourceOfInfo", "sourceOfInfoOther", "referredBy",
  "incomeTypes", "currentSalary", "otAllowance", "shiftAllowance",
  "positionAllowance", "foodAllowance", "travelAllowance", "bonusYearly",
  "expectedSalaryMin", "expectedSalaryMax", "availableStartDate",
  "lastYearExperience", "internStartDate", "internEndDate", "internDepartment",
  "photoUrl", "resumeUrl",
  "titleTh", "firstNameTh", "lastNameTh", "titleEn", "firstNameEn", "lastNameEn",
  "nicknameTh", "nicknameEn", "phone", "dateOfBirth", "age", "birthProvince",
  "nationality", "ethnicity", "religion", "height", "weight", "email", "lineId",
  "currentAddress", "permanentAddress",
  "socialSecurityStatus", "hospitalWithSS", "hospitalWithSSOther",
  "hospitalNoSS", "hospitalNoSSOther",
  "maritalStatus", "spouseTitle", "spouseName", "spouseOccupation",
  "spouseWorkplace", "spousePhone", "numChildren",
  "fatherTitle", "fatherName", "fatherStatus", "fatherAge", "fatherOccupation", "fatherPhone",
  "motherTitle", "motherName", "motherStatus", "motherAge", "motherOccupation", "motherPhone",
  "siblings", "childOrder",
  "educationLevels", "educationData", "educationLevelText",
  "internStudyYear", "internGpa", "internInstitution", "internFaculty", "internMajor",
  "advisorTitle", "advisorName", "advisorPhone", "advisorEmail",
  "computerSkills", "excelSkills", "excelSkillsOther",
  "wordSkills", "wordSkillsOther", "powerpointSkills", "powerpointSkillsOther",
  "photoshopSkills", "photoshopSkillsOther", "otherSkills", "interestedWork",
  "travelMode", "shuttleRoute",
  "canDriveCar", "carLicenseNumber", "hasCar", "carPlate",
  "canDriveMotorcycle", "motorcycleLicenseNumber", "hasMotorcycle", "motorcyclePlate",
  "firedForMisconduct", "firedReason",
  "smoke", "smokeReason", "smokeFrequency",
  "alcohol", "alcoholReason", "alcoholFrequency",
  "drugs", "drugsReason", "seriousInjury", "injuryDetail",
  "chronicDisease", "chronicDiseaseDetail", "seriousDisease", "seriousDiseaseDetail",
  "surgery", "surgeryDetail", "firedForRule", "firedRuleReason",
  "jailed", "jailedReason", "debtLawsuit", "debtReason",
  "healthy", "disabilityDetail", "pregnant", "pregnancyWeeks",
  "severeMenstrualPain", "mentalIllness", "mentalIllnessDetail",
  "wifePregnant", "wifePregnancyWeeks",
  "emTitle1", "emName1", "emRelation1", "emPhone1",
  "emTitle2", "emName2", "emRelation2", "emPhone2",
  "allowPrevEmployerContact", "allowPrevEmployerReason",
  "nonRelRelation", "nonRelTitle", "nonRelName", "nonRelAddress", "nonRelPhone", "nonRelPosition",
  "consent1", "consentSignerTitle", "consentSignerName", "consent2",
  "tankStatus", "reviewer1", "reviewer2", "reviewer3",
  "reviewerStatus1", "reviewerStatus2", "reviewerStatus3", "tankRejectReason",
  "lastCompany", "lastPosition", "lastSalaryMin", "lastSalaryMax",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainings = [], workExperiences = [], languages = [], status: rawStatus, ...formData } = body;

    // Calculate age from dateOfBirth
    let age: number | undefined;
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    }

    // Strip unknown fields — only keep valid ApplicationForm columns
    const data: any = {};
    for (const [key, value] of Object.entries({ ...formData, age })) {
      if (VALID_FIELDS.has(key) && value !== undefined) {
        data[key] = value;
      }
    }

    // Convert date strings to Date objects
    const dateFields = ["dateOfBirth", "availableStartDate", "internStartDate", "internEndDate"];
    for (const f of dateFields) {
      if (data[f]) data[f] = new Date(data[f]);
    }

    const targetStatus = rawStatus || "SUBMITTED";

    const form = await prisma.applicationForm.create({
      data: {
        ...data,
        status: targetStatus,
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
    return NextResponse.json({ error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
