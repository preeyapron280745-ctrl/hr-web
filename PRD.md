# Product Requirements Document (PRD)
# HR Recruitment Web Application

**เวอร์ชัน:** 1.0
**วันที่:** 2026-04-20
**สถานะ:** Live Production
**URL:** https://hr-web-six.vercel.app

---

## 1. Executive Summary

### 1.1 ภาพรวมของระบบ
HR Recruitment Web App คือระบบสรรหาและคัดเลือกบุคลากรออนไลน์ ที่พัฒนาขึ้นเพื่อทดแทน AppSheet เดิม โดยรองรับขั้นตอนการสรรหาครบวงจร ตั้งแต่การรับ Resume จนถึงการบรรจุเป็นพนักงาน

### 1.2 วัตถุประสงค์หลัก
- ทดแทนระบบ AppSheet เดิม ให้ใช้งานเร็วขึ้นและใช้งานง่ายขึ้น
- รองรับ **3 บริษัทในเครือ**: Comets HQ, Comets Factory, ICT Manufacturing
- รองรับ **พนักงาน 3 ประเภท**: รายเดือน, รายวัน, นักศึกษาฝึกงาน
- จัดการข้อมูล **5,000+ ใบสมัคร** ที่ import มาจาก Excel

### 1.3 Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage
- **Auth:** NextAuth v4 (Credentials Provider)
- **Deploy:** Vercel + GitHub Auto-deploy

---

## 2. User Personas

### 2.1 ผู้สมัครงาน (Applicant) — External
- **ไม่ต้อง login** เข้าเว็บ
- กรอกใบสมัครงานผ่านหน้า `/apply` (12 ขั้นตอน)
- ดูตำแหน่งงานที่เปิดรับที่ `/jobs`

### 2.2 HR (ฝ่ายบุคคล)
- Login: `hr` / `hr123`
- จัดการใบสมัครทั้งหมด คัดกรอง ส่งต่อให้หัวหน้าแผนก
- กรอก Resume ลงระบบ (From Resume)

### 2.3 Manager (หัวหน้าแผนก)
- Login: `mgr_it` / `it123` (คุณวี - ฝ่ายไอที)
- เห็นเฉพาะ Resume/ใบสมัครที่ส่งมาให้ตัวเอง
- ประเมินสัมภาษณ์ + ประเมินทดลองงาน

### 2.4 Admin (ผู้ดูแลระบบ)
- Login: `admin` / `admin123`
- เข้าถึงข้อมูลทั้งหมด
- จัดการผู้ใช้, แผนก, ตำแหน่งงาน

---

## 3. System Architecture

### 3.1 โครงสร้าง Database (31 ตาราง)

#### กลุ่มผู้ใช้
- `User` — Admin, HR, Manager (username, password bcrypt, department, role)
- `Reviewer` — รายชื่อผู้พิจารณาจาก Sheet Email (26 คน)
- `Department` — แผนก (20)
- `JobPosition` — ตำแหน่งงาน (314)

#### กลุ่มใบสมัคร
- `ApplicationForm` — Main table (~180 fields)
- `TrainingItem` — หลักสูตรอบรม (child)
- `WorkExperienceItem` — ประสบการณ์ทำงาน (child)
- `LanguageItem` — ความรู้ด้านภาษา (child)

#### กลุ่มประเมิน
- `InterviewEvaluation` — ใบประเมินสัมภาษณ์
- `ProbationEvaluation` — ใบประเมินทดลองงาน (รอบ 1, 2, 3)

#### ข้อมูลอ้างอิง
- `Hospital` — โรงพยาบาล (68)
- `Province` — จังหวัด (77)

### 3.2 สถานะใบสมัคร (FormStatus Enum)
```
DRAFT              → ร่าง (ไม่ใช้)
TANK               → ถังพัก (รอพิจารณา)
TANK_REJECTED      → ถังพัก (ไม่สนใจ)
RESUME             → Resume (รอพิจารณา)
SUBMITTED          → ส่งใบสมัครแล้ว
SCREENING          → กำลังคัดกรอง
INTERVIEW_SCHEDULED → นัดสัมภาษณ์
INTERVIEWED        → สัมภาษณ์แล้ว
PROBATION          → ทดลองงาน
HIRED              → บรรจุแล้ว
REJECTED           → ไม่ผ่าน/ปฏิเสธ
```

