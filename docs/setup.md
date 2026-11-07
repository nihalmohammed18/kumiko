# Setting up Kumiko in an app

Kumiko needs React 19 and Tailwind CSS 4.3 or later. It supports Safari 16.4+, Chrome 111+ and Firefox 128+.

```bash
npm install kumiko-ui
```

## 1. Styles

In your global stylesheet, after Tailwind:

```css
@import "tailwindcss";
@import "kumiko-ui/styles.css";
```

This adds Kumiko's variables (`--kumiko-*`), its theme classes (`bg-canvas`, `text-ink`, `rounded-control`…) and the
press recipe. It doesn't style `html` or `body`, and its class names don't collide with Tailwind's or shadcn/ui's, so
screens that don't use Kumiko yet look the same.

If your own code uses `dark:`, point it at the same switch Kumiko uses:

```css
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));
```

## 2. Fonts

Import the fonts once, from JavaScript, so your bundler resolves the files:

```tsx
import "kumiko-ui/fonts.css";
```

That loads Fredoka (headings), Nunito (text) and Baloo Bhaijaan 2 (Arabic and Urdu), self-hosted from Fontsource.
Skip it only if you load the same fonts another way.

## 3. The root layout

```tsx
import "kumiko-ui/fonts.css";
import { KumikoProvider } from "kumiko-ui";

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <div className="app-root">
          <KumikoProvider direction="ltr" locale="en">
            {children}
          </KumikoProvider>
        </div>
      </body>
    </html>
  );
}
```

```css
/* Popups render in a portal at the end of <body>. This keeps them above the page,
   whatever z-index your own styles use. */
.app-root {
  isolation: isolate;
}

/* iOS 26 Safari lets content show under its toolbars. Dialog backdrops cover the
   whole screen only if the body is a positioning context. */
body {
  position: relative;
}
```

Render one `KumikoProvider`. It gives every component the reading direction, the locale, translated labels and a
polite live region for announcements.

| Prop | What it does |
|---|---|
| `direction` | `"ltr"` or `"rtl"`. Also set `dir` on `<html>`. |
| `locale` | Picks labels and number formatting: `"en"`, `"ar"`, `"ur"` or any BCP 47 tag, such as `"ar-u-nu-arab"` for Arabic-Indic digits. |
| `labels` | Replaces individual built-in labels, such as `{ loading: "Saving…" }`. |
| `nonce` | Your CSP nonce, if you use one. Base UI adds it to the inline `<script>` tags it renders. Kumiko turns off Base UI's inline `<style>` tags, so those never need it. |

## 4. Dark mode

Put `class="dark"` or `data-theme="dark"` on `<html>`. Kumiko never follows the operating system on its own, so an app
without a dark theme never switches by surprise.

Set the theme and direction on `<html>`, not on a wrapper. Popups are rendered at the end of `<body>`, outside any
wrapper, and would miss them.

## 5. Right-to-left, Arabic and Urdu

Set `dir="rtl"` and `lang="ar"` or `lang="ur"` on `<html>`, and give the provider `direction="rtl"` and the same
locale. Layouts mirror, arrow keys follow the reading direction, and button labels drop the uppercase and letter
spacing that Arabic script doesn't use.

## 6. Next.js

Add this to `next.config.ts` so each page ships only the components it imports:

```ts
experimental: { optimizePackageImports: ["kumiko-ui"] },
```

`LinkButton`, `Link`, `Spinner` and the `buttonStyles` recipe render in server components. Interactive components
such as `Button` carry their own `"use client"`, so you can import them anywhere, but event handlers still need a
client component. To use Next's router, pass its link through `render`:

```tsx
import NextLink from "next/link";

<LinkButton tone="primary" render={<NextLink href="/jobs" />}>Browse jobs</LinkButton>
```
