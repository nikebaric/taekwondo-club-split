"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Stara ruta /instructors — preusmjerava na odjeljak trenera na stranici O klubu. */
export default function InstructorsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/about#treneri");
  }, [router]);
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-[var(--muted)]">
      Preusmjeravanje na O klubu…
    </div>
  );
}
