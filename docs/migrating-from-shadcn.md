# Migrating from shadcn/ui

Move one working screen at a time. Keep shadcn/ui beside Kumiko until its last consumer has moved.
The [setup](setup.md), [theming](theming.md) and [form](forms.md) guides cover the underlying APIs.

This guide uses First Jobby as the example. Its `components.json` selects shadcn's New York style and
`app/globals.css`; its app uses React 19 and Tailwind CSS v4. Paths below are relative to First Jobby's root.

## Component mapping

Import Kumiko's flat exports from `kumiko-ui`. There are no `Dialog.Content` or `Menu.Item` exports.

| First Jobby's shadcn/ui file and exports | Kumiko replacement | What changes |
| --- | --- | --- |
| `button`: Button, buttonVariants | Button, IconButton, LinkButton, Link, buttonStyles | `variant` becomes `tone`. Use `sm`, `md` or `lg` sizes. Navigation uses LinkButton or Link. Replace the class recipe with `buttonStyles`. |
| `input`: Input | Input inside Field | Native input props and `onChange` still work. `size` selects a Kumiko control size. Field connects its label, description and errors. |
| `label`: Label | FieldLabel inside Field; FieldsetLegend for a group | There is no standalone Kumiko Label. Add the containing Field rather than renaming Label alone. A native `<label htmlFor>` remains suitable outside Field. |
| `form`: Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage, useFormField | React Hook Form's FormProvider and Controller, plus Field, FieldLabel, FieldDescription and FieldError | shadcn's Form is a FormProvider alias. Kumiko's Form renders a form and handles validation. FormItem becomes Field; FormControl's Slot disappears; render the control directly. Keep RHF's provider if other app code uses its context. |
| `command`: Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem | Combobox, ComboboxInput, ComboboxPopup, ComboboxGroup, ComboboxGroupLabel, ComboboxItem | For the location picker, supply `items`, `itemToStringLabel` and a boolean `filter`. Render options with ComboboxPopup's function child. Selection moves from item `onSelect` to root `onValueChange`. Empty text comes from the provider's `noMatches` label. There is no general Command export. |
| `dialog`: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogPortal, DialogOverlay | Dialog, DialogTrigger, DialogPopup, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose | Content becomes Popup, which owns its portal, backdrop and permanent close button. Remove separate Portal and Overlay. Header has no wrapper export; place Title and Description above DialogBody. `showCloseButton` is not supported. Set width with Popup's `size`. |
| `dropdown-menu`: DropdownMenu and its parts | Menu and its parts | Content becomes MenuPopup; Label becomes MenuGroupLabel inside MenuGroup. Use MenuLinkItem for destinations. CheckboxItem, RadioGroup, RadioItem and Separator keep their suffixes. Sub becomes MenuSubmenu, SubTrigger becomes MenuSubmenuTrigger, and SubContent becomes MenuPopup inside the submenu. Use `shortcut` and `icon` props; destructive item `variant` becomes `tone="danger"`. Portal is internal. |
| `popover`: Popover, PopoverTrigger, PopoverContent | Popover, PopoverTrigger, PopoverPopup | Content becomes Popup, which owns its portal and positioner. Popup accepts `side`, logical `align`, `sideOffset` and `arrow`. Compose a custom trigger with `render`. |
| `select`: Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton | Select, SelectTrigger, SelectValue, SelectPopup, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator | Content becomes Popup; Label becomes GroupLabel. Popup owns the portal, list and placement, so remove scroll-button parts and Radix's `position="popper"`. Use root `items` to provide display labels when they differ from stored values. A single value may be `null`. |
| `navigation-menu`: NavigationMenu and its parts, navigationMenuTriggerStyle | A named `<nav>` with Link or LinkButton; MenuLinkItem for popup destinations; Sidebar for an app shell | There is no Kumiko NavigationMenu or shared mega-menu viewport. This file has no current app imports; the navbar uses DropdownMenu and links. Keep any required custom navigation until its interaction has a replacement. |
| `sonner`: Toaster; toast imported from sonner | Toaster and toast | Mount one Kumiko Toaster inside KumikoProvider. Toast titles are strings. `duration` becomes `timeout`; `toast.loading` and Sonner's `theme`, `richColors` and `position` options have no direct equivalent. See the notification migration below. |

MenuPopup and SelectPopup own an eight-pixel gap and their positioning. Their public props do not include
Radix Content's `align` or `sideOffset`; remove those props when moving these two components.

### Button tones and sizes

