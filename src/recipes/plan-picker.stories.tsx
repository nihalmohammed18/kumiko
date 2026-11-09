"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Badge } from "../components/badge.tsx";
import { Button } from "../components/button.tsx";
import { ChoiceTile, ChoiceTileGroup } from "../components/choice-tile.tsx";
import { Toggle } from "../components/toggle.tsx";
import { ToggleGroup } from "../components/toggle-group.tsx";
import { useKumiko } from "../provider.tsx";

const plans = [
  {
    name: "Free",
    monthly: 0,
    summary: "Make a good start, at your pace.",
    features: ["Application tracker", "Weekly job digest"],
  },
  {
    name: "Plus",
    monthly: 12,
    summary: "A little more help for your next step.",
    features: ["Everything in Free", "Instant job alerts", "Interview reminders"],
  },
  {
    name: "Pro",
    monthly: 24,
    summary: "Give your search room to grow.",
    features: ["Everything in Plus", "Profile insights", "Priority support"],
  },
] as const;
type Plan = (typeof plans)[number]["name"];
type Period = "monthly" | "yearly";

function PlanPicker({
  initialPeriod = "monthly",
  initialPlan = "Plus",
  onContinue,
}: {
  initialPeriod?: Period;
  initialPlan?: Plan;
  onContinue: (plan: string, period: Period) => void;
}) {
  const { locale } = useKumiko();
  const [period, setPeriod] = useState(initialPeriod);
  const [selected, setSelected] = useState<string>(initialPlan);
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="@container/plan-picker grid min-w-0 w-full max-w-6xl gap-6">
      <div className="grid min-w-0 justify-items-start gap-3">
        <h2 className="min-w-0 wrap-anywhere font-display text-headline font-bold">Find your next-step plan</h2>
        <p className="min-w-0 wrap-anywhere text-body text-ink-muted">Small steps are easier with the right support.</p>
        <ToggleGroup
          aria-label="Billing period"
          className="max-w-full"
          value={[period]}
          onValueChange={(value) => setPeriod(value[0] === "yearly" ? "yearly" : "monthly")}
        >
          <Toggle value="monthly">Monthly</Toggle>
          <Toggle value="yearly" className="min-w-0 max-w-full">
            <span className="flex min-w-0 flex-wrap items-center justify-center gap-2">
              Yearly <Badge tone="leaf">{new Intl.NumberFormat(locale).format(2)} months free</Badge>
            </span>
          </Toggle>
        </ToggleGroup>
      </div>
      <ChoiceTileGroup
        aria-label="Choose your plan"
        value={selected}
        onValueChange={setSelected}
        className="grid-cols-1 items-stretch @[36rem]:grid-cols-3"
      >
        {plans.map((plan) => (
          <ChoiceTile
            key={plan.name}
            value={plan.name}
            aria-label={plan.name}
            className="items-start"
            description={
              <span className="grid min-w-0 gap-4 pt-3 font-body">
                <span className="min-w-0 wrap-anywhere">
                  <span className="block font-display text-display font-bold text-ink in-data-checked:text-current">
                    {currency.format(plan.monthly * (period === "yearly" ? 10 : 1))}
                  </span>
                  <span className="block text-body-sm">{period === "yearly" ? "per year" : "per month"}</span>
                </span>
                <span className="min-w-0 wrap-anywhere">{plan.summary}</span>
                <span className="grid min-w-0 gap-2">
                  {plan.features.map((feature) => (
                    <span key={feature} className="flex min-w-0 items-start gap-2">
                      <Check aria-hidden className="size-5 shrink-0" />
                      <span className="min-w-0 wrap-anywhere">{feature}</span>
                    </span>
                  ))}
                </span>
              </span>
            }
          >
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              {plan.name}
              {plan.name === "Plus" && <Badge tone="sun">Most popular</Badge>}
            </span>
          </ChoiceTile>
        ))}
      </ChoiceTileGroup>
      <Button tone="primary" className="w-full @[36rem]/plan-picker:w-fit" onClick={() => onContinue(selected, period)}>
        Continue with {selected}
      </Button>
    </div>
  );
}

const meta = {
  title: "Recipes/Plan picker",
  component: PlanPicker,
  args: { onContinue: fn() },
} satisfies Meta<typeof PlanPicker>;

/** Metadata for the plan comparison recipe.
 * Use when: browsing a billing choice screen. Avoid when: importing a checkout component.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** Monthly plans, with Plus selected, that support pointer and direction-aware keyboard changes.
 * Use when: comparing monthly prices. Avoid when: quoting an annual total.
 */
export const Monthly: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const monthly = canvas.getByRole("button", { name: "Monthly" });
    const yearly = canvas.getByRole("button", { name: /Yearly/ });
    const plus = canvas.getByRole("radio", { name: "Plus" });
    const pro = canvas.getByRole("radio", { name: "Pro" });
    const currency = new Intl.NumberFormat(globals.dir === "rtl" ? "ar-u-nu-arab" : "en", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    await userEvent.click(canvas.getByRole("button", { name: "Continue with Plus" }));
    await waitFor(() => {
      expect(args.onContinue).toHaveBeenCalledOnce();
      expect(args.onContinue).toHaveBeenCalledWith("Plus", "monthly");
    });
    await userEvent.click(monthly);
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => expect(yearly).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(yearly).toHaveAttribute("aria-pressed", "true");
      expect(plus.textContent).toContain(currency.format(120));
      expect(plus).toHaveTextContent("per year");
    });
    await userEvent.click(pro);
    await userEvent.click(canvas.getByRole("button", { name: "Continue with Pro" }));
    await waitFor(() => expect(args.onContinue).toHaveBeenLastCalledWith("Pro", "yearly"));
    await userEvent.click(pro);
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowRight}" : "{ArrowLeft}");
    await waitFor(() => {
      expect(plus).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByRole("button", { name: "Continue with Plus" })).toBeVisible();
    });
    await userEvent.click(monthly);
    await waitFor(() => {
      expect(monthly).toHaveAttribute("aria-pressed", "true");
      expect(plus.textContent).toContain(currency.format(12));
    });
    await userEvent.unhover(monthly);
    monthly.blur();
  },
};

/** Annual prices include two free months and keep Plus preselected.
 * Use when: comparing yearly billing totals. Avoid when: showing monthly charges.
 */
export const Yearly: Story = { args: { initialPeriod: "yearly" } };

/** The no-cost plan updates the continuation label.
 * Use when: reviewing the Free selection. Avoid when: recommending Plus by default.
 */
export const FreePlan: Story = { name: "Free plan", args: { initialPlan: "Free" } };

/** The Pro selection updates the continuation label.
 * Use when: reviewing the highest plan. Avoid when: presenting the preselected recommendation.
 */
export const ProPlan: Story = { name: "Pro plan", args: { initialPlan: "Pro" } };

/** Monthly and yearly comparisons in their own containers.
 * Use when: reviewing both billing states. Avoid when: mounting two billing pickers in a checkout.
 */
export const States: Story = {
  render: (args) => (
    <div className="@container grid min-w-0 w-full max-w-6xl gap-8 @[48rem]:grid-cols-2">
      <PlanPicker {...args} initialPeriod="monthly" />
      <PlanPicker {...args} initialPeriod="yearly" />
    </div>
  ),
};
