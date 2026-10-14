// WCAG 2.x contrast for every token pair the direction pages rely on. Exits 1 if any pair fails.
import { readFileSync } from "node:fs";

const { directions, brands } = JSON.parse(readFileSync(new URL("./directions.json", import.meta.url)));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const failures = [];
const need = (dir, mode, a, b, min, t) => {
  const ratio = contrast(t[a] ?? a, t[b] ?? b);
  if (ratio < min) failures.push(`${dir} ${mode}: ${a} on ${b} = ${ratio.toFixed(2)} (needs ${min})`);
};

for (const d of directions) {
  for (const mode of ["light", "dark"]) {
    const t = d[mode];
    const grounds = ["canvas", "surface", "raised"];
    for (const g of [...grounds, "fill"]) need(d.id, mode, "fg", g, 4.5, t);
    for (const g of grounds) need(d.id, mode, "muted", g, 4.5, t);
    need(d.id, mode, "d-brand-fg", "d-brand", 4.5, t);
    need(d.id, mode, "accent-fg", "accent", 4.5, t);
    for (const g of grounds) need(d.id, mode, "d-brand", g, 3, t);
    for (const g of [...grounds, "fill"]) need(d.id, mode, "line-strong", g, 3, t);
    for (const g of grounds) need(d.id, mode, "focus", g, 3, t);
    for (const s of ["success", "warning", "danger", "info"]) {
      for (const g of grounds) need(d.id, mode, s, g, 4.5, t);
      need(d.id, mode, s, `${s}-subtle`, 4.5, t);
      need(d.id, mode, `${s}-fg`, s, 4.5, t);
    }
    for (let i = 1; i <= 6; i++) for (const g of ["canvas", "surface"]) need(d.id, mode, `series-${i}`, g, 3, t);
  }
}
for (const [id, b] of Object.entries(brands))
  for (const mode of ["light", "dark"]) {
    const ratio = contrast(b[mode][0], b[mode][1]);
    if (ratio < 4.5) failures.push(`brand ${id} ${mode}: text on brand = ${ratio.toFixed(2)}`);
  }

if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
console.log(`All pairs pass across ${directions.length} directions × light/dark.`);
