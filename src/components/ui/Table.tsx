"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ── Table ── */
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

/* ── TableHead ── */
interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHead({ children, className, ...props }: TableSectionProps) {
  return (
    <thead className={cn("bg-gray-50", className)} {...props}>
      {children}
    </thead>
  );
}

/* ── TableBody ── */
export function TableBody({ children, className, ...props }: TableSectionProps) {
  return (
    <tbody
      className={cn("divide-y divide-gray-200 bg-white", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

/* ── TableRow ── */
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

/* ── TableHeader (th) ── */
interface TableCellBaseProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export function TableHeader({ children, className, ...props }: TableCellBaseProps) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/* ── TableCell (td) ── */
export function TableCell({ children, className, ...props }: TableCellBaseProps) {
  return (
    <td
      className={cn("whitespace-nowrap px-4 py-3 text-gray-700", className)}
      {...props}
    >
      {children}
    </td>
  );
}