Kumiko defaults to `tone="secondary"` and `size="md"`. Choose the tone for the action's purpose.
These choices change the appearance; Kumiko has no outline variant.

| shadcn variant | Kumiko choice |
| --- | --- |
| `default` | `primary` for the main action, otherwise `secondary` |
| `destructive` | `danger` |
| `secondary` or `outline` | `secondary` |
| `ghost` | `ghost` |
| `link` | Link for navigation; a ghost Button for an action |
| `fj-default` | `strong` for First Jobby's neutral accent |
| `fj-neutral-01` | `secondary` |
| `fj-theme-04` | `primary`, with the app's brand palette set to the chosen accent; there is no fixed yellow Button tone |

Default minimum heights are 40px (`sm`), 48px (`md`) and 56px (`lg`). First Jobby's `fj-lg` is 40px, so `sm`
preserves that height; `fj-default` is 48px, so use `md`. Choose new sizes for the other old size names rather than
assuming they have the same dimensions. Replace `size="icon"` with IconButton and its required `aria-label`.
Use `loading={pending}` with a stable label instead of swapping the label for “Saving…” or adding disabled opacity.

### Composition and events

`asChild` becomes `render={<YourComponent />}`. The rendered component must pass its received props and `ref` to
the underlying element. React 19 accepts `ref` as an ordinary prop. First Jobby's IntentLink and ApplyLink need
to preserve that forwarding and their existing click behaviour.

```tsx
import NextLink from "next/link";
import { IconButton, LinkButton, Menu, MenuIcon, MenuLinkItem, MenuPopup, MenuTrigger } from "kumiko-ui";

<LinkButton tone="strong" render={<NextLink href="/jobs" />}>Browse jobs</LinkButton>;

<Menu>
  <MenuTrigger render={<IconButton aria-label="Menu" />}>
    <MenuIcon />
  </MenuTrigger>
  <MenuPopup>
    <MenuLinkItem render={<NextLink href="/dashboard" />}>Dashboard</MenuLinkItem>
  </MenuPopup>
</Menu>;
```

Use Button for actions. A Button rendered as an anchor is not the navigation API.
DialogTrigger already has `tone` and `size`; set them there when a custom rendered component is unnecessary.

| Existing API | Kumiko / Base UI API |
| --- | --- |
| `open`, `defaultOpen`, `onOpenChange` | Names stay the same. The callback receives `(open, eventDetails)` with a reason and `cancel()`. |
| Select's `value`, `defaultValue`, `onValueChange` | Names stay the same. The callback adds event details; handle `null` for a single choice. Combobox also reports selection at its root. |
| DropdownMenuItem's `onSelect` | MenuItem's `onClick`; use `closeOnClick` to choose whether activation closes it. |
| DropdownMenuCheckboxItem's `onSelect` used to toggle | MenuCheckboxItem's `onCheckedChange(nextChecked, eventDetails)`. It stays open by default; set `closeOnClick` explicitly when needed. |
| Checkbox menu `onCheckedChange` or radio group `onValueChange` | Names stay the same; their second argument is Base UI event details. Put exclusive menu choices in MenuRadioGroup. |
| `onOpenAutoFocus`, `onCloseAutoFocus` | DialogPopup and PopoverPopup's `initialFocus` and `finalFocus`. MenuPopup and SelectPopup expose `finalFocus`. |
| `onInteractOutside`, `onPointerDownOutside` used to prevent closing | Inspect the root's `onOpenChange` event details; call `cancel()` for the dismissal reason to block. |
| Waiting for a Radix close animation or keeping Content mounted | Let Kumiko manage mounting and closing styles. Use root `onOpenChangeComplete` for work after the animation finishes. |

### Forms

Keep the existing React Hook Form instance and Zod resolver while changing controls. Use a native form with
`noValidate` so RHF owns validation and focus. This replaces First Jobby's FormItem/FormControl/FormMessage
structure; `form` is the existing `useForm` result and `onSubmit` is its existing submission handler:

```tsx
import { Field, FieldError, FieldLabel, Input } from "kumiko-ui";

<form noValidate onSubmit={form.handleSubmit(onSubmit)}>
  <Field name="email" invalid={Boolean(form.formState.errors.email)}>
    <FieldLabel>Email</FieldLabel>
    <Input {...form.register("email")} type="email" autoComplete="email" aria-required />
    {form.formState.errors.email && (
      <FieldError match>{form.formState.errors.email.message}</FieldError>
    )}
  </Field>
</form>;
```

