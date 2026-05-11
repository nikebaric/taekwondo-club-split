/**
 * OutsideClickDetails — a <details> element that auto-closes when clicking outside.
 *
 * KEY CONCEPTS:
 * - **useRef for DOM references:** `useRef<HTMLDetailsElement>` creates a stable
 *   reference to the actual DOM element. Unlike state, changing a ref doesn't trigger
 *   a re-render. It's the bridge between React's virtual DOM and the real DOM.
 * - **useEffect cleanup pattern:** The effect adds a global `pointerdown` listener
 *   on mount and returns a cleanup function that removes it. React calls the cleanup
 *   when the component unmounts (or before re-running the effect). Without cleanup,
 *   listeners would accumulate and cause memory leaks.
 * - **Empty dependency array `[]`:** Means "run once on mount, clean up on unmount."
 *   The handler reads `ref.current` on each call (always fresh) so no dependencies needed.
 * - **`pointerdown` vs `click`:** pointerdown fires before click, letting us close the
 *   menu before the click event reaches other elements. It also works with touch/pen.
 * - **`el.contains(t)`:** Checks if the click target is inside the details element.
 *   If it is, we don't close — the user is interacting with the menu content.
 * - **ReactNode type:** The broadest type for children — accepts JSX elements, strings,
 *   numbers, arrays, null, and fragments.
 */
"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;  // ReactNode accepts any valid React child content
};

/** `<details>` that closes on `pointerdown` outside the element (e.g. header menu). */
export function OutsideClickDetails({ className, children }: Props) {
  // useRef creates a persistent reference to the DOM element.
  // `ref.current` is null until React attaches it after the first render.
  // The generic <HTMLDetailsElement> gives us type-safe access to details-specific properties.
  const ref = useRef<HTMLDetailsElement>(null);

  // useEffect with [] dependency: runs once after mount, cleanup runs on unmount.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const el = ref.current;
      // Optional chaining: if el is null or not open, skip.
      if (!el?.open) return;
      const t = event.target;
      // `instanceof Node` type guard: ensures t is a DOM node before calling .contains().
      if (!(t instanceof Node)) return;
      // If the click is inside the element, don't close.
      if (el.contains(t)) return;
      el.open = false;
    }

    document.addEventListener("pointerdown", handlePointerDown);
    // Cleanup function: removes the listener when the component unmounts.
    // Without this, the listener would persist even after the component is gone.
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // The `ref` prop tells React to store a reference to this DOM element in `ref.current`.
  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}
