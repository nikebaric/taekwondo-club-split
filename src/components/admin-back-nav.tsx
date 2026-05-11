/**
 * AdminBackNav — a "Back" button that navigates to the previous page in browser history.
 *
 * KEY CONCEPTS:
 * - **useRouter hook:** `next/navigation`'s useRouter provides programmatic navigation.
 *   `router.back()` is equivalent to the browser's back button — it goes to the previous
 *   entry in the history stack. Unlike `router.push("/some-path")`, it doesn't navigate
 *   to a fixed URL.
 * - **Client Component requirement:** useRouter is a React hook that needs browser APIs
 *   (history stack), so "use client" is mandatory. Server Components can't use hooks.
 * - **Nullish coalescing for defaults:** `className ?? "font-medium"` uses the provided
 *   className if truthy, otherwise falls back to "font-medium". Different from `||`
 *   because `??` only triggers on null/undefined (not empty string or 0).
 */
"use client";

import { useRouter } from "next/navigation";

type Props = {
  /** E.g. font-semibold — defaults to font-medium. */
  className?: string;
};

/** Navigates back in browser history (like a "back" button), not a fixed URL. */
export function AdminBackNav({ className }: Props) {
  // useRouter() returns the Next.js router instance with methods like
  // push(), back(), refresh(), replace(). Only available in Client Components.
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