---

## 4. Functional Requirements

### 4.1 Public Pages (ไม่ต้อง login)

#### 4.1.1 หน้า Landing (`/`)
- Hero section + ปุ่ม "สมัครงาน" + "ดูตำแหน่งที่เปิดรับ"
- โทนสีขาว-เขียว

#### 4.1.2 หน้าตำแหน่งงาน (`/jobs`)
- แสดงตำแหน่งงานที่ active ทั้งหมด (ดึงจาก DB)
- **แยกตามบริษัท** (Comets HQ, Factory, ICT)
- Filter + Search
- คลิก "สมัครตำแหน่งนี้" → `/apply`

#### 4.1.3 ฟอร์มใบสมัคร (`/apply`) — **12 ขั้นตอน**
1. ประเภทพนักงาน (รายเดือน/รายวัน/ฝึกงาน)
2. ข้อมูลการสมัครงาน (บริษัท, ตำแหน่ง, แหล่งข่าว, รายได้)
3. ประวัติส่วนตัว (ชื่อ, ที่อยู่, ประกันสังคม, ครอบครัว, บิดา-มารดา)
4. ประวัติการศึกษา (ประถมถึงเอก — Dynamic)
5. หลักสูตรอบรม (ตารางลูก)
6. ประสบการณ์ทำงาน 3 บริษัทล่าสุด
7. ความรู้ด้านภาษา (ตารางลูก)
8. ทักษะพิเศษ (คอม, ขับรถ, รถรับ-ส่ง)
9. ประวัติสุขภาพ (สูบบุหรี่, สุรา, โรคประจำตัว, คดีความ)
10. ผู้ติดต่อฉุกเฉิน
11. รับทราบเงื่อนไข
12. PDPA Consent

**Logic:**
- Conditional rendering ตามประเภทพนักงาน + บริษัท
- คำนวณอายุจากวันเกิด
- Upload รูปถ่าย + Resume → Supabase Storage
- กด submit → สถานะ `SUBMITTED` → Success page (lock)

---

### 4.2 HR Portal (`/hr/*`)

#### 4.2.1 Dashboard รวม
4 การ์ดสรุป:
- จำนวน RESUME (status = RESUME)
- จำนวนใบสมัครงาน (SUBMITTED+)
- จำนวนใบประเมินสัมภาษณ์
- จำนวนใบประเมินทดลองงาน

Pipeline chart + แยกตามบริษัท + ประเภทพนักงาน

#### 4.2.2 ถังพัก (`/hr/tank`)
- แสดง status = `TANK` (2,357 records จาก Job Thai)
- ข้อมูล: ชื่อ, ตำแหน่ง, การศึกษา, ประสบการณ์, เงินเดือน, Resume
- Actions:
  - **ดูรายละเอียด** → หน้า detail
  - **Resume** → ดาวน์โหลดไฟล์
  - **สนใจ - ส่งต่อ** → สถานะเปลี่ยนเป็น RESUME
  - **ไม่สนใจ** → ระบุเหตุผล → TANK_REJECTED

#### 4.2.3 From Resume (`/hr/from-resume`)
HR กรอก Resume เข้าระบบ:
- ประเภทพนักงาน, บริษัท, ตำแหน่ง 1/2/3
- ช่องทาง, รหัสใบสมัคร (optional)
- ชื่อ-นามสกุล, อายุ, เพศ, เบอร์, Email
- ระดับการศึกษา (multi-select + detail fields)
- ประสบการณ์ล่าสุด (บริษัท, ตำแหน่ง, เงินเดือน)
- Upload Resume

กดบันทึก → status = `RESUME` → ไปหน้า Resume

#### 4.2.4 Resume (`/hr/resume`)
แสดง status = `RESUME`

**Flow ของแต่ละ Card:**

