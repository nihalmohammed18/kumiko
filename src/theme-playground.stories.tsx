"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, type ReactNode, useEffect, useId, useState, useSyncExternalStore } from "react";
import { expect, fireEvent, spyOn, waitFor, within } from "storybook/test";
import { Badge } from "./components/badge.tsx";
import { Button } from "./components/button.tsx";
import { Card, CardDescription, CardTitle } from "./components/card.tsx";
import { Checkbox } from "./components/checkbox.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./components/field.tsx";
import { Input } from "./components/input.tsx";
import { Progress } from "./components/progress.tsx";
import { Slider, SliderValue } from "./components/slider.tsx";
import { Switch } from "./components/switch.tsx";
import { Tab, Tabs, TabsList, TabsPanel } from "./components/tabs.tsx";
import { useScrollFocus } from "./lib/use-scroll-focus.ts";
import { checkTheme, type Theme, themeCss } from "./theme.ts";
import { colors, radii } from "./tokens.ts";

/** The generated CSS in a scroll area that keyboard users can reach while it overflows. */
function CssOutput({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  const [ref, tabIndex] = useScrollFocus<HTMLDivElement>();
  return (
    <div
      ref={ref}
      tabIndex={tabIndex}
      role="region"
      aria-labelledby={labelledBy}
      className="max-h-80 min-w-0 overflow-y-auto rounded-control border-2 border-line bg-field p-4 focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-focus focus-visible:-outline-offset-2"
    >
      {children}
    </div>
  );
}

type Mode = "light" | "dark";
const modes = ["light", "dark"] as const;
const roles = ["brand", "brand-fg", "brand-tint", "brand-text", "focus"] as const;
const modeNames = { light: "Light", dark: "Dark" };
const hexPattern = /^#[\da-f]{6}$/i;
const defaults: Theme = { light: colors.light, dark: colors.dark, radii: { control: radii.control } };

// Copied from design/round2/variants.json; its muted and sky roles are ink-muted and tide in Kumiko.
const presets = {
  "First Jobby": {
    light: {
      canvas: "#F8F4F1",
      surface: "#FFFFFF",
      field: "#F4EEEA",
      line: "#E0D3CD",
      "control-line": "#816F5F",
      ink: "#120A0B",
      "ink-muted": "#66534F",
      brand: "#FFD86F",
      "brand-fg": "#120A0B",
      "brand-text": "#755100",
      "brand-tint": "#FFE298",
      strong: "#120A0B",
      "strong-fg": "#FFFFFF",
      sun: "#FFD86F",
      "sun-tint": "#FFE298",
      "sun-text": "#6C4200",
      leaf: "#C9FF85",
      "leaf-tint": "#D7F5AD",
      "leaf-text": "#345111",
      coral: "#9886FE",
      "coral-tint": "#D5C6FE",
      "coral-text": "#403078",
      tide: "#7CE1FF",
      "tide-tint": "#B8EBFA",
      "tide-text": "#075879",
      focus: "#61509C",
      scrim: "rgba(18, 10, 11, .5)",
    },
    dark: {
      canvas: "#1C1618",
      surface: "#2B2226",
      field: "#352B2F",
      line: "#63535B",
      "control-line": "#AD969F",
      ink: "#FFF4EF",
      "ink-muted": "#DAC5C0",
      brand: "#EEC975",
      "brand-fg": "#211508",
      "brand-text": "#FFE2A0",
      "brand-tint": "#55431E",
      strong: "#FFF4EF",
      "strong-fg": "#120A0B",
      sun: "#EEC975",
      "sun-tint": "#55431E",
      "sun-text": "#FFE2A0",
      leaf: "#B4DB86",
      "leaf-tint": "#39472C",
      "leaf-text": "#D5EFB2",
      coral: "#AB98EC",
      "coral-tint": "#44345F",
      "coral-text": "#E1D5FF",
      tide: "#85CCE2",
      "tide-tint": "#243F4B",
      "tide-text": "#BFEFFF",
      focus: "#C2B1FF",
      scrim: "rgba(12, 6, 8, .5)",
    },
  },
  Wifaqa: {
    light: {
      canvas: "#FBF6EE",
      surface: "#FFFDF9",
      field: "#F5ECDD",
      line: "#DDCAB0",
      "control-line": "#856747",
      ink: "#2B2621",
      "ink-muted": "#5F4E3B",
      brand: "#35513C",
      "brand-fg": "#FFFFFF",
      "brand-text": "#35513C",
      "brand-tint": "#D1E4C7",
      strong: "#2B2621",
      "strong-fg": "#FFFFFF",
      sun: "#E2954F",
      "sun-tint": "#EDD0A1",
      "sun-text": "#934615",
      leaf: "#85AF6D",
      "leaf-tint": "#D1E4C7",
      "leaf-text": "#35513C",
      coral: "#E2954F",
      "coral-tint": "#EDD0A1",
      "coral-text": "#934615",
      tide: "#85AF6D",
      "tide-tint": "#D1E4C7",
      "tide-text": "#35513C",
      focus: "#35513C",
      scrim: "rgba(43, 38, 33, .5)",
    },
    dark: {
      canvas: "#141F19",
      surface: "#203028",
      field: "#293C30",
      line: "#58715E",
      "control-line": "#91AB96",
      ink: "#FAF3E7",
      "ink-muted": "#D1C5AE",
      brand: "#A8CEA6",
      "brand-fg": "#142C1D",
      "brand-text": "#C0E0B7",
      "brand-tint": "#334A35",
      strong: "#FAF3E7",
      "strong-fg": "#2B2621",
      sun: "#DDA165",
      "sun-tint": "#554027",
      "sun-text": "#FFD4A4",
      leaf: "#A8CEA6",
      "leaf-tint": "#334A35",
      "leaf-text": "#C0E0B7",
      coral: "#DDA165",
      "coral-tint": "#554027",
      "coral-text": "#FFD4A4",
      tide: "#A8CEA6",
      "tide-tint": "#334A35",
      "tide-text": "#C0E0B7",
      focus: "#BDDFB2",
      scrim: "rgba(6, 16, 10, .5)",
    },
  },
  Kumiko: defaults,
} satisfies Record<string, Theme>;

function subscribeForcedColors(onChange: () => void) {
  const query = window.matchMedia("(forced-colors: active)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getForcedColors() {
  return window.matchMedia("(forced-colors: active)").matches;
}

function previewStyle(theme: Theme, mode: Mode): CSSProperties {
  return {
    ...Object.fromEntries([
      ...Object.entries({ ...colors[mode], ...theme[mode] }).map(([key, value]) => [`--kumiko-${key}`, value]),
      ...Object.entries(theme.radii ?? {}).map(([key, value]) => [`--kumiko-radius-${key}`, value]),
    ]),
    colorScheme: mode,
  };
}

function ColorControl({
  mode,
  role,
  value,
  onValueChange,
}: {
  mode: Mode;
  role: (typeof roles)[number];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const invalid = !hexPattern.test(draft);
  function change(next: string) {
    setDraft(next);
    if (hexPattern.test(next)) onValueChange(next.toUpperCase());
  }
  return (
    <fieldset className="min-w-0">
      <legend id={`${id}-legend`} className="mb-2 wrap-anywhere font-code text-body-sm font-bold text-ink">
        {modeNames[mode]} {role}
      </legend>
      <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-3">
        <div className="grid gap-1.5">
          <label id={`${id}-colour-label`} htmlFor={`${id}-colour`} className="text-label font-bold cursor-pointer">
            colour
          </label>
          <input
            id={`${id}-colour`}
            type="color"
            aria-labelledby={`${id}-legend ${id}-colour-label`}
            value={value}
            onChange={(event) => change(event.currentTarget.value)}
            className="press press-secondary h-control w-full min-w-0 p-2 focus-visible:outline-focus! focus-visible:[outline-offset:calc(var(--kumiko-ring-gap)+var(--kumiko-edge-h))] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-choice [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-control-line"
          />
        </div>
        <Field invalid={invalid || undefined}>
          <FieldLabel id={`${id}-hex-label`}>hex</FieldLabel>
          <Input
            aria-labelledby={`${id}-legend ${id}-hex-label`}
            dir="ltr"
            value={draft}
            onValueChange={change}
            spellCheck={false}
            autoComplete="off"
            className="font-code"
          />
          {invalid && <FieldError match>Use a six-digit hex colour: #RRGGBB.</FieldError>}
        </Field>
      </div>
    </fieldset>
  );
}

function ThemePreview({ theme, mode, forcedColors }: { theme: Theme; mode: Mode; forcedColors: boolean }) {
  const id = useId();
  // Axe reads authored colours in forced colours: use the light palette in both panels, without nested themes.
  const paletteMode = forcedColors ? "light" : mode;
  return (
    <section
      aria-labelledby={id}
      data-theme={forcedColors ? undefined : mode}
      style={previewStyle(theme, paletteMode)}
      className="@container grid min-w-0 content-start gap-6 rounded-card border-2 border-line bg-canvas p-6 text-ink"
    >
      <h3 id={id} className="font-display text-title-sm font-bold">
        {modeNames[mode]} preview
      </h3>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <p className="text-label font-bold">Rest</p>
          <div className="flex flex-wrap gap-3">
            <Button tone="primary">Primary</Button>
            <Button tone="secondary">Secondary</Button>
            <Button tone="ghost">Ghost</Button>
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-label font-bold">Disabled</p>
          <div className="flex flex-wrap gap-3">
            <Button tone="primary" disabled>
              Primary disabled
            </Button>
            <Button tone="secondary" disabled>
              Secondary disabled
            </Button>
            <Button tone="ghost" disabled>
              Ghost disabled
            </Button>
          </div>
        </div>
      </div>
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" defaultValue="owner@" autoComplete="off" />
        <FieldDescription>Where we will send your updates.</FieldDescription>
        <FieldError match>Enter a valid email address.</FieldError>
      </Field>
      <div className="grid gap-3">
        <Checkbox defaultChecked>Keep me updated</Checkbox>
        <Switch defaultChecked>Notifications</Switch>
      </div>
      <div>
        <Badge tone="brand">New</Badge>
      </div>
      <Progress value={65} label="Profile completion" />
      <Tabs defaultValue="overview">
        <TabsList aria-label={`${modeNames[mode]} preview views`}>
          <Tab value="overview">Overview</Tab>
          <Tab value="details">Details</Tab>
        </TabsList>
        <TabsPanel value="overview">Small details, familiar controls.</TabsPanel>
        <TabsPanel value="details">Your colours follow every component.</TabsPanel>
      </Tabs>
      <Card>
        <CardTitle level={4}>Your next project</CardTitle>
        <CardDescription>Bring your brand to the tools your team uses every day.</CardDescription>
        <div>
          <Badge tone="brand">Ready to try</Badge>
        </div>
      </Card>
    </section>
  );
}

function ThemePlayground({ initialTheme = defaults }: { initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => ({ ...initialTheme, radii: { control: radii.control } }));
  const [editorVersion, setEditorVersion] = useState(0);
  const [copyResult, setCopyResult] = useState({ message: "" });
  const forcedColors = useSyncExternalStore(subscribeForcedColors, getForcedColors, () => false);
  const problemsId = useId();
  const cssId = useId();
  const problems = checkTheme(theme);
  const css = themeCss(theme).trimEnd();

  useEffect(() => {
    if (copyResult.message !== "Copied") return;
    const timer = window.setTimeout(() => setCopyResult({ message: "" }), 2000);
    return () => window.clearTimeout(timer);
  }, [copyResult]);

  function load(preset: Theme) {
    setTheme({ ...preset, radii: { control: radii.control } });
    setEditorVersion((version) => version + 1);
    setCopyResult({ message: "" });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopyResult({ message: "Copied" });
    } catch {
      setCopyResult({ message: "Copy failed" });
    }
  }

  return (
    <main className="@container grid w-full min-w-0 max-w-6xl gap-8 font-body text-body text-ink">
      <header className="grid gap-2">
        <h1 className="font-display text-headline font-bold">Theme playground</h1>
        <p className="max-w-3xl wrap-anywhere text-ink-muted">
          Pick your brand colours, try Kumiko in light and dark, and copy the CSS for your app.
        </p>
      </header>
      <section className="grid min-w-0 gap-4" aria-label="Theme controls">
        <h2 className="font-display text-title font-bold">Controls</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(presets).map(([name, preset]) => (
            <Button key={name} onClick={() => load(preset)}>
              {name}
            </Button>
          ))}
          <Button tone="ghost" onClick={() => load(defaults)}>
            Reset
          </Button>
        </div>
        <Field className="max-w-sm">
          <Slider<number>
            label="Control radius"
            min={0}
            max={20}
            step={1}
            value={Number.parseFloat(theme.radii?.control ?? radii.control)}
            onValueChange={(value) => setTheme((current) => ({ ...current, radii: { control: `${value}px` } }))}
          >
            <SliderValue>{(formattedValues) => `${formattedValues[0]}px`}</SliderValue>
          </Slider>
          <FieldDescription>From square corners to rounded controls, 0 to 20px.</FieldDescription>
        </Field>
        <p className="wrap-anywhere text-body-sm text-ink-muted">
          Use six-digit hex colours (#RRGGBB). Previews keep the last complete colour while you type.
        </p>
        <Tabs key={editorVersion} defaultValue="light">
          <TabsList aria-label="Palette to edit">
            <Tab value="light">Light</Tab>
            <Tab value="dark">Dark</Tab>
          </TabsList>
          {modes.map((mode) => (
            <TabsPanel key={mode} value={mode} keepMounted>
              <div className="grid gap-6 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {roles.map((role) => (
                  <ColorControl
                    key={role}
                    mode={mode}
                    role={role}
                    value={theme[mode]?.[role] ?? colors[mode][role]}
                    onValueChange={(value) =>
                      setTheme((current) => ({ ...current, [mode]: { ...current[mode], [role]: value } }))
                    }
                  />
                ))}
              </div>
            </TabsPanel>
          ))}
        </Tabs>
      </section>
      <section className="grid min-w-0 gap-4" aria-label="Component preview">
        <h2 className="font-display text-title font-bold">Preview</h2>
        <p className="wrap-anywhere text-body-sm text-ink-muted">
          Each panel applies your theme to its own controls. High contrast uses system colours in both previews.
        </p>
        <div className="grid min-w-0 items-start gap-6 @3xl:grid-cols-2">
          {modes.map((mode) => (
            <ThemePreview key={`${mode}-${editorVersion}`} theme={theme} mode={mode} forcedColors={forcedColors} />
          ))}
        </div>
      </section>
      <section className="grid min-w-0 gap-3">
        <h2 id={problemsId} className="font-display text-title font-bold">
          Theme problems
        </h2>
        <p className="wrap-anywhere text-body-sm text-ink-muted">
          checkTheme checks text contrast, focus rings, control borders and neutral press edges in both modes.
        </p>
        <div role="status" aria-live="polite" aria-atomic="true" aria-labelledby={problemsId}>
          {problems.length ? (
            <ul className="grid list-disc gap-2 ps-6 text-body-sm text-danger-text">
              {problems.map((problem) => (
                <li key={problem} className="wrap-anywhere">
                  {problem}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-semibold text-success-text">No problems found.</p>
          )}
        </div>
      </section>
      <section className="grid min-w-0 gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 id={cssId} className="font-display text-title font-bold">
            Theme CSS
          </h2>
          <Button onClick={copy}>Copy</Button>
          <span
            role="status"
            aria-live="polite"
            aria-label="Copy result"
            className="min-h-6 min-w-24 text-body-sm font-semibold"
          >
            {copyResult.message}
          </span>
        </div>
        <p className="wrap-anywhere text-body-sm text-ink-muted">Paste this after importing kumiko-ui/styles.css.</p>
        <CssOutput labelledBy={cssId}>
          <pre dir="ltr" className="min-w-0 font-code text-body-sm whitespace-break-spaces wrap-anywhere">
            {css}
          </pre>
        </CssOutput>
      </section>
    </main>
  );
}

const meta = { title: "Theming/Playground", component: ThemePlayground } satisfies Meta<typeof ThemePlayground>;

/** Storybook's interactive theme documentation.
 * Use when: exploring app colours. Avoid when: importing a library component.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** Kumiko's defaults with editable palettes, previews, validation and copyable CSS.
 * Use when: trying a theme before adopting it. Avoid when: auditing a deployed app.
 */
export const Playground: Story = {
  play: async ({ canvas, globals, userEvent, step }) => {
    const hex = (mode: Mode, role: (typeof roles)[number]) =>
      canvas.getByRole("textbox", { name: `${modeNames[mode]} ${role} hex` });
    const problems = canvas.getByRole("status", { name: "Theme problems" });
    const css = canvas.getByRole("region", { name: "Theme CSS" });
    const reset = canvas.getByRole("button", { name: "Reset" });
    const lightPreview = canvas.getByRole("region", { name: "Light preview" });

    await step("Report low contrast and reset to a valid theme", async () => {
      await waitFor(() => {
        expect(problems).toHaveTextContent("No problems found.");
        expect(hex("light", "brand-fg")).toHaveValue("#FFFFFF");
      });
      await userEvent.clear(hex("light", "brand"));
      await userEvent.type(hex("light", "brand"), "#FFE14D");
      await waitFor(() => {
        expect(problems).toHaveTextContent("light: brand-fg on brand");
        expect(css).toHaveTextContent("--kumiko-brand: #FFE14D;");
        expect(lightPreview.style.getPropertyValue("--kumiko-brand")).toBe("#FFE14D");
      });
      await userEvent.click(reset);
      await waitFor(() => {
        expect(problems).toHaveTextContent("No problems found.");
        expect(hex("light", "brand")).toHaveValue(colors.light.brand);
      });
    });

    await step("Keep picker and hex in sync, including an incomplete draft", async () => {
      // Native colour dialogs cannot be driven by userEvent; dispatch the value a colour choice emits.
      await fireEvent.change(canvas.getByLabelText("Light brand colour"), { target: { value: "#35513c" } });
      await waitFor(() => expect(hex("light", "brand")).toHaveValue("#35513C"));
      await userEvent.clear(hex("light", "brand"));
      await userEvent.type(hex("light", "brand"), "#oops");
      await waitFor(() => {
        expect(hex("light", "brand")).toHaveAttribute("aria-invalid", "true");
        expect(canvas.getByLabelText("Light brand colour")).toHaveValue("#35513c");
        expect(css).toHaveTextContent("--kumiko-brand: #35513C;");
      });
      await userEvent.click(reset);
      await waitFor(() => {
        expect(hex("light", "brand")).toHaveValue(colors.light.brand);
        expect(hex("light", "brand")).not.toHaveAttribute("aria-invalid", "true");
      });
    });

    await step("Adjust the radius and edit the dark palette by keyboard", async () => {
      await userEvent.tab();
      const radius = canvas.getByRole("slider", { name: "Control radius" });
      await waitFor(() => expect(radius).toHaveFocus());
      await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
      await waitFor(() => expect(radius).toHaveValue("15"));
      await userEvent.keyboard("{Home}");
      await waitFor(() => expect(css).toHaveTextContent("--kumiko-radius-control: 0px;"));
      await userEvent.keyboard("{End}");
      await waitFor(() => expect(css).toHaveTextContent("--kumiko-radius-control: 20px;"));
      await userEvent.click(canvas.getByRole("tab", { name: "Light" }));
      await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
      const dark = canvas.getByRole("tab", { name: "Dark" });
      await waitFor(() => {
        expect(dark).toHaveFocus();
        expect(dark).toHaveAttribute("aria-selected", "false");
      });
      await userEvent.keyboard("{Enter}");
      await waitFor(() => expect(canvas.getByRole("tabpanel", { name: "Dark" })).toBeVisible());
      await userEvent.clear(hex("dark", "focus"));
      await userEvent.type(hex("dark", "focus"), "#BDDFB2");
      await waitFor(() => expect(css).toHaveTextContent("--kumiko-focus: #BDDFB2;"));
      await userEvent.click(reset);
    });

    await step("Load a preset and try the preview's controls", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "First Jobby" }));
      await waitFor(() => {
        expect(hex("light", "brand")).toHaveValue("#FFD86F");
        expect(css).toHaveTextContent("--kumiko-brand: #EEC975;");
        expect(problems).toHaveTextContent("No problems found.");
      });
      const preview = within(canvas.getByRole("region", { name: "Light preview" }));
      const disabled = preview.getByRole("button", { name: "Primary disabled" });
      await userEvent.click(disabled);
      await waitFor(() => {
        expect(disabled).toBeDisabled();
        expect(disabled).not.toHaveFocus();
        expect(preview.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
      });
      const checkbox = preview.getByRole("checkbox", { name: "Keep me updated" });
      await userEvent.click(checkbox);
      await waitFor(() => expect(checkbox).not.toBeChecked());
      await userEvent.click(reset);
    });

    await step("Copy the exact CSS, expire the success message and report a failure", async () => {
      const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
      const result = canvas.getByRole("status", { name: "Copy result" });
      try {
        await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
        await waitFor(() => {
          expect(writeText).toHaveBeenCalledWith(css.textContent);
          expect(result).toHaveTextContent("Copied");
        });
        await waitFor(() => expect(result).toBeEmptyDOMElement(), { timeout: 3000 });
        writeText.mockRejectedValueOnce(new Error("Clipboard permission denied"));
        await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
        await waitFor(() => expect(result).toHaveTextContent("Copy failed"));
      } finally {
        writeText.mockRestore();
      }
      await userEvent.click(reset);
      await waitFor(() => {
        expect(result).toBeEmptyDOMElement();
        expect(problems).toHaveTextContent("No problems found.");
        expect(hex("light", "brand")).toHaveValue(colors.light.brand);
      });
    });
  },
};

/** The First Jobby palette loaded for a visual comparison in both modes.
 * Use when: reviewing the preset's appearance. Avoid when: checking Kumiko's default colours.
 */
export const FirstJobbyPreset: Story = { name: "First Jobby preset", args: { initialTheme: presets["First Jobby"] } };
