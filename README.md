# Kumiko

Accessible React components built on [Base UI](https://base-ui.com) and Tailwind CSS v4. Dark mode and right-to-left layouts are built in. Each app gives Kumiko its own brand by overriding theme variables.

**Status: in development.** The first release will be 1.0.0. Browse the components in [Storybook](https://nihalmohammed18.github.io/kumiko/).

## Use it in an app

```bash
npm install kumiko-ui
```

```css
/* Your global stylesheet */
@import "tailwindcss";
@import "kumiko-ui/styles.css";
```

```tsx
// Your root layout
import "kumiko-ui/fonts.css";
import { KumikoProvider } from "kumiko-ui";

<KumikoProvider direction="ltr" locale="en">{children}</KumikoProvider>;
```

The [setup guide](docs/setup.md) covers the rest: the app root, dark mode, right-to-left, CSP and Next.js. To give
Kumiko your brand, see [Theming](docs/theming.md).

## License

MIT
