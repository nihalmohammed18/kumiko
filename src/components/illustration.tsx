import type { ComponentProps } from "react";

/** SVG props, object name and dimensions for faceless art.
 * Use when: typing Illustration. Avoid when: showing one of the cast; use CharacterProps.
 */
export interface IllustrationProps extends Omit<ComponentProps<"svg">, "name" | "children"> {
  name:
    | "envelope"
    | "calendar"
    | "sealed-envelope"
    | "waiting-calendar"
    | "dates"
    | "lantern"
    | "arch"
    | "crescent"
    | "star"
    | "trophy"
    | "flame";
  size?: number | string;
  /** Gives the art an accessible name; omit it for decorative art. */
  title?: string;
}

const calendarGrid = (
  <g
    stroke="none"
    fontFamily="var(--kumiko-font-body)"
    fontSize="var(--kumiko-art-calendar-font-size)"
    fontWeight="var(--kumiko-art-calendar-font-weight)"
    textAnchor="middle"
  >
    <rect x="94" y="73" width="14" height="66" rx="7" fill="var(--kumiko-brand-tint)" />
    <text x="45" y="79" fill="var(--kumiko-ink-muted)">
      M
    </text>
    <text x="59" y="79" fill="var(--kumiko-ink-muted)">
      T
    </text>
    <text x="73" y="79" fill="var(--kumiko-ink-muted)">
      W
    </text>
    <text x="87" y="79" fill="var(--kumiko-ink-muted)">
      T
    </text>
    <text x="101" y="79" fill="var(--kumiko-brand-text)">
      F
    </text>
    <text x="115" y="79" fill="var(--kumiko-ink-muted)">
      S
    </text>
    <text x="129" y="79" fill="var(--kumiko-ink-muted)">
      S
    </text>
    {Array.from({ length: 21 }, (_, index) => {
      const date = index + 1;
      const x = 45 + (index % 7) * 14;
      const y = 92 + Math.floor(index / 7) * 20;
      const friday = index % 7 === 4;
      return (
        <g key={date}>
          {friday && <circle cx={x} cy={y - 2} r="6" fill="var(--kumiko-brand)" />}
          <text x={x} y={y} fill={friday ? "var(--kumiko-brand-fg)" : "var(--kumiko-ink-muted)"}>
            {date}
          </text>
        </g>
      );
    })}
  </g>
);