Render FieldError conditionally: `match` shows it whenever it is mounted. Use Controller for Select and other
stateful controls. Connect `field.onChange` to `onValueChange` or `onCheckedChange`. Put `field.ref` and
`field.onBlur` on the focusable part: SelectTrigger, ComboboxInput, or NumberField's `inputProps`.
Keep submitted `name`s and defaults. NumberField values are numbers or null; checkbox and switch values are
booleans when using Kumiko Form's `onFormSubmit`. Native FormData still serializes values as form data.

To later remove RHF, use Kumiko Form with Zod as shown in the [form recipes](forms.md). Its `errors` and
`onFormSubmit` replace RHF's state and submit handler. Follow the recipe's synchronous clearing of old external
errors in `onSubmitCapture`, so those errors do not block the next submit.

## Theme variables

Treat this table as a choice of roles. It is not an automatic conversion of every old value.
Kumiko draws hover fills and press edges from its tokens; it does not need the old hover colours or shadows.

| shadcn variable | Kumiko role | Use |
| --- | --- | --- |
| `--background` | `--kumiko-canvas` | Page background |
| `--foreground` | `--kumiko-ink` | Body text |
| `--card`, `--popover` | `--kumiko-surface` | Cards and popup surfaces share a role |
| `--card-foreground`, `--popover-foreground` | `--kumiko-ink` | Text on surfaces |
| `--primary` | `--kumiko-brand` or `--kumiko-strong` | Brand accent, or a neutral accent such as First Jobby's near-black |
| `--primary-foreground` | `--kumiko-brand-fg` or `--kumiko-strong-fg` | Text on the corresponding accent |
| `--secondary` | `--kumiko-surface` or `--kumiko-field` | Choose the surface role for the context |
| `--secondary-foreground` | `--kumiko-ink` | Text on a neutral surface |
| `--muted` | `--kumiko-field` or `--kumiko-surface` | Muted area fill; there is no single muted-fill role |
| `--muted-foreground` | `--kumiko-ink-muted` | Secondary text |
| `--accent`, `--accent-foreground` | `--kumiko-brand-tint`, `--kumiko-brand-text` | Tinted brand feedback and readable text; hover is still handled by the recipes |
| `--destructive`, `--destructive-foreground` | `--kumiko-danger`, `--kumiko-danger-fg` | Destructive fill and its text; also choose danger-tint and danger-text |
| `--border` | `--kumiko-line`; `--kumiko-control-line` for controls | Dividers and stronger control boundaries are separate |
| `--input` | `--kumiko-control-line` | shadcn's input variable is a border; `--kumiko-field` is the input fill |
| `--ring` | `--kumiko-focus` | Keyboard focus colour; validate contrast before copying the value |
| `--radius`, derived `--radius-*` | `--kumiko-radius-control`, `--kumiko-radius-card`, `--kumiko-radius-overlay` | Choose each radius independently; pills use `--kumiko-radius-pill` |
| App `--font-sans`, `--font-mono` | `--kumiko-font-body`, `--kumiko-font-display`, `--kumiko-font-code` | Separate text, headings and code; preserve Arabic and Urdu fallback fonts |
| `--sidebar-*` | Canvas, surface, ink, brand, line and focus roles above | Kumiko Sidebar shares the theme; it has no shadcn sidebar variable set |
| `--chart-*` | Keep with the app's chart consumers | Kumiko has no chart-specific role mapping |

First Jobby also defines `--neutral-01` through `--neutral-06` and `--theme-01` through `--theme-04` in
`app/globals.css`. Choose their semantic roles instead of copying `bg-neutral-01` and `bg-theme-04` onto controls.
For a brand family, set its fill, foreground, tint and readable text together. Validate both themes with
`checkTheme` from `kumiko-ui/tokens`; an old shadcn ring or border may not meet Kumiko's contrast checks.

The variable sets can live side by side because every Kumiko variable starts with `--kumiko-`; no name collides.
Its classes, such as `bg-canvas` and `text-ink`, do not remap shadcn's `bg-background` and `text-foreground`.
Import `kumiko-ui/styles.css` after Tailwind and put app overrides after the imports. Keep shadcn's `@theme inline`
aliases while any old component still uses them.

Kumiko never ships a `dark:` mapping. Its variables switch under `.dark` or `[data-theme="dark"]`.
First Jobby currently defines `@custom-variant dark (&:is(.dark *))`; keep it for unmigrated classes. If the app
also adopts `data-theme`, make that app variant use the same switch:

