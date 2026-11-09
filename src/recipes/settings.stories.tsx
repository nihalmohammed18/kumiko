"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Alert } from "../components/alert.tsx";
import { Button } from "../components/button.tsx";
import { Card } from "../components/card.tsx";
import { Field, FieldDescription, FieldLabel } from "../components/field.tsx";
import { Fieldset, FieldsetLegend } from "../components/fieldset.tsx";
import { NativeSelect } from "../components/native-select.tsx";
import { Radio } from "../components/radio.tsx";
import { RadioGroup } from "../components/radio-group.tsx";
import { Switch } from "../components/switch.tsx";
import { Toaster, toast } from "../components/toast.tsx";

const defaults = {
  email: true,
  summary: true,
  reminders: false,
  visibility: "employers",
  country: "in",
  language: "en",
};
type SettingsValues = typeof defaults;
const notifications = [
  { key: "email", label: "Email job alerts", description: "Hear about new roles that fit your goals." },
  { key: "summary", label: "Weekly summary", description: "Get a little progress recap each week." },
  { key: "reminders", label: "Reminders", description: "Give upcoming interviews a friendly nudge." },
] as const;

function Settings({
  initialState = "unchanged",
  onSave,
}: {
  initialState?: "unchanged" | "changed" | "loading" | "failed";
  onSave: (values: SettingsValues) => Promise<void>;
}) {
  const id = useId();
  const saveButton = useRef<HTMLButtonElement>(null);
  const [values, setValues] = useState({ ...defaults, reminders: initialState !== "unchanged" });
  const [saved, setSaved] = useState(defaults);
  const [saving, setSaving] = useState(initialState === "loading");
  const [failed, setFailed] = useState(initialState === "failed");
  const changed = JSON.stringify(values) !== JSON.stringify(saved);

  async function save() {
    if (!changed || saving) return;
    // Retry removes its alert; move focus to the button that stays present while saving.
    saveButton.current?.focus();
    setSaving(true);
    setFailed(false);
    try {
      await onSave(values);
      setSaved(values);
      toast.success("Settings saved", { timeout: 0 });
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      aria-label="Settings"
      className="@container/settings grid min-w-0 w-full max-w-3xl gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <Card>
        <Fieldset disabled={saving} aria-describedby={`${id}-notifications-description`}>
          <FieldsetLegend>Notifications</FieldsetLegend>
          <p id={`${id}-notifications-description`} className="text-body-sm text-ink-muted">
            Choose the updates that help you keep moving.
          </p>
          {notifications.map(({ key, label, description }) => (
            <Field key={key} name={key} disabled={saving}>
              <FieldLabel className="flex min-h-10 items-center justify-between gap-3 cursor-pointer">
                <span className="min-w-0 wrap-anywhere">{label}</span>
                <Switch
                  nativeButton
                  render={<button type="button" />}
                  checked={values[key]}
                  onCheckedChange={(checked) => setValues((current) => ({ ...current, [key]: checked }))}
                />
              </FieldLabel>
              <FieldDescription>{description}</FieldDescription>
            </Field>
          ))}
        </Fieldset>
      </Card>
      <Card>
        <Fieldset disabled={saving} aria-describedby={`${id}-visibility-description`}>
          <FieldsetLegend id={`${id}-visibility`}>Profile visibility</FieldsetLegend>
          <p id={`${id}-visibility-description`} className="text-body-sm text-ink-muted">
            Decide who can discover your profile.
          </p>
          <RadioGroup
            name="visibility"
            aria-labelledby={`${id}-visibility`}
            aria-describedby={`${id}-visibility-description`}
            disabled={saving}
            value={values.visibility}
            onValueChange={(visibility) => setValues((current) => ({ ...current, visibility }))}
          >
            <Radio value="everyone" nativeButton>
              Everyone
            </Radio>
            <Radio value="employers" nativeButton>
              Verified employers
            </Radio>
            <Radio value="private" nativeButton>
              Only me
            </Radio>
          </RadioGroup>
        </Fieldset>
      </Card>
      <Card>
        <Fieldset disabled={saving} aria-describedby={`${id}-region-description`}>
          <FieldsetLegend>Region</FieldsetLegend>
          <p id={`${id}-region-description`} className="text-body-sm text-ink-muted">
            Make your job search feel closer to home.
          </p>
          <div className="grid min-w-0 gap-4 @[32rem]/settings:grid-cols-2">
            <Field name="country" disabled={saving}>
              <FieldLabel>Country</FieldLabel>
              <NativeSelect
                value={values.country}
                autoComplete="country"
                onValueChange={(country) => setValues((current) => ({ ...current, country }))}
              >
                <option value="in">India</option>
                <option value="gb">United Kingdom</option>
                <option value="ae">United Arab Emirates</option>
              </NativeSelect>
            </Field>
            <Field name="language" disabled={saving}>
              <FieldLabel>Language</FieldLabel>
              <NativeSelect
                value={values.language}
                onValueChange={(language) => setValues((current) => ({ ...current, language }))}
              >
                <option value="en">English</option>
                <option value="ar" lang="ar">
                  العربية
                </option>
                <option value="ur" lang="ur">
                  اردو
                </option>
              </NativeSelect>
            </Field>
          </div>
        </Fieldset>
      </Card>
      {failed && (
        <Alert
          role="alert"
          status="danger"
          title="We couldn't save your settings"
          action={<Button onClick={() => void save()}>Try again</Button>}
        >
          Your changes are still here. Check your connection and try again.
        </Alert>
      )}
      <div className="grid min-w-0 justify-items-start gap-3">
        <Button
          ref={saveButton}
          type="submit"
          tone="primary"
          disabled={!changed}
          loading={saving}
          loadingLabel="Saving…"
          aria-describedby={!changed ? `${id}-save-reason` : undefined}
        >
          Save
        </Button>
        {!changed && (
          <p id={`${id}-save-reason`} className="text-body-sm text-ink-muted">
            No changes to save
          </p>
        )}
      </div>
    </form>
  );
}

const meta = {
  title: "Recipes/Settings",
  component: Settings,
  args: {
    onSave: fn(async (_values: SettingsValues) => {
      await new Promise((resolve) => setTimeout(resolve, 750));
    }),
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Settings>;

/** Metadata for the settings screen and its save outcomes.
 * Use when: browsing form composition. Avoid when: importing an application settings page.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** Saved preferences with a disabled Save and a visible reason.
 * Use when: checking dirty-state gating. Avoid when: demonstrating a pending save.
 */
export const Unchanged: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const save = canvas.getByRole("button", { name: "Save" });
    await userEvent.click(save);
    await waitFor(() => {
      expect(save).toBeDisabled();
      expect(save).toHaveAccessibleDescription("No changes to save");
      expect(args.onSave).not.toHaveBeenCalled();
    });
    const alerts = canvas.getByRole("switch", { name: "Email job alerts" });
    await userEvent.tab();
    await waitFor(() => expect(alerts).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(save).toBeEnabled());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(save).toBeDisabled());
    alerts.blur();
  },
};

