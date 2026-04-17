"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // bytes
  onUpload: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
  className?: string;
}

export default function FileUpload({
  accept,
  maxSize,
  onUpload,
  label = "อัปโหลดไฟล์",
  multiple = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      setError(null);

      if (maxSize) {
        const oversized = fileArray.find((f) => f.size > maxSize);
        if (oversized) {
          const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
          setError(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxMB} MB)`);
          return;
        }
      }

      onUpload(fileArray);
    },
    [maxSize, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndUpload(e.dataTransfer.files);
    },
    [validateAndUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
          isDragging
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50"
        )}
      >
        <UploadCloud
          className={cn(
            "h-10 w-10",
            isDragging ? "text-green-500" : "text-gray-400"
          )}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            ลากไฟล์มาวางที่นี่ หรือ{" "}
            <span className="text-green-600 underline">เลือกไฟล์</span>
          </p>
          {maxSize && (
            <p className="mt-1 text-xs text-gray-500">
              ขนาดสูงสุด {(maxSize / (1024 * 1024)).toFixed(0)} MB
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => validateAndUpload(e.target.files)}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
