"use client";

import { SearchIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";
import { Input, type InputProps } from "./input.tsx";

/** Input props for a search query, with the search type guaranteed.
 * Use when: typing SearchField. Avoid when: typing a general text field; use InputProps.
 */
export type SearchFieldProps = Omit<InputProps, "type">;

/** A search input with a decorative icon at the inline start.
 * Use when: entering a search query. Avoid when: choosing from suggestions; use a combobox.
 */
export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <div data-slot="search-field" className="relative min-w-0 text-ink-muted has-[:disabled]:text-disabled-text">
      <Input {...props} type="search" className={cn("ps-11", className)} />
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5" />
    </div>
  );
}
