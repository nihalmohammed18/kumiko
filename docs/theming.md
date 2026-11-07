# Theming

Every colour, font and radius Kumiko draws with is a CSS variable named `--kumiko-…`. An app gives Kumiko its brand by
overriding the variables it wants to change, after importing `kumiko-ui/styles.css`:

```css
:root {
  --kumiko-brand: #0f766e;
  --kumiko-brand-fg: #ffffff;
  --kumiko-brand-tint: #ccfbf1;
  --kumiko-brand-text: #115e59;
  --kumiko-focus: #0f766e;
  --kumiko-radius-control: 10px;
}

.dark {
  --kumiko-brand: #2dd4bf;
  --kumiko-brand-fg: #042f2e;
  --kumiko-brand-tint: #134e4a;
  --kumiko-brand-text: #99f6e4;
  --kumiko-focus: #5eead4;
}
```

Light values go on `:root`, dark values on `.dark` (or `[data-theme="dark"]`). Anything you leave alone keeps Kumiko's
default. Press edges and hover colours are mixed from the fills, so they follow your brand on their own. The focus ring
has its own variable, `--kumiko-focus`, so set it along with the brand.

## Colour roles

| Role | What it's for |
|---|---|
| `canvas`, `surface`, `field` | The page, raised areas such as cards and buttons, and form fields |
| `line`, `control-line` | Dividers, and the borders of controls |
| `ink`, `ink-muted` | Body text and secondary text |
| `strong`, `strong-fg` | A dark (in dark mode, light) accent fill and the text on it |
| `edge-neutral` | The press edge under neutral controls |
| `focus` | The keyboard focus ring |
| `scrim` | The overlay behind dialogs |
| `disabled-fill`, `disabled-text`, `disabled-line` | Disabled controls |

Nine colour families each come in four parts: the fill (`brand`), the text on that fill (`brand-fg`), a pale tint
(`brand-tint`) and a text colour that reads on the tint and on surfaces (`brand-text`). The families are `brand`,
`sun`, `leaf`, `coral`, `tide`, `success`, `warning`, `danger` and `info`.

Fonts are `--kumiko-font-display`, `--kumiko-font-body` and `--kumiko-font-code`. Radii are
`--kumiko-radius-control` (buttons and fields), `-card`, `-overlay` and `-pill`.

## Check a theme before you ship it

A new brand colour can quietly break contrast: white text on a light teal, or a focus ring that disappears on the
page. `checkTheme` catches that. It checks every text pair at 4.5:1 or more, focus rings and control borders at 3:1 or
more, and that the neutral press edge stands out from the page, in light and in dark.

```ts
import { checkTheme, themeCss, type Theme } from "kumiko-ui/tokens";

const theme: Theme = {
  light: { brand: "#0f766e", "brand-fg": "#ffffff", "brand-tint": "#ccfbf1", "brand-text": "#115e59", focus: "#0f766e" },
  dark: { brand: "#2dd4bf", "brand-fg": "#042f2e", "brand-tint": "#134e4a", "brand-text": "#99f6e4", focus: "#5eead4" },
  radii: { control: "10px" },
};

checkTheme(theme); // [] when it's fine, otherwise lines like "dark: brand-fg on brand is 3.21:1 (needs 4.5:1)"
themeCss(theme); // the CSS for the overrides above, ready to paste into your stylesheet
```

Run `checkTheme` in a test, so a later colour change can't slip through. `kumiko-ui/tokens` also exports Kumiko's
default values as plain data, for places CSS variables can't reach, such as emails and Open Graph images.
