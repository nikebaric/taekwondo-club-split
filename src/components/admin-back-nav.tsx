"use client";

import { useRouter } from "next/navigation";

type Props = {
  /** Npr. font-semibold — inače font-medium */
  className?: string;
};

/** Povratak u povijest preglednika (kao tipka „natrag”), ne fiksni URL. */
export function AdminBackNav({ className }: Props) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline bg-transparent p-0 font-[inherit] text-[var(--accent)] underline-offset-2 hover:underline ${className ?? "font-medium"}`}
    >
      ← Natrag
    </button>
  );
}
