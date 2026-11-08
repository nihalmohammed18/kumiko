import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  File,
  Info,
  type LucideProps,
  Minus,
  Plus,
  Search,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { cn } from "./lib/tv.ts";

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

/** A decorative inline-end chevron, mirrored in right-to-left layouts.
 * Use when: indicating a submenu. Avoid when: indicating a downward disclosure; use ChevronDownIcon.
 */
export function ChevronRightIcon({ className, ...props }: LucideProps) {
  return (
    <ChevronRight
      {...props}
      className={cn(className, "rtl:-scale-x-100")}
      aria-hidden
      strokeWidth={2.5}
      data-slot="icon"
      data-icon-directional
    />
  );
}

/** A decorative cross with Kumiko's stroke weight.
 * Use when: identifying a clear or close action. Avoid when: an icon must provide its own accessible name.
 */
export function XIcon(props: LucideProps) {
  return <X {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative information symbol with Kumiko's stroke weight.
 * Use when: drawing a note's icon inside a labelled image. Avoid when: an icon must provide its own accessible name.
 */
export function InfoIcon(props: LucideProps) {
  return <Info {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative circled check with Kumiko's stroke weight.
 * Use when: drawing a success icon inside a labelled image. Avoid when: marking a checked choice; use CheckIcon.
 */
export function CircleCheckIcon(props: LucideProps) {
  return <CircleCheck {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative warning triangle with Kumiko's stroke weight.
 * Use when: drawing a warning icon inside a labelled image. Avoid when: identifying an error; use CircleAlertIcon.
 */
export function TriangleAlertIcon(props: LucideProps) {
  return <TriangleAlert {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative circled exclamation mark with Kumiko's stroke weight.
 * Use when: drawing an error icon inside a labelled image. Avoid when: identifying a warning; use TriangleAlertIcon.
 */
export function CircleAlertIcon(props: LucideProps) {
  return <CircleAlert {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative upload icon with Kumiko's stroke weight.
 * Use when: identifying a file picker or dropzone. Avoid when: an icon must provide its own accessible name.
 */
export function UploadIcon(props: LucideProps) {
  return <Upload {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}

/** A decorative file outline with Kumiko's stroke weight.
 * Use when: identifying a selected file. Avoid when: an icon must provide its own accessible name.
 */
export function FileIcon(props: LucideProps) {
  return <File {...props} aria-hidden strokeWidth={2.5} data-slot="icon" />;
}
