"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

/** `<details>` koji se zatvara pri `pointerdown` izvan elementa (npr. izbornik u headeru). */
export function OutsideClickDetails({ className, children }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const el = ref.current;
      if (!el?.open) return;
      const t = event.target;
      if (!(t instanceof Node)) return;
      if (el.contains(t)) return;
      el.open = false;
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}