| สถานะ | ผู้ที่เห็นปุ่ม | ปุ่ม Action |
|------|------------|------------|
| รอส่งข้อมูล (ยังไม่มี reviewer) | HR | **ส่งข้อมูล** → เลือกผู้พิจารณาจาก Reviewer table |
| รอพิจารณา (reviewer = ชื่อตัวเอง) | Manager | **สนใจ** / **ไม่สนใจ** |
| สนใจ - นัดสัมภาษณ์ | HR | **คอนเฟิร์ม** → เลือก slot → INTERVIEW_SCHEDULED |
| ไม่สนใจ | — | อ่านอย่างเดียว |

**Modal "ส่งข้อมูล":**
- Search + select reviewer
- บันทึก → อัปเดต `reviewer1` + `tankStatus`

**Modal "สนใจ":**
- ระบุ **3 ช่วงเวลา** (วันที่ / เวลา 08:00-00:00 / ONSITE-ONLINE)
- ช่วงเวลาที่ 1 บังคับ

**Modal "ไม่สนใจ":**
- ระบุเหตุผล → status = TANK_REJECTED

**Modal "คอนเฟิร์ม":**
- แสดง 3 ช่วงเวลาที่หัวหน้าแผนกระบุ
- HR เลือก radio ช่วงที่คอนเฟิร์ม
- บันทึก → status = `INTERVIEW_SCHEDULED` → ย้ายไป `/hr/applications`

#### 4.2.5 ตำแหน่งงาน (`/hr/postings`)
- Tabs แยกตามบริษัท (ทั้งหมด / HQ / Factory / ICT)
- ตาราง: ชื่อตำแหน่ง, แผนก, บริษัท, สถานะ
- เพิ่ม/แก้ไข/เปิด-ปิดใช้งาน (ผ่าน Modal)

#### 4.2.6 Form ใบสมัคร (`/apply`)
ลิงก์เดียวกับผู้สมัคร — HR เปิดให้ผู้สมัครกรอกเอง

#### 4.2.7 ใบสมัครงาน (HR) (`/hr/applications`)
- แสดง status = SUBMITTED ขึ้นไป (ไม่รวม TANK/RESUME)
- Status tabs: ทั้งหมด / ส่งแล้ว / คัดกรอง / นัดสัมภาษณ์ / สัมภาษณ์แล้ว / ทดลองงาน / บรรจุ / ไม่ผ่าน
- Filter: บริษัท, ประเภทพนักงาน, Search
- คลิก row → หน้า detail
- Action buttons:
  - **เริ่มคัดกรอง** → SCREENING
  - **ผ่านคัดกรอง** → INTERVIEW_SCHEDULED
  - **รับเข้าทำงาน** → HIRED
  - **ไม่ผ่าน/ปฏิเสธ** → REJECTED

#### 4.2.8 ใบประเมินทดลองงาน (`/hr/probation`)
- Tabs: รายการใบประเมิน / ประเมินใหม่
- Scoring 1-5 ดาว: คุณภาพงาน, วินัย, ทีมเวิร์ค, ความรับผิดชอบ, การเรียนรู้, คะแนนรวม
- ครั้งที่ 1, 2, 3 (ครั้งที่ 3 ผ่าน → HIRED)
- ผ่าน/ไม่ผ่าน

#### 4.2.9 ไม่ผ่าน/ปฏิเสธ (`/hr/rejected`)
- แสดง status = REJECTED
- Filter + Search
- ปุ่ม "เปิดใบสมัครใหม่" → status กลับเป็น SUBMITTED

---

### 4.3 Manager Portal (`/manager/*`)

**Scope Filtering (สำคัญ):**
- Manager เห็น **Resume** เฉพาะที่ `reviewer1/2/3` = ชื่อตัวเอง
- Manager เห็น **ใบสมัคร/สัมภาษณ์** เฉพาะที่ตำแหน่งอยู่ในแผนกตัวเอง

#### 4.3.1 Dashboard
Same as HR Dashboard แต่ filter ด้วย department