```css
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));
```

Set the theme on `<html>` so body portals inherit it. Kumiko does not choose a dark theme automatically.

## Moving from Sonner

Change toast imports and the root Toaster together. Keep calls in client event handlers.

```tsx
import { KumikoProvider, Toaster } from "kumiko-ui";

<KumikoProvider direction="ltr" locale="en">
  {children}
  <Toaster />
</KumikoProvider>;
```

Kumiko places notifications at the bottom inline end on wider screens and centres them on phones.
The inline end mirrors in right-to-left layouts. Toaster accepts `limit` and `className`; it has no `position`,
`theme`, `richColors` or `toastOptions` prop. Remove First Jobby's `richColors position="top-center"` in
`app/layout.tsx` and the `--normal-*` styles from `components/ui/sonner.tsx` when replacing that Toaster.

| Sonner call or option | Kumiko call or option |
| --- | --- |
| `toast("Log in to save jobs", options)` | Same call; `description` and `{ action: { label, onClick } }` are supported |
| `toast.success`, `toast.error`, `toast.info` | Same method names; each accepts a string title |
| `toast.loading` followed by success or error | `toast.promise` follows the operation with one loading, success or error toast |
| `toast.promise(request, messages)` | Pass a Promise and `loading`, `success`, `error`; success and error can be functions. The result or rejection is preserved. |
| Updating a toast with its id | `toast.update(id, { title, ...options })`, or another call with `{ id }` |
| `toast.dismiss(id)` or `toast.dismiss()` | Same calls |
| `duration` | `timeout` in milliseconds; `0` keeps the toast until dismissed |

```tsx
import { toast } from "kumiko-ui";

async function notifySave(request: Promise<void>) {
  await toast.promise(request, {
    loading: "Saving…",
    success: "Saved",
    error: "Could not save. Try again.",
  });
}
```

Handle the rejection at the caller. Do not treat an API response containing `{ error }` as a successful promise:
First Jobby's `app/(auth)/login/components/login-form.tsx` handles resolved authentication errors, including 429.
Preserve that logic, or convert those results to rejected promises before using `toast.promise`.
Kumiko has no standalone `toast.loading` method. Keep the existing Sonner flow until that operation is migrated.

## Moving from React Email

Replace markup imports with `kumiko-ui/email`. These are static email components, separate from the web controls;
they need no KumikoProvider or Tailwind stylesheet. `renderEmail(element)` returns HTML with a doctype
synchronously, replacing React Email's render call. Keep the app's mail transport and link generation.

| React Email / custom markup | Kumiko email part |
| --- | --- |
| Html, Head, Body, Container, Preview, Tailwind | Email, with required `title` and `preview`, plus `dir`, `lang` and optional `theme` |
| Heading, Text | EmailHeading, EmailText |
| Button, Link | EmailButton, EmailLink; both use `href` |
| Img used for the logo | EmailLogo, with required `src`, numeric `width` and `height`, and `alt` |
| Section, a custom card, a divider, a one-time code | EmailSection, EmailCard, EmailDivider, EmailCode |

The complete templates are SignInEmail, VerifyEmail, JobAlertDigestEmail, ReceiptEmail and PlainEmail, all from
`kumiko-ui/email` and documented under Storybook's Email/Templates group. Use SignInEmail for First Jobby's
`emails/magic-link.tsx`, keeping its ten-minute expiry:

```tsx
import { renderEmail, SignInEmail } from "kumiko-ui/email";

function magicLinkHtml(url: string) {
  return renderEmail(
    <SignInEmail productName="First Jobby" url={url} expiresInMinutes={10} />,
  );
}
```

VerifyEmail requires `code` and accepts an optional `url` for address verification. First Jobby's
`emails/confirm-alert.tsx` uses a link to confirm an alert subscription, with personal copy and a footer;
compose Email building blocks for that flow. JobAlertDigestEmail shows up to ten jobs and links to the remaining
matches. First Jobby's
`emails/job-alert.tsx` also carries experience, featured jobs, sponsor content, a separate new-job count and an
unsubscribe footer. Preserve those with building blocks wherever the complete template does not cover them.
ReceiptEmail takes caller-formatted amount and date strings; PlainEmail is for a personal note.

Email themes use literal colour strings, not the web's CSS variables or provider context. Pass the same `theme`
to Email and each coloured building block. Complete branded templates pass it through to their parts.
Set `dir`, `lang` and translated copy explicitly; the web provider's labels do not translate email templates.

