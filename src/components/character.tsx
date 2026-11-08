import { type ComponentProps, useId } from "react";

/** SVG props, cast member, pose and dimensions for a character.
 * Use when: typing Character. Avoid when: showing an object without a face; use IllustrationProps.
 */
export interface CharacterProps extends Omit<ComponentProps<"svg">, "name" | "children"> {
  name: "pip" | "mori" | "tuck";
  pose?: "idle" | "waving" | "cheering" | "thinking" | "sleepy" | "oops";
  size?: number | string;
  /** Gives the art an accessible name; omit it for decorative art. */
  title?: string;
}

// Approved round-two geometry: pebble → Pip, bean → Mori, block → Tuck.
const cast = {
  pip: {
    body: <ellipse cx="90" cy="100" rx="53" ry="48" />,
    left: 39,
    right: 141,
    shoulder: 100,
    head: 52,
    eyes: [74, 106, 93, 10, 10],
    mouth: 113,
    foot: 153,
    highlight: <ellipse cx="65" cy="72" rx="10" ry="17" transform="rotate(35 65 72)" />,
    shade: <ellipse cx="139" cy="134" rx="22" ry="22" />,
    crown: (
      <>
        <path d="M90 56v-13" fill="none" stroke="var(--kumiko-leaf)" strokeWidth="4" strokeLinecap="round" />
        <g fill="var(--kumiko-leaf)">
          <ellipse cx="82" cy="43" rx="9" ry="4" transform="rotate(30 82 43)" />
          <ellipse cx="98" cy="41" rx="9" ry="4" transform="rotate(-30 98 41)" />
        </g>
      </>
    ),
  },
  mori: {
    body: <rect x="52" y="35" width="76" height="113" rx="38" />,
    left: 53,
    right: 127,
    shoulder: 92,
    head: 35,
    eyes: [76, 104, 82, 8, 12],
    mouth: 104,
    foot: 153,
    highlight: <ellipse cx="68" cy="59" rx="8" ry="18" transform="rotate(24 68 59)" />,
    shade: <ellipse cx="127" cy="132" rx="18" ry="23" />,
    crown: (
      <path
        d="M84 38q-9-16 5-18q14 0 7 11q-4 4-7-1"
        fill="none"
        stroke="var(--kumiko-cast-shade)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    ),
  },
  tuck: {
    body: (
      <>
        <ellipse cx="65" cy="57" rx="13" ry="8" />
        <ellipse cx="115" cy="57" rx="13" ry="8" />
        <rect x="38" y="57" width="104" height="88" rx="22" />
      </>
    ),
    left: 40,
    right: 140,
    shoulder: 101,
    head: 49,
    eyes: [70, 110, 95, 8, 9],
    mouth: 115,
    foot: 148,
    highlight: <rect x="53" y="66" width="31" height="10" rx="5" />,
    shade: <ellipse cx="140" cy="132" rx="21" ry="21" />,
    crown: null,
  },
} as const;

/** Pip, Mori or Tuck in a static pose, recoloured by the product's palette.
 * Use when: adding friendly art to an empty state or a moment of delight.
 * Avoid when: conveying essential information without text, or when a product uses objects only.
 */
export function Character({ name, pose = "idle", size = 180, title, ...props }: CharacterProps) {
  const clipId = useId();
  const c = cast[name];
  const cheering = pose === "cheering";
  const waving = pose === "waving";
  const thinking = pose === "thinking";
  const sleepy = pose === "sleepy";
  const oops = pose === "oops";
  const [eyeLeft, eyeRight, eyeY, eyeRX, eyeRY] = c.eyes;
  const hands: [number, number][] = cheering
    ? [
        [c.left - 9, c.head - 4],
        [c.right + 9, c.head - 4],
      ]
    : [
        [c.left - 8, c.shoulder + 28],
        waving ? [c.right + 14, c.shoulder - 37] : oops ? [c.right + 2, c.head + 24] : [c.right + 8, c.shoulder + 28],
      ];
  const armY = c.head - 4 + (c.shoulder - 40) * 0.75;
  const arms = cheering
    ? hands.map(([x, y], index) => `M${index ? c.right : c.left} ${armY}L${x} ${y}`)
    : [
        `M${c.left} ${c.shoulder}q-14 13-8 28`,
        waving
          ? `M${c.right} ${c.shoulder}q22 0 20-18l-6-19`
          : oops
            ? `M${c.right} ${c.shoulder}q20-4 16-23L${c.right + 2} ${c.head + 24}`
            : `M${c.right} ${c.shoulder}q14 13 8 28`,
      ];
  return (
    <svg
      {...props}
      data-slot="character"
      data-character={name}
      data-pose={pose}
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
      <defs>
        <clipPath id={clipId}>{c.body}</clipPath>
      </defs>
      {cheering && (
        <ellipse data-slot="character-ground" cx="90" cy="164" rx="30" ry="4" fill="var(--kumiko-cast-ground)" />
      )}
      <g transform={cheering ? "translate(0 -12)" : undefined}>
        <g
          fill="none"
          stroke="var(--kumiko-cast-body)"
          strokeWidth={cheering ? 9 : 7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {arms.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="var(--kumiko-cast-body)">
          {hands.map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5.5" />
          ))}
          {cheering ? (
            <>
              <ellipse cx="72" cy="148" rx="11" ry="6" transform="rotate(-12 72 148)" />
              <ellipse cx="108" cy="148" rx="11" ry="6" transform="rotate(12 108 148)" />
            </>
          ) : (
            <>
              {name !== "tuck" && (
                <>
                  <rect x="63" y="139" width="10" height="15" rx="5" />
                  <rect x="107" y="139" width="10" height="15" rx="5" />
                </>
              )}
              <ellipse cx="68" cy={c.foot} rx="13" ry={name === "tuck" ? 6 : 7} />
              <ellipse cx="112" cy={c.foot} rx="13" ry={name === "tuck" ? 6 : 7} />
            </>
          )}
          {c.body}
        </g>
        <g clipPath={`url(#${clipId})`}>
          {name === "tuck" && (
            <g fill="var(--kumiko-cast-body)">
              <rect x="54" y="55" width="22" height="6" />
              <rect x="104" y="55" width="22" height="6" />
            </g>
          )}
          <g fill="var(--kumiko-cast-highlight)">{c.highlight}</g>
          <g fill="var(--kumiko-cast-shade)">{c.shade}</g>
        </g>
        {c.crown}
        {[eyeLeft, eyeRight].map((x) =>
          cheering || sleepy ? (
            <path
              key={x}
              d={`M${x - eyeRX} ${eyeY}q${eyeRX} ${cheering ? -eyeRY : 6} ${eyeRX * 2} 0`}
              fill="none"
              stroke="var(--kumiko-cast-ink)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <g key={x}>
              <ellipse
                cx={x + (thinking ? 2 : 0)}
                cy={eyeY - (thinking ? 3 : 0)}
                rx={eyeRX + (oops ? 2 : 0)}
                ry={eyeRY + (oops ? 3 : 0)}
                fill="var(--kumiko-cast-ink)"
              />
              <circle
                cx={x + (thinking ? 5 : -3)}
                cy={eyeY - (thinking ? 8 : 4)}
                r="3"
                fill="var(--kumiko-art-white)"
              />
            </g>
          ),
        )}
        <g fill={cheering ? "var(--kumiko-cast-blush-strong)" : "var(--kumiko-cast-blush)"}>
          <ellipse cx={eyeLeft - 15} cy={eyeY + 16} rx={cheering ? 9 : 7} ry="4" />
          <ellipse cx={eyeRight + 15} cy={eyeY + 16} rx={cheering ? 9 : 7} ry="4" />
        </g>
        {cheering || waving ? (
          <>
            <path
              d={`M74 ${c.mouth - 2}h32q0 ${cheering ? 23 : 18}-16 ${cheering ? 23 : 18}t-16-${cheering ? 23 : 18}Z`}
              fill="var(--kumiko-cast-ink)"
            />
            {cheering && <ellipse cx="90" cy={c.mouth + 15} rx="9" ry="4" fill="var(--kumiko-cast-blush-strong)" />}
          </>
        ) : oops ? (
          <circle cx="90" cy={c.mouth + 2} r="5" fill="var(--kumiko-cast-ink)" />
        ) : (
          <path
            d={thinking ? `M86 ${c.mouth + 1}l10-1` : sleepy ? `M85 ${c.mouth}q5 3 10 0` : `M81 ${c.mouth}q9 8 18 0`}
            fill="none"
            stroke="var(--kumiko-cast-ink)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
        {cheering &&
          hands.map(([x, y]) => (
            <g key={x} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d={`M${x - 4} ${y - 4}v-4m4 3v-5m4 6v-4`} stroke="var(--kumiko-cast-body)" />
              <path d={`M${x} ${y - 21}v10m-5-5h10`} stroke="var(--kumiko-sun)" />
            </g>
          ))}
        {waving && (
          <path
            d={`M${c.right + 24} ${c.shoulder - 45}q6 5 2 11m5-15q8 7 3 17`}
            fill="none"
            stroke="var(--kumiko-cast-shade)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {thinking && (
          <g data-slot="character-thoughts" fill="var(--kumiko-cast-shade)">
            <circle cx="148" cy="73" r="3" />
            <circle cx="158" cy="57" r="4" />
            <circle cx="161" cy="38" r="5" />
          </g>
        )}
        {sleepy && (
          <g
            data-slot="character-sleep-marks"
            fill="none"
            stroke="var(--kumiko-cast-shade)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path data-slot="character-sleep-mark" d="M141 69h8l-8 8h8" />
            <path data-slot="character-sleep-mark" d="M151 49h10l-10 10h10" />
            <path data-slot="character-sleep-mark" d="M159 26h13l-13 13h13" />
          </g>
        )}
        {oops && (
          <path d={`M${c.right + 12} ${c.head - 7}q-7 10-7 15a7 7 0 0 0 14 0q0-5-7-15Z`} fill="var(--kumiko-tide)" />
        )}
      </g>
    </svg>
  );
}
