"use client";

import { useRouter } from "next/navigation";

type Props = {
  label: string;
  className?: string;
};

export function AdminBackNav({ label, className }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline bg-transparent p-0 font-[inherit] text-[var(--accent)] underline-offset-2 hover:underline ${className ?? "font-medium"}`}
    >
      {label}
    </button>
  );
}
