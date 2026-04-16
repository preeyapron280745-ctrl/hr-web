import { Construction } from "lucide-react";

export default function PlaceholderPage({
  title,
  phase,
}: {
  title: string;
  phase?: string;
}) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex min-h-[60vh] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Construction className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">กำลังพัฒนา</h2>
          <p className="text-gray-600">
            หน้านี้อยู่ในขั้นตอนการพัฒนา{phase && ` (${phase})`}
          </p>
        </div>
      </div>
    </div>
  );
}
