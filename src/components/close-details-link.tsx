/**
 * CloseDetailsLink — a Next.js Link that closes its parent <details> element on click.
 *
 * KEY CONCEPTS:
 * - **DOM manipulation in React:** Uses `.closest("details")` to walk up the DOM tree
 *   and find the nearest <details> ancestor. Then sets `details.open = false` to close
 *   it. This is imperative DOM access — sometimes necessary alongside React's declarative model.
 * - **Client Component:** "use client" is required because it attaches an onClick handler.
 *   Server Components can't have event handlers.
 * - **ComponentProps<typeof Link>:** A TypeScript utility type that extracts all props
 *   from the Link component. This means CloseDetailsLink accepts the exact same props
 *   as Link (href, className, children, etc.) without manually listing them.
 * - **Spread props `...props`:** Passes all remaining props through to <Link>.
 *   The `onClick` is destructured separately so we can wrap it with custom behavior
 *   while still calling the original handler via `onClick?.(e)`.
 * - **Optional chaining `onClick?.(e)`:** Calls onClick only if it was provided.
 *   The `?.` prevents a crash when onClick is undefined.
 */
"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** Closes the nearest parent `<details>` on navigation — the menu doesn't stay open. */
export function CloseDetailsLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        // Call the original onClick handler if one was passed via props.
        onClick?.(e);
        // If the original handler called e.preventDefault(), respect that.
        if (e.defaultPrevented) return;
        // Walk up the DOM to find and close the parent <details> (dropdown menu).
        // `as HTMLElement` is a TypeScript type assertion — narrowing the generic EventTarget.
        const details = (e.currentTarget as HTMLElement).closest("details");
        if (details) details.open = false;
      }}
    />
  );
}