/** Changed preferences ready to save.
 * Use when: reviewing unsaved edits. Avoid when: showing the unchanged baseline.
 */
export const Changed: Story = { args: { initialState: "changed" } };

/** A save in progress, with edits held steady and a named loading button.
 * Use when: reviewing the busy appearance. Avoid when: testing save completion; use Success.
 */
export const Loading: Story = { args: { initialState: "loading" } };

/** Saves pointer and keyboard edits, then dismisses the success toast and returns to rest.
 * Use when: checking successful persistence and loading width. Avoid when: demonstrating a connection failure.
 */
export const Success: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("switch", { name: "Reminders" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Verified employers" }));
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Country" }), "gb");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Language" }), "ar");
    const save = canvas.getByRole("button", { name: "Save" });
    const width = save.getBoundingClientRect().width;
    await userEvent.click(save);
    await waitFor(() => {
      expect(save).toHaveAttribute("aria-busy", "true");
      expect(save).toHaveAccessibleName("Saving…");
      expect(save).toHaveFocus();
      expect(save.getBoundingClientRect().width).toBe(width);
    });
    await userEvent.keyboard("{Enter}");
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => {
      expect(body.getByRole("dialog", { name: "Settings saved" })).toBeVisible();
      expect(save).toBeDisabled();
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onSave).toHaveBeenCalledWith({
        ...defaults,
        reminders: true,
        visibility: "private",
        country: "gb",
        language: "ar",
      });
    });
    await userEvent.keyboard("{F6}{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Settings saved" })).not.toBeInTheDocument());
    await userEvent.unhover(save);
    (canvasElement.ownerDocument.activeElement as HTMLElement | null)?.blur();
  },
};

/** A failed save retains edits through a retry and leaves the error visible.
 * Use when: checking recovery without data loss. Avoid when: showing a successful save.
 */
export const Failure: Story = {
  args: {
    initialState: "failed",
    onSave: fn(async (_values: SettingsValues) => {
      await new Promise((resolve) => setTimeout(resolve, 750));
      throw new Error("Connection interrupted");
    }),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await waitFor(() => {
      const save = canvas.getByRole("button", { name: "Saving…" });
      expect(save).toHaveAttribute("aria-busy", "true");
      expect(save).toHaveFocus();
    });
    await waitFor(() => {
      expect(canvas.getByRole("alert")).toHaveTextContent("Your changes are still here.");
      expect(canvas.getByRole("switch", { name: "Reminders" })).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onSave).toHaveBeenCalledWith({ ...defaults, reminders: true });
    });
    await userEvent.unhover(canvas.getByRole("button", { name: "Try again" }));
    (canvas.getByRole("button", { name: "Save" }).ownerDocument.activeElement as HTMLElement | null)?.blur();
  },
};

/** Unchanged, changed, loading and failed screens in independent narrow containers.
 * Use when: comparing every save state. Avoid when: mounting several settings forms in an app.
 */
export const States: Story = {
  render: (args) => (
    <div className="@container grid min-w-0 w-full max-w-6xl gap-8 @[48rem]:grid-cols-2">
      {(["unchanged", "changed", "loading", "failed"] as const).map((initialState) => (
        <section
          key={initialState}
          aria-label={`${initialState} settings`}
          className="grid min-w-0 content-start gap-4"
        >
          <h2 className="font-display text-title font-bold">{initialState}</h2>
          <Settings {...args} initialState={initialState} />
        </section>
      ))}
    </div>
  ),
};
