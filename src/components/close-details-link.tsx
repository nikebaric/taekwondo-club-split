"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** Zatvara najbliži roditeljski `<details>` pri navigaciji — izbornik ne ostaje otvoren. */
export function CloseDetailsLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const details = (e.currentTarget as HTMLElement).closest("details");
        if (details) details.open = false;
      }}
    />
  );
}