#### 4.3.2 ข้อมูล Resume (`/manager/resume-data`)
- Resume ที่ HR ส่งให้ตัวเอง (reviewer1 = ชื่อ)
- ปุ่ม **สนใจ** / **ไม่สนใจ** (ส่งข้อมูลกลับ HR)
- Modal แจ้งวันนัดสัมภาษณ์ 3 ช่วงเวลา

#### 4.3.3 ใบสมัครงาน (หัวหน้าแผนก) (`/manager/reviews`)
- รายการผู้สมัครที่อยู่ในขั้นตอน INTERVIEW_SCHEDULED / INTERVIEWED
- คลิกเข้าดู detail → บันทึกใบประเมินสัมภาษณ์

#### 4.3.4 ใบประเมินสัมภาษณ์ (`/manager/interview-eval`)
- Scoring 1-5: บุคลิกภาพ, การสื่อสาร, ความรู้, ประสบการณ์, ทัศนคติ, รวม
- Recommendation **5 ระดับ**:
  - สมควรจ้าง → PROBATION
  - เห็นควรให้มีการสัมภาษณ์อีกครั้ง → INTERVIEW_SCHEDULED
  - เหมาะสมกับแผนกอื่น → INTERVIEWED
  - ไม่เหมาะสมในขณะนี้ (เก็บข้อมูล) → INTERVIEWED
  - ไม่เหมาะสม → REJECTED
- จุดแข็ง / จุดอ่อน / Note

#### 4.3.5 ใบประเมินทดลองงาน (`/manager/probation-eval`)
เหมือน HR version แต่ scope ของตัวเอง

#### 4.3.6 ไม่ผ่าน/ปฏิเสธ (`/manager/rejected`)
อ่านอย่างเดียว

---

### 4.4 Admin Portal (`/admin/*`)

- Dashboard (เห็นทุกแผนก ทุกบริษัท)
- จัดการ Users (เพิ่ม/ลบ/เปลี่ยนสิทธิ์)
- จัดการ Departments + Positions
- ตั้งค่าระบบ

---

## 5. Workflows (End-to-End)

### 5.1 Flow ใบสมัคร (ผู้สมัครกรอกเอง)
```
ผู้สมัคร → /apply (12 ขั้นตอน)
    ↓ submit
SUBMITTED
    ↓ HR เริ่มคัดกรอง
SCREENING
    ↓ HR ผ่านคัดกรอง
INTERVIEW_SCHEDULED
    ↓ Manager บันทึกใบประเมินสัมภาษณ์
INTERVIEWED
    ↓ สมควรจ้าง
PROBATION
    ↓ ประเมินครั้งที่ 1-3 ผ่าน
HIRED
```

### 5.2 Flow Resume (From Job Thai → HR → Manager)
```
Job Thai data / HR กรอก From Resume
    ↓
TANK (ถังพัก) หรือ RESUME (ส่งตรง)
    ↓ HR ส่งให้ผู้พิจารณา
RESUME + reviewer1 = "คุณวี"
    ↓ Manager "สนใจ" + ระบุ 3 ช่วงเวลา
RESUME + reviewerStatus1 = "สนใจ" + interviewSlot1-3
    ↓ HR คอนเฟิร์ม slot
INTERVIEW_SCHEDULED
    ↓ (ใช้ flow ใบสมัครต่อ)
```

### 5.3 Flow ปฏิเสธ
```
Manager "ไม่สนใจ" → TANK_REJECTED (เก็บเหตุผล)
HR "ไม่ผ่าน" → REJECTED (เปิดใหม่ได้)
Manager "ไม่เหมาะสม" → REJECTED
ประเมินทดลองงานไม่ผ่าน → REJECTED
```

---

## 6. Non-functional Requirements

### 6.1 Performance
- First load < 3s (Next.js static optimization)
- API response < 500ms

### 6.2 Security
- Password: bcrypt hash
- Session: JWT (NextAuth)
- Role-based access control (middleware)
- Manager department-scoped queries (API-level filter)
- Supabase Row-level security enabled

### 6.3 Data Privacy (PDPA)
- Consent form ในฟอร์มใบสมัคร
- เก็บข้อมูล 10 ปี (ตามที่ AppSheet เดิมระบุ)
- Lock after submit (ผู้สมัครแก้ไขไม่ได้หลัง submit)

