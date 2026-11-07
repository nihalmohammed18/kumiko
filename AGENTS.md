# Building Kumiko

Kumiko (`kumiko-ui` on npm) is the React component library for all of Nihal's products. It's built on Base UI and Tailwind CSS v4, with dark mode and right-to-left support. Its look is "Playground": chunky, tactile controls that sit on a darker lower edge and drop into it when pressed. The full plan is in `~/.claude/plans/what-can-we-do-serialized-forest.md`.

The owner's bar: the small details must be right everywhere. A disabled button never shows a pointer cursor, focus is always visible, nothing jumps when pressed, and right-to-left and dark mode are never an afterthought. The rules below and the checks behind them exist for that.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Storybook on port 6006. |
| `pnpm check` | Biome, types, the `scripts/check.ts` guards and unit tests. Run it before every push. |
| `pnpm test` | Every story in six real-Chromium projects (light, dark, rtl, touch, forced colours, full motion): play tests, axe, the UX rules and screenshot comparisons. |
| `pnpm build && pnpm validate` | Builds the package, then checks its exports with publint and attw. |
| `pnpm size` | Gzipped size of each entry; fails when one grows more than 10% over `size-baseline.json`. |
| `pnpm tokens` | Regenerates `src/tokens.css` and `src/theme.css` after editing `src/tokens.ts`. |
| `pnpm vrt:docker --update` | Makes screenshot baselines locally in CI's Linux image. Run `colima start` first. |

## Who does what

Implementation agents (Codex) work without a browser or network. They:
- **cannot** run the browser tests, Storybook or screenshot comparisons, and cannot install packages. List anything you couldn't verify at the end of your report.
- **must never:**
  - update, add or delete screenshot baselines;
  - edit `src/tokens.css` or `src/theme.css` by hand (run `pnpm tokens`);
  - weaken, skip or delete a guard, test or assertion to get to green;
  - add a UX or accessibility exception without a stated reason;
  - push to `main`, merge pull requests or touch `design/`.

## Rules

1. **Read Base UI's docs before building a part:** `node_modules/@base-ui/react/docs/react/components/<name>.md`, plus the handbook pages in `node_modules/@base-ui/react/docs/react/handbook/`. They match the installed version and override training data.
2. **Colours, radii, shadows, type, motion and layers come only from tokens.**
   - Use the theme classes in `src/theme.css`, generated from `src/tokens.ts` and imported by `src/styles.css`.
   - Never palette classes, hex values, arbitrary colours, raw `duration-*`/`ease-*` or raw `z-*`.
   - If something is missing, add it to `src/tokens.ts`.
3. **Use logical properties only.** `ms-`, `pe-`, `start-`, `border-s`, `rounded-s`, `text-start`, and `margin-inline-start` in CSS. Icons that point a direction flip in right-to-left.
4. **Use flat exports:** `Dialog`, `DialogTrigger`, `DialogContent`, never `Dialog.Trigger`. Server components can't dot into client modules.
5. **Keep server code safe.**
   - Put `"use client"` only in files that need it, and always in files that use client hooks. `scripts/check.ts` checks both.
   - Keep plain class recipes such as `buttonStyles` in their own `*-styles.ts` file without the directive, so server components can call them.
6. **Document every export** with JSDoc: a one-line summary, then "Use when:" and "Avoid when:". The agent guide that ships in the package is generated from these.
7. **Write stories for every component.**
   - One story for each variant and state, plus a `States` story that shows every state side by side.
   - `play` tests for the keyboard, pointer, disabled and invalid paths. Keys that depend on direction are tested under `globals.dir === "rtl"`.
   - Use retrying assertions (`await expect.poll(…)`, `waitFor`): one test project runs with full motion, and Base UI keeps popups mounted until their animations end.
