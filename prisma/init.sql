-- Enums
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'HR', 'MANAGER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'ID_CARD', 'HOUSE_REGISTRATION', 'EDUCATION_CERT', 'TRANSCRIPT', 'PHOTO', 'WORK_CERT', 'TRAINING_CERT', 'OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'REJECTED', 'WITHDRAWN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ScreeningResult" AS ENUM ('PASS', 'FAIL', 'HOLD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "InterviewType" AS ENUM ('ONSITE', 'ONLINE', 'PHONE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONGLY_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'NOT_RECOMMEND'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'REJECTED', 'REVISION_NEEDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role "Role" NOT NULL DEFAULT 'HR',
  department TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Department" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "JobPosition" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "departmentId" TEXT NOT NULL REFERENCES "Department"(id),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "JobPosting" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "positionId" TEXT NOT NULL REFERENCES "JobPosition"(id),
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  salary TEXT,
  "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
  "locationText" TEXT,
  openings INTEGER NOT NULL DEFAULT 1,
  status "PostingStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "closingDate" TIMESTAMP(3),
  "createdById" TEXT NOT NULL REFERENCES "User"(id),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Applicant" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  "titleTh" TEXT,
  "firstNameTh" TEXT NOT NULL,
  "lastNameTh" TEXT NOT NULL,
  "titleEn" TEXT,
  "firstNameEn" TEXT,
  "lastNameEn" TEXT,
  "idCardNumber" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  nationality TEXT,
  ethnicity TEXT,
  religion TEXT,
  gender "Gender",
  "maritalStatus" "MaritalStatus",
  "militaryStatus" TEXT,
  height DOUBLE PRECISION,
  weight DOUBLE PRECISION,
  "currentAddress" TEXT,
  "currentProvince" TEXT,
  "currentPostcode" TEXT,
  "permanentAddress" TEXT,
  "permanentProvince" TEXT,
  "permanentPostcode" TEXT,
  phone TEXT,
  "lineId" TEXT,
  "photoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Education" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  institution TEXT NOT NULL,
  faculty TEXT,
  major TEXT,
  gpa DOUBLE PRECISION,
  "startYear" INTEGER,
  "endYear" INTEGER,
  degree TEXT
);

CREATE TABLE IF NOT EXISTS "WorkExperience" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  salary DOUBLE PRECISION,
  "reasonForLeaving" TEXT,
  responsibilities TEXT
);

CREATE TABLE IF NOT EXISTS "ApplicantSkill" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  proficiency TEXT,
  detail TEXT
);

CREATE TABLE IF NOT EXISTS "LanguageSkill" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  speaking TEXT,
  reading TEXT,
  writing TEXT,
  listening TEXT
);

CREATE TABLE IF NOT EXISTS "Training" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  "courseName" TEXT NOT NULL,
  institution TEXT,
  year INTEGER,
  duration TEXT,
  certificate BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Reference" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  position TEXT,
  company TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS "EmergencyContact" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  address TEXT
);

CREATE TABLE IF NOT EXISTS "Document" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id) ON DELETE CASCADE,
  type "DocumentType" NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Application" (
  id TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "Applicant"(id),
  "jobPostingId" TEXT NOT NULL REFERENCES "JobPosting"(id),
  status "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
  "coverLetter" TEXT,
  "expectedSalary" DOUBLE PRECISION,
  "availableDate" TIMESTAMP(3),
  source TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("applicantId", "jobPostingId")
);

CREATE TABLE IF NOT EXISTS "StatusHistory" (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL REFERENCES "Application"(id) ON DELETE CASCADE,
  "fromStatus" "ApplicationStatus",
  "toStatus" "ApplicationStatus" NOT NULL,
  "changedBy" TEXT,
  note TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Screening" (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL UNIQUE REFERENCES "Application"(id),
  "screenedById" TEXT NOT NULL REFERENCES "User"(id),
  result "ScreeningResult" NOT NULL,
  "qualificationMatch" BOOLEAN NOT NULL DEFAULT false,
  "experienceMatch" BOOLEAN NOT NULL DEFAULT false,
  "salaryMatch" BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  "screenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Interview" (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL REFERENCES "Application"(id),
  round INTEGER NOT NULL DEFAULT 1,
  type "InterviewType" NOT NULL DEFAULT 'ONSITE',
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "scheduledTime" TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  "meetingLink" TEXT,
  "interviewerId" TEXT NOT NULL REFERENCES "User"(id),
  status "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
  rating INTEGER,
  strengths TEXT,
  weaknesses TEXT,
  recommendation "InterviewRecommendation",
  notes TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Approval" (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL UNIQUE REFERENCES "Application"(id),
  "approvedById" TEXT NOT NULL REFERENCES "User"(id),
  decision "ApprovalDecision" NOT NULL,
  "proposedSalary" DOUBLE PRECISION,
  "proposedStartDate" TIMESTAMP(3),
  notes TEXT,
  "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Offer" (
  id TEXT PRIMARY KEY,
  "applicationId" TEXT NOT NULL UNIQUE REFERENCES "Application"(id),
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary DOUBLE PRECISION NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  benefits TEXT,
  conditions TEXT,
  "offerLetterUrl" TEXT,
  "contractUrl" TEXT,
  status "OfferStatus" NOT NULL DEFAULT 'PENDING',
  "sentAt" TIMESTAMP(3),
  "respondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
