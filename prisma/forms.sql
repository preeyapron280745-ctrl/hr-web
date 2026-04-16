-- New enums for ApplicationForm
DO $$ BEGIN CREATE TYPE "EmployeeType" AS ENUM ('MONTHLY', 'DAILY', 'INTERN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "Company" AS ENUM ('COMETS_HQ', 'COMETS_FACTORY', 'ICT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'SUBMITTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add company to JobPosition if not exists
ALTER TABLE "JobPosition" ADD COLUMN IF NOT EXISTS company "Company";

-- Hospital reference
CREATE TABLE IF NOT EXISTS "Hospital" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Province reference
CREATE TABLE IF NOT EXISTS "Province" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- ApplicationForm - main flat table for the 12-page form
CREATE TABLE IF NOT EXISTS "ApplicationForm" (
  id TEXT PRIMARY KEY,
  status "FormStatus" NOT NULL DEFAULT 'DRAFT',

  -- Page 1
  "employeeType" "EmployeeType" NOT NULL,

  -- Page 2
  company "Company" NOT NULL,
  "positionId" TEXT,
  "positionTitle" TEXT NOT NULL,
  "sourceOfInfo" TEXT[],
  "sourceOfInfoOther" TEXT,
  "referredBy" TEXT,
  "incomeTypes" TEXT[],
  "currentSalary" DOUBLE PRECISION,
  "otAllowance" DOUBLE PRECISION,
  "shiftAllowance" DOUBLE PRECISION,
  "positionAllowance" DOUBLE PRECISION,
  "foodAllowance" DOUBLE PRECISION,
  "travelAllowance" DOUBLE PRECISION,
  "bonusYearly" DOUBLE PRECISION,
  "expectedSalaryMin" DOUBLE PRECISION,
  "expectedSalaryMax" DOUBLE PRECISION,
  "availableStartDate" DATE,
  "lastYearExperience" TEXT,
  "internStartDate" DATE,
  "internEndDate" DATE,
  "internDepartment" TEXT,
  "photoUrl" TEXT,
  "resumeUrl" TEXT,

  -- Page 3 - Personal
  "titleTh" TEXT,
  "firstNameTh" TEXT,
  "lastNameTh" TEXT,
  "titleEn" TEXT,
  "firstNameEn" TEXT,
  "lastNameEn" TEXT,
  "nicknameTh" TEXT,
  "nicknameEn" TEXT,
  phone TEXT,
  "dateOfBirth" DATE,
  age INTEGER,
  "birthProvince" TEXT,
  nationality TEXT,
  ethnicity TEXT,
  religion TEXT,
  height DOUBLE PRECISION,
  weight DOUBLE PRECISION,
  email TEXT,
  "lineId" TEXT,
  "currentAddress" TEXT,
  "permanentAddress" TEXT,
  "socialSecurityStatus" TEXT,
  "hospitalWithSS" TEXT,
  "hospitalWithSSOther" TEXT,
  "hospitalNoSS" TEXT,
  "hospitalNoSSOther" TEXT,
  "maritalStatus" TEXT,
  "spouseTitle" TEXT,
  "spouseName" TEXT,
  "spouseOccupation" TEXT,
  "spouseWorkplace" TEXT,
  "spousePhone" TEXT,
  "numChildren" INTEGER,
  "fatherTitle" TEXT,
  "fatherName" TEXT,
  "fatherStatus" TEXT,
  "fatherAge" INTEGER,
  "fatherOccupation" TEXT,
  "fatherPhone" TEXT,
  "motherTitle" TEXT,
  "motherName" TEXT,
  "motherStatus" TEXT,
  "motherAge" INTEGER,
  "motherOccupation" TEXT,
  "motherPhone" TEXT,
  siblings INTEGER,
  "childOrder" INTEGER,

  -- Page 4 - Education (structured as JSON for flexibility with levels)
  "educationLevels" TEXT[],
  "educationData" JSONB,

  -- Intern education
  "internStudyYear" TEXT,
  "internGpa" DOUBLE PRECISION,
  "internInstitution" TEXT,
  "internFaculty" TEXT,
  "internMajor" TEXT,
  "advisorTitle" TEXT,
  "advisorName" TEXT,
  "advisorPhone" TEXT,
  "advisorEmail" TEXT,

  -- Page 5: Trainings (stored in TrainingItem table)
  -- Page 6: Work Experience (stored in WorkExperienceItem table)
  -- Page 7: Languages (stored in LanguageItem table)

  -- Page 8 - Skills
  "computerSkills" TEXT[],
  "excelSkills" TEXT[],
  "excelSkillsOther" TEXT,
  "wordSkills" TEXT[],
  "wordSkillsOther" TEXT,
  "powerpointSkills" TEXT[],
  "powerpointSkillsOther" TEXT,
  "photoshopSkills" TEXT[],
  "photoshopSkillsOther" TEXT,
  "otherSkills" TEXT,
  "interestedWork" TEXT,
  "travelMode" TEXT,
  "shuttleRoute" TEXT,
  "canDriveCar" TEXT,
  "carLicenseNumber" TEXT,
  "hasCar" TEXT,
  "carPlate" TEXT,
  "canDriveMotorcycle" TEXT,
  "motorcycleLicenseNumber" TEXT,
  "hasMotorcycle" TEXT,
  "motorcyclePlate" TEXT,
  "firedForMisconduct" TEXT,
  "firedReason" TEXT,

  -- Page 9 - Health
  smoke TEXT,
  "smokeReason" TEXT,
  "smokeFrequency" TEXT,
  alcohol TEXT,
  "alcoholReason" TEXT,
  "alcoholFrequency" TEXT,
  drugs TEXT,
  "drugsReason" TEXT,
  "seriousInjury" TEXT,
  "injuryDetail" TEXT,
  "chronicDisease" TEXT,
  "chronicDiseaseDetail" TEXT,
  "seriousDisease" TEXT,
  "seriousDiseaseDetail" TEXT,
  surgery TEXT,
  "surgeryDetail" TEXT,
  "firedForRule" TEXT,
  "firedRuleReason" TEXT,
  "jailed" TEXT,
  "jailedReason" TEXT,
  "debtLawsuit" TEXT,
  "debtReason" TEXT,
  healthy TEXT,
  "disabilityDetail" TEXT,
  pregnant TEXT,
  "pregnancyWeeks" TEXT,
  "severeMenstrualPain" TEXT,
  "mentalIllness" TEXT,
  "mentalIllnessDetail" TEXT,
  "wifePregnant" TEXT,
  "wifePregnancyWeeks" TEXT,

  -- Page 10 - Emergency contact
  "emTitle1" TEXT,
  "emName1" TEXT,
  "emRelation1" TEXT,
  "emPhone1" TEXT,
  "emTitle2" TEXT,
  "emName2" TEXT,
  "emRelation2" TEXT,
  "emPhone2" TEXT,
  "allowPrevEmployerContact" TEXT,
  "allowPrevEmployerReason" TEXT,
  "nonRelRelation" TEXT,
  "nonRelTitle" TEXT,
  "nonRelName" TEXT,
  "nonRelAddress" TEXT,
  "nonRelPhone" TEXT,
  "nonRelPosition" TEXT,

  -- Page 11-12 - Consent
  "consent1" TEXT,
  "consentSignerTitle" TEXT,
  "consentSignerName" TEXT,
  "consent2" TEXT,

  -- System
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Child tables for ApplicationForm
CREATE TABLE IF NOT EXISTS "TrainingItem" (
  id TEXT PRIMARY KEY,
  "formId" TEXT NOT NULL REFERENCES "ApplicationForm"(id) ON DELETE CASCADE,
  "courseName" TEXT NOT NULL,
  institution TEXT,
  year INTEGER,
  duration TEXT,
  certificate BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "WorkExperienceItem" (
  id TEXT PRIMARY KEY,
  "formId" TEXT NOT NULL REFERENCES "ApplicationForm"(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  "startDate" DATE,
  "endDate" DATE,
  salary DOUBLE PRECISION,
  "reasonForLeaving" TEXT,
  responsibilities TEXT
);

CREATE TABLE IF NOT EXISTS "LanguageItem" (
  id TEXT PRIMARY KEY,
  "formId" TEXT NOT NULL REFERENCES "ApplicationForm"(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  speaking TEXT,
  reading TEXT,
  writing TEXT,
  listening TEXT
);