8. **Accessibility checks stay on.** Turn one off only with an `// a11y-exception: <reason>` comment on the line above.
9. **The UX rules stay on.** After every story, the test runner checks the rules in the table below. An exception is allowed only as `parameters.ux.except: [{ rule, selector, reason }]`, with a reason a reviewer can judge. It is never a way to get to green.
10. **Components import icons from `src/icons.tsx`,** never from `lucide-react` directly. Stories may import lucide directly.
11. **Screenshot baselines need review.** Never accept new or changed ones without opening every image.
12. **Ship through pull requests.**
    - Work on a branch and open a PR with a conventional title (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
    - Keep each PR to about 800 changed lines, not counting screenshots.
    - Merge with `gh pr merge --squash --auto`. The title decides the next version once releases are on.
13. **Keep tests lean.** Write one test per behaviour, branch or past bug: a rule or guard needs one case that fails and one that passes, not every spelling of the input. No exhaustive tables of near-identical cases, and no test that only restates the implementation.

## The UX rules

| Rule | Every story must… |
|---|---|
| `cursor` | Show a pointer on enabled actionable elements and their labels, `not-allowed` on disabled ones (labels included), `progress` while loading, and a text cursor in text inputs. |
| `disabled-inert` | Keep a disabled control's look unchanged under hover and press. |
| `hover-visible`, `press-visible` | Make hover and press feedback actually visible. |
| `no-layout-shift` | Keep every element's position and size the same at rest, on hover, press and focus. |
| `focus-ring` | Show a keyboard focus ring at least 2px wide, at 3:1 contrast or more, not clipped or covered. Show no ring after a mouse click. |
| `target-size` | Make targets at least 24px (WCAG 2.5.8), and pressables at least 40px on touch screens. |
| `edge-clip`, `edge-visible` | Keep the pressable edge inside its scroll container and visible in both themes. |
| `reduce-no-move` | Move nothing when the user asks for reduced motion. Opacity may still change. |
| `transitions` | Never transition `all`. Keep interface transitions at 300ms or less. |
| `settle` | Finish animations within their budget, and unmount closed popups. |
| `reflow` | Never scroll sideways at 320px wide. |
| `text-overflow` | Keep text inside its box, including long translations. |
| `input-font` | Use text inputs of 16px or more, so phones don't zoom. |
| `no-sticky-hover` | Leave no hover style behind after a tap. |
| `boundary` | Keep a visible border on every control in Windows high-contrast mode. |
| `state-not-color` | Never show a state by colour alone. |
| `directional` | Flip direction-dependent icons in right-to-left. |
| `color-scheme` | Set `color-scheme` to match the theme. |
| `dead-class` | Use only classes that some CSS rule styles: a misspelt utility or a missing token generates nothing. |
| `stale-exception` | Remove exceptions that no longer match anything. |

## Component conventions

**API**
- Use Base UI's prop names (`value`/`defaultValue`/`onValueChange`, `open`/`onOpenChange`). Every stateful component works both controlled and uncontrolled.
- Spread the consumer's props first, then set the props Kumiko guarantees (`data-slot`, `data-loading`, `focusableWhenDisabled`). Combine event handlers with `mergeProps`. Refs are ordinary props in React 19.
- `data-slot` values and `--kumiko-*` variable names are public API under semver.
- Never render a Base UI Button as a link. Links use `LinkButton` or `Link`.
- Labels are plain data in `src/labels.ts` (English, Arabic and Urdu): strings and plural objects, never functions. Numbers go through `Intl` with the provider's locale.

**States.** Design every state an interactive part can be in: rest, hover, press, focus, disabled, loading, invalid, read-only, selected, checked, indeterminate and open.
- **Hover** only applies on devices that can hover. Tailwind's `hover:` variant already handles this.
- **Disabled:** `not-allowed` cursor; no hover or press change; same size and edge as when enabled. Never use `opacity` or `pointer-events: none` for it. Use native `disabled` by default. Use `focusableWhenDisabled` only while loading, or when a visible reason is linked with `aria-describedby`. Tooltips don't show on touch, so a tooltip can't be the only explanation.
- **Loading:** `data-loading` overrides the disabled look. The control keeps its colours, edge and width, shows a `progress` cursor, and announces once.
- **Focus:** a ring on keyboard focus only (`:focus-visible`). Never `outline-none`.

**Motion**
- Use the motion tokens and CSS transitions, not keyframes, for interactive parts, so they can be interrupted.
- Interface motion stays at 300ms or less. Popups grow from Base UI's `--transform-origin`.
- Changes driven by the keyboard (for example the highlighted menu item) are instant.
- Under reduced motion only opacity changes.
- Only the Spinner and Skeleton loop forever.

**Layout and theme**
- Components respond to their container (container queries). Only overlays and the app shell may use viewport breakpoints.
- Never `h-screen` or `100vh`. Long text wraps rather than overflowing.
- Dark mode comes only from `.dark` or `[data-theme="dark"]`. Components never use `dark:`: the tokens switch for them.
- In forced-colours mode, borders stay. Parts that show state with a fill (checkbox box, switch track, progress fill) set `forced-color-adjust: none`.
- Arabic and Urdu typography keys on `:lang(ar)` and `:lang(ur)`: no letter-spacing and no uppercase.

**The Playground look**
- No elevation shadows, blur or gradients.
- Uppercase appears only in the button and badge recipes.
- Pressable parts use the `press` utility with one `press-<tone>`; never one-off shadows, translations or hover colours.
