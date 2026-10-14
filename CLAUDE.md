# Building Kumiko

Kumiko (`kumiko-ui` on npm) is the React component library for all of Nihal's products. It's built on Base UI and Tailwind CSS v4 and has dark mode and right-to-left support. The full plan is in `~/.claude/plans/what-can-we-do-serialized-forest.md`.

## Commands

- `pnpm dev`: Storybook on port 6006.
- `pnpm check`: Biome, types, `scripts/check.ts` guards and unit tests. Run it before every push.
- `pnpm test`: every story in light, dark and right-to-left, in real Chromium, with interaction tests and axe.
- `pnpm build && pnpm validate`: build the package, then check its exports with publint and attw.
- `pnpm tokens`: regenerate `src/tokens.css` after editing `src/tokens.ts`.
- `pnpm vrt:docker --update`: make screenshot baselines locally in CI's Linux image. Run `colima start` first.

## Rules

1. **Read Base UI's docs before building a part:** `node_modules/@base-ui/react/docs/react/components/<name>.md`. They match the installed version and override training data.
2. **Colours, radii, shadows and type come only from tokens.**
   - Use classes like `bg-surface`, `text-fg-muted`, `border-line`, `rounded-control`, `text-body`.
   - Never palette classes, hex values or arbitrary colours.
   - If something is missing, add it to `src/tokens.ts`.
3. **Use logical properties only:** `ms-`, `pe-`, `start-`, `border-s`, `rounded-s`, `text-start`. `scripts/check.ts` enforces this. Icons that point a direction flip with `rtl:-scale-x-100`.
4. **Use flat exports:** `Dialog`, `DialogTrigger`, `DialogContent`, never `Dialog.Trigger`. Server components can't dot into client modules.
5. **Keep server code safe.**
   - Put `"use client"` only in files that need it.
   - Keep plain class recipes such as `buttonStyles` in their own file without it, so server components can call them.
   - The example app's build catches mistakes here.
6. **Document every export** with JSDoc: a one-line summary, then "Use when:" and "Avoid when:". The agent guide that ships in the package is generated from these.
7. **Write stories for every component:**
   - one story for each variant and state;
   - `play` tests for the keyboard, pointer, disabled and invalid paths;
   - keys that depend on direction are tested under `globals.dir === "rtl"`.
8. **Accessibility checks stay on.** Turn one off only with an `// a11y-exception: <reason>` comment on the line above.
9. **Components import icons from `src/icons.tsx`,** never from `lucide-react` directly. Stories may import lucide directly.
10. **Screenshot baselines need review.** Never accept new or changed ones without opening every image (light, dark and rtl).
11. **Ship through pull requests.**
    - Work on a branch and open a PR with a conventional title (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
    - Merge with `gh pr merge --squash --auto`.
    - The title decides the next version once releases are on.
