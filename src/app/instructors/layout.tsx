import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Treneri",
  description: `Glavni trener — ${site.headCoach.name}, ${site.headCoach.rank} ITF. Preusmjeravanje na O klubu.`,
};

export default function InstructorsLayout({ children }: { children: ReactNode }) {
  return children;
}
