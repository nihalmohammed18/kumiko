# Kumiko

Accessible React components built on [Base UI](https://base-ui.com) and Tailwind CSS v4. Dark mode and right-to-left layouts are built in. Each app gives Kumiko its own brand by overriding theme variables.

**Status: in development.** The first release will be 1.0.0. Browse the components in [Storybook](https://nihalmohammed18.github.io/kumiko/).

## Use it in an app

```bash
npm install kumiko-ui
```

In your global stylesheet:

```css
@import "tailwindcss";
@import "kumiko-ui/styles.css";

/* Your brand. Set the dark values too if your brand colour needs them. */
:root {
  --kumiko-brand: #0f766e;
  --kumiko-brand-fg: #ffffff;
  --kumiko-radius-control: 8px;
}
.dark {
  --kumiko-brand: #2dd4bf;
  --kumiko-brand-fg: #042f2e;
}
```

Load the fonts and wrap the app once, in the root layout:

```tsx
import "kumiko-ui/fonts.css";
import { KumikoProvider } from "kumiko-ui";

<KumikoProvider direction="ltr" locale="en">{children}</KumikoProvider>;
```

Next.js apps should also add `experimental: { optimizePackageImports: ["kumiko-ui"] }` to `next.config.ts`.

Requires React 19 and Tailwind CSS 4.3 or later, and supports Safari 16.4+, Chrome 111+ and Firefox 128+.

## License

MIT
