"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

const EDU_LEVELS = [
  "ประถมศึกษา", "มัธยมต้น", "มัธยมปลาย",
  "อาชีวศึกษา", "อนุปริญญา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก",
];

function formatDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return ""; }
}

function val(v: any): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

function companyFullName(company: string): string {
  const map: Record<string, string> = {
    COMETS_HQ: "บริษัท คอมเม็ทส์ อินเตอร์เทรด จำกัด",
    COMETS_FACTORY: "บริษัท คอมเม็ทส์ อินเตอร์เทรด จำกัด",
    ICT: "บริษัท ไอซีที แมนูแฟคเจอริ่ง จำกัด",
  };
  return map[company] || company;
}

export default function PrintApplicationPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/application-forms/${params.id}`)
      .then((r) => r.json())
      .then((data) => setForm(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8">กำลังโหลด...</div>;
  if (!form) return <div className="p-8">ไม่พบข้อมูล</div>;

  const fullName = [form.titleTh, form.firstNameTh, form.lastNameTh].filter(Boolean).join(" ");
  const fullNameEn = [form.titleEn, form.firstNameEn, form.lastNameEn].filter(Boolean).join(" ");
  const isICT = form.company === "ICT";
  const eduData = form.educationData || {};

  return (
    <>
      {/* Screen-only controls */}
      <div className="print:hidden sticky top-0 z-50 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href={`/hr/applications/${params.id}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700">
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <Printer className="h-4 w-4" />
            พิมพ์/บันทึก PDF
          </button>
        </div>
      </div>

      <div className="printable mx-auto max-w-[210mm] bg-white p-8 text-sm text-gray-900">
        {/* Company Logo + Title */}
        <div className="mb-4 grid grid-cols-[1fr_2fr_1fr] items-center gap-2">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isICT ? "/logos/ict.jpg" : "/logos/comets.jpg"}
              alt={isICT ? "ICT Manufacturing" : "Comets"}
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">ใบสมัครงาน</h1>
            <p className="text-base">APPLICATION FORM</p>
          </div>
          <div className="flex justify-end">
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt="photo"
                className="h-32 w-24 border border-black object-cover"
              />
            ) : (
              <div className="flex h-32 w-24 items-center justify-center border border-black bg-gray-50 text-xs text-gray-400">
                รูปถ่าย
              </div>
            )}
          </div>
        </div>

        {/* Position & Source */}
        <div className="mb-3 border border-black">
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="p-2"><strong>ตำแหน่งที่ต้องการสมัครงาน:</strong> {val(form.positionTitle)}</div>
            <div className="p-2"><strong>ท่านทราบข่าวรับสมัคร:</strong> {(form.sourceOfInfo || []).join(", ")}</div>
          </div>
        </div>

        {/* Personal Info Header */}
        <div className="mb-0 bg-gray-100 p-1.5 text-center font-bold border border-black border-b-0">ประวัติส่วนตัว</div>

        <div className="mb-3 border border-black p-2 space-y-1.5">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <div><strong>ชื่อ-นามสกุล (ไทย):</strong> {fullName}</div>
            <div><strong>ชื่อเล่น (ไทย):</strong> {val(form.nicknameTh)}</div>
            <div><strong>ชื่อเล่น (อังกฤษ):</strong> {val(form.nicknameEn)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>ชื่อ-นามสกุล (อังกฤษ):</strong> {fullNameEn}</div>
            <div><strong>โทรศัพท์:</strong> {val(form.phone)}</div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div><strong>วัน/เดือน/ปีเกิด:</strong> {formatDate(form.dateOfBirth)}</div>
            <div><strong>อายุ:</strong> {val(form.age)} ปี</div>
            <div><strong>สัญชาติ:</strong> {val(form.nationality)}</div>
            <div><strong>เชื้อชาติ:</strong> {val(form.ethnicity)}</div>
            <div><strong>ศาสนา:</strong> {val(form.religion)}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><strong>ส่วนสูง:</strong> {val(form.height)} ซม.</div>
            <div><strong>น้ำหนัก:</strong> {val(form.weight)} กก.</div>
            <div className="col-span-1"><strong>E-mail:</strong> {val(form.email)}</div>
            <div><strong>ID Line:</strong> {val(form.lineId)}</div>
          </div>
          <div><strong>ที่อยู่ปัจจุบัน:</strong> {val(form.currentAddress)}</div>
          <div><strong>ที่อยู่ตามทะเบียนบ้าน:</strong> {val(form.permanentAddress)}</div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>สิทธิประกันสังคม:</strong> {val(form.socialSecurityStatus)}</div>
            <div><strong>โรงพยาบาล:</strong> {val(form.hospitalWithSS || form.hospitalNoSS)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>สถานะทางครอบครัว:</strong> {val(form.maritalStatus)}</div>
            <div><strong>คู่สมรส:</strong> {[form.spouseTitle, form.spouseName].filter(Boolean).join(" ")}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><strong>อาชีพคู่สมรส:</strong> {val(form.spouseOccupation)}</div>
            <div><strong>ที่ทำงาน:</strong> {val(form.spouseWorkplace)}</div>
            <div><strong>เบอร์:</strong> {val(form.spousePhone)}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><strong>บิดา:</strong> {[form.fatherTitle, form.fatherName].filter(Boolean).join(" ")}</div>
            <div><strong>สถานะ:</strong> {val(form.fatherStatus)}</div>
            <div><strong>อายุ:</strong> {val(form.fatherAge)}</div>
            <div><strong>เบอร์:</strong> {val(form.fatherPhone)}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><strong>มารดา:</strong> {[form.motherTitle, form.motherName].filter(Boolean).join(" ")}</div>
            <div><strong>สถานะ:</strong> {val(form.motherStatus)}</div>
            <div><strong>อายุ:</strong> {val(form.motherAge)}</div>
            <div><strong>เบอร์:</strong> {val(form.motherPhone)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><strong>พี่น้องร่วมบิดามารดา:</strong> {val(form.siblings)} คน</div>
            <div><strong>ท่านเป็นลูกคนที่:</strong> {val(form.childOrder)}</div>
          </div>
        </div>

        {/* Education */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">ประวัติการศึกษา</div>
        <table className="mb-3 w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-1">ระดับ</th>
              <th className="border border-black p-1">ชื่อสถานศึกษา</th>
              <th className="border border-black p-1">คณะ</th>
              <th className="border border-black p-1">สาขาวิชา</th>
              <th className="border border-black p-1">เริ่มปี พ.ศ.</th>
              <th className="border border-black p-1">สำเร็จปี พ.ศ.</th>
              <th className="border border-black p-1">เกรดเฉลี่ย</th>
            </tr>
          </thead>
          <tbody>
            {EDU_LEVELS.map((lvl) => {
              const fullLvl = `ระดับ${lvl}`;
              const d = eduData[fullLvl] || eduData[lvl] || {};
              return (
                <tr key={lvl}>
                  <td className="border border-black p-1">{lvl}</td>
                  <td className="border border-black p-1">{val(d.institution)}</td>
                  <td className="border border-black p-1">{val(d.faculty)}</td>
                  <td className="border border-black p-1">{val(d.major)}</td>
                  <td className="border border-black p-1">{val(d.startYear)}</td>
                  <td className="border border-black p-1">{val(d.endYear)}</td>
                  <td className="border border-black p-1">{val(d.gpa)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Training */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">หลักสูตรอบรม</div>
        <table className="mb-3 w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-1">หลักสูตรที่อบรม</th>
              <th className="border border-black p-1">สถานที่จัดอบรม</th>
              <th className="border border-black p-1">ระยะเวลา</th>
            </tr>
          </thead>
          <tbody>
            {(form.trainings || []).length === 0 ? (
              <tr><td colSpan={3} className="border border-black p-1 text-center text-gray-500">-</td></tr>
            ) : form.trainings.map((t: any, i: number) => (
              <tr key={i}>
                <td className="border border-black p-1">{val(t.courseName)}</td>
                <td className="border border-black p-1">{val(t.institution)}</td>
                <td className="border border-black p-1">{val(t.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print:break-before-page"></div>

        {/* Languages */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">ความรู้ด้านภาษา</div>
        <table className="mb-3 w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-1">ภาษา</th>
              <th className="border border-black p-1">ฟัง</th>
              <th className="border border-black p-1">พูด</th>
              <th className="border border-black p-1">อ่าน</th>
              <th className="border border-black p-1">เขียน</th>
            </tr>
          </thead>
          <tbody>
            {(form.languages || []).length === 0 ? (
              <tr><td colSpan={5} className="border border-black p-1 text-center text-gray-500">-</td></tr>
            ) : form.languages.map((l: any, i: number) => (
              <tr key={i}>
                <td className="border border-black p-1">{val(l.language)}</td>
                <td className="border border-black p-1">{val(l.listening)}</td>
                <td className="border border-black p-1">{val(l.speaking)}</td>
                <td className="border border-black p-1">{val(l.reading)}</td>
                <td className="border border-black p-1">{val(l.writing)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Work Experience */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">ประสบการณ์ทำงาน (ล่าสุดเริ่มบรรทัดแรกตามลำดับ)</div>
        <table className="mb-3 w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-1">ปีเริ่ม</th>
              <th className="border border-black p-1">ปีสิ้นสุด</th>
              <th className="border border-black p-1">บริษัท</th>
              <th className="border border-black p-1">ตำแหน่ง</th>
              <th className="border border-black p-1">หน้าที่</th>
              <th className="border border-black p-1">สาเหตุที่ออก</th>
            </tr>
          </thead>
          <tbody>
            {(form.workExperiences || []).length === 0 ? (
              <tr><td colSpan={6} className="border border-black p-1 text-center text-gray-500">-</td></tr>
            ) : form.workExperiences.map((w: any, i: number) => (
              <tr key={i}>
                <td className="border border-black p-1">{formatDate(w.startDate)}</td>
                <td className="border border-black p-1">{formatDate(w.endDate)}</td>
                <td className="border border-black p-1">{val(w.company)}</td>
                <td className="border border-black p-1">{val(w.position)}</td>
                <td className="border border-black p-1">{val(w.responsibilities)}</td>
                <td className="border border-black p-1">{val(w.reasonForLeaving)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Special Abilities */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">ความสามารถพิเศษ/อื่นๆ</div>
        <div className="mb-3 border border-black p-2 space-y-1 text-xs">
          <div><strong>คอมพิวเตอร์:</strong> {(form.computerSkills || []).join(", ")}</div>
          <div><strong>Excel:</strong> {(form.excelSkills || []).join(", ")}{form.excelSkillsOther ? `, ${form.excelSkillsOther}` : ""}</div>
          <div><strong>Word:</strong> {(form.wordSkills || []).join(", ")}{form.wordSkillsOther ? `, ${form.wordSkillsOther}` : ""}</div>
          <div><strong>Power Point:</strong> {(form.powerpointSkills || []).join(", ")}{form.powerpointSkillsOther ? `, ${form.powerpointSkillsOther}` : ""}</div>
          <div><strong>Photoshop:</strong> {(form.photoshopSkills || []).join(", ")}{form.photoshopSkillsOther ? `, ${form.photoshopSkillsOther}` : ""}</div>
          <div><strong>อื่นๆ:</strong> {val(form.otherSkills)}</div>
          <div className="grid grid-cols-4 gap-2">
            <div><strong>ขับรถยนต์:</strong> {val(form.canDriveCar)}</div>
            <div><strong>เลขที่ใบขับขี่:</strong> {val(form.carLicenseNumber)}</div>
            <div><strong>มีรถยนต์:</strong> {val(form.hasCar)}</div>
            <div><strong>ทะเบียน:</strong> {val(form.carPlate)}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div><strong>ขับมอเตอร์ไซด์:</strong> {val(form.canDriveMotorcycle)}</div>
            <div><strong>เลขที่ใบขับขี่:</strong> {val(form.motorcycleLicenseNumber)}</div>
            <div><strong>มี มอไซค์:</strong> {val(form.hasMotorcycle)}</div>
            <div><strong>ทะเบียน:</strong> {val(form.motorcyclePlate)}</div>
          </div>
          <div><strong>เคยถูกไล่ออกเพราะทุจริต:</strong> {val(form.firedForMisconduct)} {form.firedReason && `(${form.firedReason})`}</div>
        </div>

        {/* Health */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">ประวัติสุขภาพ</div>
        <table className="mb-3 w-full border-collapse border border-black text-xs">
          <tbody>
            <tr>
              <td className="border border-black p-1"><strong>สูบบุหรี่:</strong> {val(form.smoke)}</td>
              <td className="border border-black p-1">ความถี่: {val(form.smokeFrequency)}</td>
              <td className="border border-black p-1">เหตุผล: {val(form.smokeReason)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1"><strong>ดื่มสุรา:</strong> {val(form.alcohol)}</td>
              <td className="border border-black p-1">ความถี่: {val(form.alcoholFrequency)}</td>
              <td className="border border-black p-1">เหตุผล: {val(form.alcoholReason)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}><strong>ยาเสพติด:</strong> {val(form.drugs)}</td>
              <td className="border border-black p-1">{val(form.drugsReason)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}><strong>ร่างกายหัก/แตกรุนแรง:</strong> {val(form.seriousInjury)}</td>
              <td className="border border-black p-1">{val(form.injuryDetail)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}><strong>โรคประจำตัว:</strong> {val(form.chronicDisease)}</td>
              <td className="border border-black p-1">{val(form.chronicDiseaseDetail)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}><strong>โรคติดต่อร้ายแรง:</strong> {val(form.seriousDisease)}</td>
              <td className="border border-black p-1">{val(form.seriousDiseaseDetail)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}><strong>ผ่าตัด:</strong> {val(form.surgery)}</td>
              <td className="border border-black p-1">{val(form.surgeryDetail)}</td>
            </tr>
          </tbody>
        </table>

        <div className="print:break-before-page"></div>

        {/* Emergency Contacts */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">กรณีฉุกเฉิน</div>
        <div className="mb-3 border border-black p-2 text-xs space-y-1">
          <div><strong>ผู้ติดต่อคนที่ 1:</strong> {[form.emTitle1, form.emName1].filter(Boolean).join(" ")} | เกี่ยวข้อง: {val(form.emRelation1)} | เบอร์: {val(form.emPhone1)}</div>
          {form.emName2 && (
            <div><strong>ผู้ติดต่อคนที่ 2:</strong> {[form.emTitle2, form.emName2].filter(Boolean).join(" ")} | เกี่ยวข้อง: {val(form.emRelation2)} | เบอร์: {val(form.emPhone2)}</div>
          )}
          <div><strong>ขัดข้องหากบริษัทสอบถามนายจ้างเก่า:</strong> {val(form.allowPrevEmployerContact)} {form.allowPrevEmployerReason && `(${form.allowPrevEmployerReason})`}</div>
        </div>

        {/* Non-Relative Reference */}
        {form.nonRelName && (
          <>
            <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">บุคคลอ้างอิง (ไม่ใช่ญาติ)</div>
            <table className="mb-3 w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-1">ความสัมพันธ์</th>
                  <th className="border border-black p-1">ชื่อ-สกุล</th>
                  <th className="border border-black p-1">ที่อยู่/บริษัท</th>
                  <th className="border border-black p-1">โทรศัพท์</th>
                  <th className="border border-black p-1">ตำแหน่ง</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1">{val(form.nonRelRelation)}</td>
                  <td className="border border-black p-1">{[form.nonRelTitle, form.nonRelName].filter(Boolean).join(" ")}</td>
                  <td className="border border-black p-1">{val(form.nonRelAddress)}</td>
                  <td className="border border-black p-1">{val(form.nonRelPhone)}</td>
                  <td className="border border-black p-1">{val(form.nonRelPosition)}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Income */}
        <div className="mb-2 bg-gray-100 p-1.5 text-center font-bold border border-black">แหล่งรายได้ปัจจุบัน</div>
        <div className="mb-3 border border-black p-2 text-xs space-y-1">
          <div><strong>แหล่งรายได้ปัจจุบัน:</strong> {(form.incomeTypes || []).join(", ")}</div>
          <div className="grid grid-cols-4 gap-2">
            {form.currentSalary && <div>เงินเดือน: {form.currentSalary?.toLocaleString()}</div>}
            {form.otAllowance && <div>ค่าโอที: {form.otAllowance?.toLocaleString()}</div>}
            {form.shiftAllowance && <div>ค่ากะ: {form.shiftAllowance?.toLocaleString()}</div>}
            {form.positionAllowance && <div>ค่าตำแหน่ง: {form.positionAllowance?.toLocaleString()}</div>}
            {form.foodAllowance && <div>ค่าอาหาร: {form.foodAllowance?.toLocaleString()}</div>}
            {form.travelAllowance && <div>ค่าเดินทาง: {form.travelAllowance?.toLocaleString()}</div>}
            {form.bonusYearly && <div>โบนัส: {form.bonusYearly?.toLocaleString()}</div>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><strong>เงินเดือนที่ต้องการ (ต่ำสุด):</strong> {form.expectedSalaryMin?.toLocaleString() || "-"}</div>
            <div><strong>สูงสุด:</strong> {form.expectedSalaryMax?.toLocaleString() || "-"}</div>
            <div><strong>วันที่สะดวกเริ่มงาน:</strong> {formatDate(form.availableStartDate)}</div>
          </div>
        </div>

        {/* Certify */}
        <div className="mb-4 border border-black p-3 text-xs leading-relaxed">
          <p className="mb-2">ข้าพเจ้าขอรับรองว่า ข้อมูลทั้งหมดที่ระบุไว้ในใบสมัครนี้เป็นความจริงทุกประการ หากพบหรือปรากฏเป็นความเท็จ ภายหลังกระบวนการจ้างงานเสร็จสมบูรณ์แล้ว ทางบริษัทฯ มีสิทธิ์ที่จะยกเลิกสัญญาจ้างงาน โดยไม่ต้องจ่ายเงินชดเชยความเสียหายใดใดทั้งสิ้น</p>
          <p className="mb-2">ข้าพเจ้ายินยอมให้บริษัทฯ ตรวจสอบประวัติส่วนบุคคล ประวัติอาชญากรรม และประวัติ/ประสบการณ์การทำงานที่ผ่านมา</p>
          <p><strong>ท่านยินยอมหรือไม่:</strong> {val(form.consent1)}</p>
          <div className="mt-4 flex justify-end gap-12">
            <div className="text-center">
              <div>ลงชื่อ .................................................... ผู้สมัครงาน</div>
              <div className="mt-1">({fullName})</div>
              <div className="mt-1">วันที่ {formatDate(form.submittedAt)}</div>
            </div>
          </div>
        </div>

        <div className="print:break-before-page"></div>

        {/* PDPA Consent */}
        <div className="mb-4 text-center">
          <h2 className="font-bold">หนังสือให้ความยินยอมการเก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคล</h2>
          <p className="text-xs">(Consent Form) สำหรับผู้สมัครงาน</p>
        </div>

        <div className="text-xs leading-relaxed space-y-2">
          <p>ข้าพเจ้า {fullName} ผู้สมัครงานกับ {companyFullName(form.company)} ยินยอมให้ {companyFullName(form.company)} เก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าที่มีอยู่กับ {companyFullName(form.company)} ภายใต้รายละเอียด ข้อกำหนดและเงื่อนไข ดังต่อไปนี้</p>
          <div>
            <p className="font-bold">1. ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม</p>
            <p className="pl-4">1.1 ข้อมูลส่วนบุคคลทั่วไป เช่น ชื่อ นามสกุล ภาพถ่าย ที่อยู่ หมายเลขโทรศัพท์ ประวัติการศึกษา ประวัติการทำงาน และข้อมูลส่วนบุคคลอื่น ๆ</p>
            <p className="pl-4">1.2 ข้อมูลส่วนบุคคลที่มีความละเอียดอ่อน เช่น หมู่โลหิต เชื้อชาติ ศาสนา ประวัติอาชญากรรม และข้อมูลสุขภาพ</p>
          </div>
          <div>
            <p className="font-bold">2. วัตถุประสงค์การเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</p>
            <p className="pl-4">เพื่อการติดต่อสื่อสารเพื่อการนัดหมายการสัมภาษณ์งาน อำนวยความสะดวกในกระบวนการสรรหา และการพิจารณาตรวจสอบความเหมาะสมของผู้สมัครงานในการจ้างงาน</p>
          </div>
          <div>
            <p className="font-bold">3. แหล่งที่มาของข้อมูลส่วนบุคคล</p>
            <p className="pl-4">3.1 ข้อมูลจากเจ้าของข้อมูลโดยตรง</p>
            <p className="pl-4">3.2 ข้อมูลจากแหล่งอื่น เช่น เว็บไซต์รับสมัครงาน</p>
          </div>
          <div>
            <p className="font-bold">4. ระยะเวลาในการเก็บรวบรวม</p>
            <p className="pl-4">{companyFullName(form.company)} จะเก็บข้อมูลเป็นระยะเวลา 10 ปี</p>
          </div>
          <div>
            <p className="font-bold">5. การเปิดเผยข้อมูลส่วนบุคคล</p>
            <p className="pl-4">{companyFullName(form.company)} จะเปิดเผยข้อมูลให้โรงพยาบาลและสำนักงานตำรวจแห่งชาติเพื่อพิจารณาการจ้างงาน</p>
          </div>
          <div>
            <p className="font-bold">6. สิทธิของเจ้าของข้อมูลส่วนบุคคล</p>
            <p className="pl-4">ผู้สมัครงานมีสิทธิถอนความยินยอม ขอเข้าถึง ขอสำเนา ขอแก้ไข ขอโอน คัดค้าน หรือขอให้ลบข้อมูล</p>
          </div>
          <div>
            <p className="font-bold">7. ช่องทางการติดต่อ</p>
            <p className="pl-4">{companyFullName(form.company)} | ฝ่ายทรัพยากรบุคคล</p>
            {isICT ? (
              <p className="pl-4">เลขที่ 190 หมู่ที่ 9 ตำบลบางโฉลง อำเภอบางพลี สมุทรปราการ | โทร 02-115 8235</p>
            ) : (
              <p className="pl-4">เลขที่ 9 ซอยศรีนครินทร์ 38 อาคาร Comets Global Head Quarter กรุงเทพมหานคร 10250 | โทร 02-288-0769</p>
            )}
          </div>
          <p>ข้าพเจ้าได้อ่าน รับทราบและเข้าใจรายละเอียดในการเก็บรวบรวม ใช้ และ/หรือเปิดเผยข้อมูลส่วนบุคคล</p>
          <p><strong>ท่านยินยอมหรือไม่:</strong> {val(form.consent2 || form.consent1)}</p>
        </div>

        <div className="mt-8 flex justify-between gap-8 text-xs">
          <div className="text-center">
            <div>ลงชื่อ .................................................... ผู้ให้คำยินยอม</div>
            <div className="mt-1">({fullName})</div>
            <div className="mt-1">ผู้สมัครงาน</div>
            <div>วันที่ {formatDate(form.submittedAt)}</div>
          </div>
          <div className="text-center">
            <div>ลงชื่อ .................................................... พยาน</div>
            <div className="mt-1">(............................................)</div>
            <div className="mt-1">ฝ่ายทรัพยากรบุคคล</div>
            <div>วันที่ ............................</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:break-before-page { break-before: page; }
          .printable { padding: 10mm !important; max-width: none !important; font-size: 10pt; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
        @page { size: A4; margin: 10mm; }
      `}</style>
    </>
  );
}