## A migration that stays shippable

1. Record working login, alert creation, employer forms, filters, navigation and email flows. Check React 19 and
   Tailwind CSS 4.3 or later, then install `kumiko-ui` alongside the existing packages.
2. Add the CSS import, fonts and one KumikoProvider using the [setup guide](setup.md). Keep the existing UI and
   Sonner Toaster while their consumers remain. Use the same document theme and direction for both libraries.
   Add the isolated app root and `body { position: relative }` portal setup.
3. Move leaf controls first, per screen: Button, LinkButton and Input. Remove old appearance overrides from each
   migrated control. Keep handlers, link behaviour and submitted names. Verify enabled, disabled, loading and
   keyboard states before moving the next screen.
4. Move forms next. Keep RHF and Zod initially; replace the field wrappers, connect errors and focus refs, and
   test empty submission, correction and successful submission. Give placeholder-only inputs visible labels.
5. Move overlays and choices: Dialog, Menu, Popover, Select and the location Combobox. Check Escape, focus return,
   multi-select menus staying open, nested popups, phone widths, long text and right-to-left arrow keys.
6. Move notification calls and Toaster together, then email rendering. Verify promise failures, announcement
   count, sign-in expiry, destination links, unsubscribe links and the app-specific digest content.
7. Search remaining `@/components/ui/`, Radix, cmdk, Sonner and React Email imports. Remove files and dependencies
   only when they have no consumers. Remove shadcn's theme variables, aliases and animation plugin only after
   their last app use is gone. Keep app-owned chart, typography and brand variables that still have consumers.

## Gotchas in First Jobby

| Source path | Migration detail |
| --- | --- |
| `components/ui/dialog.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/popover.tsx`, `components/ui/select.tsx` | Animation classes depend on Radix's `data-state` and `--radix-*` variables. Remove those class strings. Base UI uses attributes such as `data-open`, `data-disabled`, `data-checked` and `data-highlighted`; Kumiko handles its `--transform-origin` and available-space variables. Use the documented public `data-slot` names for app selectors. |
| `app/(public)/sections/components/filters.tsx` | Option handles Radix `onSelect` and calls `preventDefault()` when `keepOpen` is true. Use MenuCheckboxItem's `onCheckedChange` and `closeOnClick={!keepOpen}`. Use MenuRadioGroup for exclusive sort choices. |
| `components/location-picker.tsx` | cmdk's custom filter returns numeric scores and uses country codes and aliases as keywords. Port matching to a boolean Combobox filter, keeping “USA”, “UK”, “UAE” and distinct region and country values. Boolean filtering does not rank scores; sort the supplied items separately if that order matters. The existing popup also works inside a dialog; verify that nesting after the move. |
| `app/(auth)/login/components/login-form.tsx`, `app/(public)/sections/components/job-alerts-form.tsx`, `components/employer-forms.tsx` | Classes override colours, radii, heights and focus, including `rounded-full`, `bg-neutral-01`, `!h-12`, `border-none` and `outline-none`. Remove these appearance overrides from Kumiko controls; retain layout classes and move brand choices into theme roles. Login's email input also relies on a placeholder: add FieldLabel. |
| `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/select.tsx` | Old recipes include `dark:` classes, disabled opacity and removed pointer events; Button also transitions `all`. Let Kumiko supply those states. Keep app `dark:` classes for remaining content, such as `dark:prose-invert` in `app/(public)/companies/[companySlug]/[jobSlug]/page.tsx`, until that content is migrated. |
| `app/(public)/components/navbar.tsx`, `app/(public)/companies/[companySlug]/[jobSlug]/components/apply-button.tsx` | Buttons wrap IntentLink or ApplyLink through `asChild`. Replace them with LinkButton's `render`, preserving routing, refs and analytics. Navbar's menu destinations become MenuLinkItem. |
| `components/job-card-actions.tsx`, `components/job-view.tsx`, `app/(public)/components/navbar.tsx` | The reviewed icon-only controls already have `aria-label`; preserve those names when using IconButton. Native `title` hints in the first two files supplement the name. There is no Tooltip wrapper or import in the reviewed app; do not introduce a tooltip as the only label or disabled explanation, because it does not open on touch. |
| `app/(public)/sections/components/job-alerts-form.tsx` | Its portalled inner form stops React submit propagation to an outer form. Portals still bubble React events after migration. Preserve that handling or restructure the forms. Put long content in DialogBody, keep Title and Footer outside it, and put Cancel before the submit action. |
