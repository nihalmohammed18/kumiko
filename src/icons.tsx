import { ChevronDown, type LucideProps, Search } from "lucide-react";

/** A decorative search icon with Kumiko's stroke weight.
 * Use when: identifying a search field or action. Avoid when: an icon must provide its own accessible name.
 */
export function SearchIcon(props: LucideProps) {
  return <Search {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative downward chevron with Kumiko's stroke weight.
 * Use when: indicating a select or disclosure. Avoid when: indicating a reading direction; use a directional icon.
 */
export function ChevronDownIcon(props: LucideProps) {
  return <ChevronDown {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}