### 6.4 Responsive
- Desktop + Tablet + Mobile
- Green/white theme consistent

### 6.5 Browser Support
Chrome, Edge, Firefox, Safari (ล่าสุด 2 versions)

---

## 7. Data Import

### 7.1 จาก Excel "ใบสมัคร Comets - ICT.xlsx" (32 sheets)
- ✅ จังหวัด (77)
- ✅ โรงพยาบาล (82)
- ✅ แผนก (20)
- ✅ ตำแหน่งงาน (304 → ทำเต็ม)
- ✅ User (33)
- ✅ Reviewer (26 — จาก Sheet Email)
- ✅ ใบสมัคร (1,179)
- ✅ ถังพัก (2,357)
- ✅ หลักสูตรอบรม (809)
- ✅ ประสบการณ์ทำงาน (1,292)
- ✅ ความรู้ด้านภาษา (1,280)
- ✅ ใบสัมภาษณ์ (56)
- ✅ ใบประเมินทดลองงาน (16)

**รวม: ~8,000+ records**

---

## 8. Out of Scope (ยังไม่ทำ)

- ❌ Email notification อัตโนมัติ (ตอนนี้แค่อัปเดต DB)
- ❌ Export PDF ใบสมัคร
- ❌ Applicant self-service (ติดตามสถานะของตัวเอง)
- ❌ Calendar integration สำหรับนัดสัมภาษณ์
- ❌ Report advanced (Time-to-hire, Funnel analysis)
- ❌ Mobile app (เป็น web responsive อย่างเดียว)
- ❌ AI resume screening
- ❌ Multi-language (ตอนนี้ไทยอย่างเดียว)

---

## 9. Tech Details

### 9.1 Folder Structure
```
src/
├── app/
│   ├── (public)/     — jobs, landing
│   ├── apply/        — ฟอร์มใบสมัคร 12 ขั้นตอน
│   ├── (hr)/         — HR pages
│   ├── (manager)/    — Manager pages
│   ├── (admin)/      — Admin pages
│   ├── login/        — Staff + Applicant login
│   └── api/          — API routes
├── components/
│   ├── ui/           — Button, Input, Select, Modal, Badge
│   └── layout/       — Sidebar, TopNav
├── lib/              — prisma, auth, supabase, utils, constants
└── types/            — TypeScript types
```

### 9.2 Key API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/application-forms` | List with filters |
| GET | `/api/application-forms/[id]` | Full detail |
| PATCH | `/api/application-forms/[id]` | Update status |
| PATCH | `/api/application-forms/[id]/reviewer` | Update reviewer/slots |
| POST | `/api/forms/submit` | Submit new form |
| GET | `/api/positions` | Job positions |
| GET | `/api/reviewers` | Reviewer list (from Email sheet) |
| GET | `/api/reference?type=hospitals\|provinces\|positions` | Reference data |
| POST | `/api/upload` | File upload to Supabase Storage |
| GET | `/api/stats` | Dashboard stats |

### 9.3 Deployment
- **GitHub:** https://github.com/preeyapron280745-ctrl/hr-web
- **Vercel:** Auto-deploy on push to master
- **Supabase:** https://supabase.com/dashboard/project/gjczmcwwmrrmqttbufqw

---

## 10. Accounts (Production)

| Role | Username | Password | ชื่อ |
|------|----------|----------|------|
| Admin | admin | admin123 | ผู้ดูแลระบบ |
| HR | hr | hr123 | ฝ่ายบุคคล |
| Manager IT | mgr_it | it123 | คุณวี |
| Manager MD | mgr_md | md123 | หัวหน้า MD |
| Manager อื่นๆ | (33 คนจาก Excel) | CM**** | ตามชื่อจริง |

---

## 11. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-20 | Initial PRD — ระบบ live ที่ hr-web-six.vercel.app |

---

**เอกสารนี้จัดทำจากระบบที่ deploy แล้วจริง — ทุกฟีเจอร์สามารถใช้งานได้ที่ https://hr-web-six.vercel.app**