// Approved object shapes, with symbol references expanded into their geometry.
const shapes = {
  envelope: (
    <>
      <rect x="25" y="59" width="130" height="80" rx="16" fill="var(--kumiko-brand)" />
      <rect x="28" y="113" width="124" height="23" rx="11" fill="var(--kumiko-art-dark)" />
      <path
        d="m29 66 61 43 61-43"
        fill="none"
        stroke="var(--kumiko-art-light)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <rect x="39" y="119" width="31" height="6" rx="3" fill="var(--kumiko-art-light)" />
    </>
  ),
  calendar: (
    <>
      <rect x="32" y="40" width="112" height="116" rx="16" fill="var(--kumiko-field)" />
      <rect x="32" y="40" width="112" height="32" rx="14" fill="var(--kumiko-brand)" />
      <rect x="32" y="57" width="112" height="15" fill="var(--kumiko-brand)" stroke="none" />
      <rect x="54" y="28" width="10" height="28" rx="5" fill="var(--kumiko-art-dark)" />
      <rect x="112" y="28" width="10" height="28" rx="5" fill="var(--kumiko-art-dark)" />
      <rect x="72" y="54" width="26" height="4" rx="2" fill="var(--kumiko-art-light)" stroke="none" />
      {calendarGrid}
      <rect x="121" y="143" width="15" height="5" rx="2.5" fill="var(--kumiko-line)" stroke="none" />
    </>
  ),
  "sealed-envelope": (
    <>
      <rect x="25" y="59" width="130" height="80" rx="16" fill="var(--kumiko-brand)" />
      <rect x="28" y="113" width="124" height="23" rx="11" fill="var(--kumiko-art-dark)" />
      <path
        d="m29 66 61 43 61-43"
        fill="none"
        stroke="var(--kumiko-art-light)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <rect x="39" y="119" width="31" height="6" rx="3" fill="var(--kumiko-art-light)" />
      <circle cx="90" cy="109" r="12" fill="var(--kumiko-sun)" />
      <path
        d="m90 100 2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5Z"
        fill="var(--kumiko-brand)"
        stroke="none"
      />
    </>
  ),
  "waiting-calendar": (
    <>
      <rect x="32" y="40" width="112" height="116" rx="16" fill="var(--kumiko-field)" />
      <rect x="32" y="40" width="112" height="32" rx="14" fill="var(--kumiko-brand)" />
      <rect x="32" y="57" width="112" height="15" fill="var(--kumiko-brand)" stroke="none" />
      <rect x="54" y="28" width="10" height="28" rx="5" fill="var(--kumiko-art-dark)" />
      <rect x="112" y="28" width="10" height="28" rx="5" fill="var(--kumiko-art-dark)" />
      <rect x="72" y="54" width="26" height="4" rx="2" fill="var(--kumiko-art-light)" stroke="none" />
      {calendarGrid}
      <rect x="121" y="143" width="15" height="5" rx="2.5" fill="var(--kumiko-line)" stroke="none" />
      <g transform="translate(108 108) scale(0.4)">
        <rect x="25" y="59" width="130" height="80" rx="16" fill="var(--kumiko-brand)" />
        <rect x="28" y="113" width="124" height="23" rx="11" fill="var(--kumiko-art-dark)" />
        <path
          d="m29 66 61 43 61-43"
          fill="none"
          stroke="var(--kumiko-art-light)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <rect x="39" y="119" width="31" height="6" rx="3" fill="var(--kumiko-art-light)" />
      </g>
    </>
  ),
  dates: (
    <>
      <ellipse cx="67" cy="97" rx="29" ry="47" transform="rotate(-23 67 97)" fill="var(--kumiko-sun)" />
      <ellipse cx="119" cy="101" rx="28" ry="44" transform="rotate(22 119 101)" fill="var(--kumiko-sun-text)" />
      <ellipse cx="57" cy="82" rx="8" ry="24" transform="rotate(-23 57 82)" fill="var(--kumiko-sun-tint)" />
      <ellipse cx="111" cy="87" rx="8" ry="23" transform="rotate(22 111 87)" fill="var(--kumiko-sun)" />
      <path
        d="m55 136 19-68m41 71 10-63"
        fill="none"
        stroke="var(--kumiko-sun-text)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  ),
  lantern: (
    <>
      <path d="M63 49q27-40 54 0" fill="none" stroke="var(--kumiko-brand)" strokeWidth="9" />
      <rect x="48" y="59" width="84" height="89" rx="20" fill="var(--kumiko-sun)" />
      <rect x="62" y="75" width="56" height="55" rx="12" fill="var(--kumiko-sun-tint)" />
      <rect x="78" y="88" width="24" height="34" rx="12" fill="var(--kumiko-brand)" />
      <rect x="45" y="49" width="90" height="18" rx="9" fill="var(--kumiko-brand)" />
      <rect x="51" y="138" width="78" height="17" rx="8" fill="var(--kumiko-art-dark)" />
    </>
  ),
  arch: (
    <>
      <rect x="41" y="29" width="98" height="131" rx="49" fill="var(--kumiko-sun)" />
      <rect x="41" y="111" width="98" height="49" rx="6" fill="var(--kumiko-sun)" />
      <rect x="56" y="48" width="68" height="111" rx="34" fill="var(--kumiko-brand)" />
      <rect x="56" y="109" width="68" height="50" rx="3" fill="var(--kumiko-brand)" />
      <rect x="65" y="70" width="10" height="43" rx="5" fill="var(--kumiko-art-light)" />
      <circle cx="106" cy="118" r="6" fill="var(--kumiko-sun-tint)" />
    </>
  ),
  crescent: (
    <>
      <path d="M113 30a61 61 0 1 0 37 96 51 51 0 0 1-37-96Z" fill="var(--kumiko-brand)" />
      <path
        d="M54 54a51 51 0 0 0 9 82"
        fill="none"
        stroke="var(--kumiko-art-light)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </>
  ),
  star: (
    <>
      <path d="m90 25 19 39 43 6-31 31 7 44-38-20-38 20 7-44-31-31 43-6Z" fill="var(--kumiko-sun)" />
      <path d="m75 67 15-25 9 22" fill="none" stroke="var(--kumiko-sun-tint)" strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  trophy: (
    <>
      <rect x="79" y="93" width="23" height="47" rx="8" fill="var(--kumiko-sun-text)" />
      <rect x="52" y="134" width="77" height="20" rx="10" fill="var(--kumiko-sun)" />
      <path
        d="M48 57H25v16q0 30 35 25m72-41h23v16q0 30-35 25"
        fill="none"
        stroke="var(--kumiko-sun-text)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect x="45" y="35" width="91" height="78" rx="32" fill="var(--kumiko-sun)" />
      <rect x="58" y="47" width="12" height="37" rx="6" fill="var(--kumiko-sun-tint)" />
      <path d="m90 54 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill="var(--kumiko-sun-text)" />
    </>
  ),
  flame: (
    <>
      <path
        d="M94 23c9 32 39 43 40 72 2 36-18 59-46 59-31 0-54-21-49-51 3-20 19-32 30-49 0 24 9 22 12 9 4-14 3-26 13-40Z"
        fill="var(--kumiko-sun)"
      />
      <path d="M90 87c4 18 21 27 18 43-3 20-33 23-38 2-4-16 8-29 20-45Z" fill="var(--kumiko-sun-text)" />
      <ellipse cx="114" cy="94" rx="5" ry="17" transform="rotate(-22 114 94)" fill="var(--kumiko-sun-tint)" />
    </>
  ),
};

/** A static object illustration recoloured by the product's palette.
 * Use when: adding decorative art to an empty state, including products that show no faces.
 * Avoid when: conveying an actual date or other essential information without text.
 */
export function Illustration({ name, size = 180, title, ...props }: IllustrationProps) {
  return (
    <svg
      {...props}
      data-slot="illustration"
      data-illustration={name}
      viewBox="0 0 180 180"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-labelledby={undefined}
      aria-hidden={title ? undefined : true}
      tabIndex={undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <g strokeLinejoin="round">{shapes[name]}</g>
    </svg>
  );
}
