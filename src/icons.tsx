import { Check, ChevronDown, type LucideProps, Minus, Plus, Search } from "lucide-react";

/** A decorative check mark with Kumiko's stroke weight.
 * Use when: marking a checked choice. Avoid when: an icon must provide its own accessible name.
 */
export function CheckIcon(props: LucideProps) {
  return <Check {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative minus mark with Kumiko's stroke weight.
 * Use when: marking an indeterminate choice. Avoid when: an icon must provide its own accessible name.
 */
export function MinusIcon(props: LucideProps) {
  return <Minus {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative plus mark with Kumiko's stroke weight.
 * Use when: identifying an increase or add action. Avoid when: an icon must provide its own accessible name.
 */
export function PlusIcon(props: LucideProps) {
  return <Plus {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

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
