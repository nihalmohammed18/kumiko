"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useId, useRef, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { Button } from "../components/button.tsx";
import { Celebration } from "../components/celebration.tsx";
import { Character } from "../components/character.tsx";
import { ChoiceTile, ChoiceTileGroup } from "../components/choice-tile.tsx";
import { ProgressSteps } from "../components/progress-steps.tsx";
import { formatLabel } from "../labels.ts";
import { useKumiko } from "../provider.tsx";

const goals = ["Internship", "First job", "Career switch"];
const steps = ["Your goal", "Your time", "Confirm"];

/** A three-step choice flow ending in an earned streak celebration.
 * Use when: trying Kumiko's onboarding loop in Storybook or Welcome. Avoid when: saving real account preferences.
 */
export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("");
  const { labels, locale } = useKumiko();
  const numbers = new Intl.NumberFormat(locale);
  const weeklyTimes = [1, 3, 5].map((hours) => ({
    value: String(hours),
    label: `${numbers.format(hours)}${hours === 5 ? "+" : ""} ${hours === 1 ? "hour" : "hours"}`,
  }));
  const questionId = useId();
  const reasonId = useId();
  const root = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const canContinue = step === 0 ? Boolean(goal) : step === 1 ? Boolean(weeklyTime) : true;
  const question =
    step === 0
      ? "What are you looking for?"
      : step === 1
        ? "How much time do you have each week?"
        : "Your plan is ready";

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    // Announce the new view and put the next choices directly after it in keyboard order.
    root.current?.querySelector<HTMLElement>("h3, [data-slot=celebration-title]")?.focus();
  }, [step]);

  return (
    <div ref={root} className="grid w-full min-w-0 max-w-105 gap-6">
      <ProgressSteps
        aria-label="Onboarding steps"
        steps={steps}
        current={step}
        labels="current"
        locale={locale}
        stepOf={formatLabel(labels.stepOf, locale)}
        stepCompleted={formatLabel(labels.stepCompleted, locale)}
        stepUpcoming={formatLabel(labels.stepUpcoming, locale)}
      />
      {step === 3 ? (
        <Celebration
          title="You're all set!"
          description="Your first step toward your next role starts here."
          character="pip"
          streak={{ count: 1, today: "2026-11-09", done: ["2026-11-09"], gained: true }}
          continueLabel="Try it again"
          onContinue={() => {
            setGoal("");
            setWeeklyTime("");
            setStep(0);
          }}
        />
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-3">
            <h3
              id={questionId}
              tabIndex={-1}
              className="min-w-0 flex-1 wrap-anywhere font-display text-title-sm font-bold text-ink focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-offset-(--kumiko-ring-gap) focus-visible:outline-focus"
            >
              {question}
            </h3>
            {step === 0 && <Character name="pip" pose="waving" size={72} aria-hidden className="shrink-0" />}
          </div>
          {step < 2 ? (
            <ChoiceTileGroup
              key={step}
              aria-labelledby={questionId}
              value={step === 0 ? goal : weeklyTime}
              onValueChange={step === 0 ? setGoal : setWeeklyTime}
            >
              {(step === 0 ? goals.map((label) => ({ value: label, label })) : weeklyTimes).map((choice) => (
                <ChoiceTile key={choice.value} value={choice.value}>
                  {choice.label}
                </ChoiceTile>
              ))}
            </ChoiceTileGroup>
          ) : (
            <dl className="grid min-w-0 gap-4 text-body text-ink">
              <div className="min-w-0 wrap-anywhere">
                <dt className="text-body-sm text-ink-muted">Looking for</dt>
                <dd className="font-bold">{goal}</dd>
              </div>
              <div className="min-w-0 wrap-anywhere">
                <dt className="text-body-sm text-ink-muted">Time each week</dt>
                <dd className="font-bold">{weeklyTimes.find((choice) => choice.value === weeklyTime)?.label}</dd>
              </div>
            </dl>
          )}
          <div className="grid min-w-0 gap-3">
            {!canContinue && (
              <p id={reasonId} className="min-w-0 wrap-anywhere text-body-sm text-ink-muted">
                {step === 0 ? "Choose a goal to continue." : "Choose your weekly time to continue."}
              </p>
            )}
            <div className="flex min-w-0 gap-3">
              {step > 0 && <Button onClick={() => setStep((current) => current - 1)}>Back</Button>}
              <Button
                tone="primary"
                className="min-w-0 flex-1"
                disabled={!canContinue}
                focusableWhenDisabled={!canContinue}
                aria-describedby={!canContinue ? reasonId : undefined}
                onClick={() => {
                  if (canContinue) setStep((current) => current + 1);
                }}
              >
                {step === 2 ? "Finish" : "Continue"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const meta = {
  title: "Recipes/Onboarding",
  component: OnboardingFlow,
  // The reusable flow is a named export, but only these objects are stories.
  includeStories: ["Goal", "WeeklyTime", "Confirmation", "Complete"],
} satisfies Meta<typeof OnboardingFlow>;

/** Storybook metadata for the playable onboarding loop.
 * Use when: browsing its steps. Avoid when: importing story metadata into a product.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** Keeps Continue inert until a keyboard choice is made.
 * Use when: checking the disabled reason and direction-aware choices. Avoid when: previewing a completed plan.
 */
export const Goal: Story = {
  play: async ({ canvas, globals, userEvent }) => {
    const next = canvas.getByRole("button", { name: "Continue" });
    await userEvent.click(next);
    await waitFor(() => {
      expect(next).toHaveAttribute("aria-disabled", "true");
      expect(next).toHaveAccessibleDescription("Choose a goal to continue.");
      expect(canvas.getByRole("heading", { name: "What are you looking for?" })).toBeVisible();
    });
    // A pointer press on the disabled action doesn't move focus to it, so start the keyboard path at the choices.
    canvas.getByRole("radio", { name: "Internship" }).focus();
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Internship" })).toHaveFocus());
    await userEvent.keyboard(" ");
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(canvas.getByRole("radio", { name: "First job" })).toHaveAttribute("aria-checked", "true");
      expect(next).not.toHaveAttribute("aria-disabled", "true");
      expect(canvas.queryByText("Choose a goal to continue.")).not.toBeInTheDocument();
    });
  },
};

/** Moves forward and back while keeping both choices.
 * Use when: checking weekly time and retained answers. Avoid when: finishing onboarding immediately.
 */
export const WeeklyTime: Story = {
  name: "Weekly time",
  play: async (context) => {
    await Goal.play?.(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(canvas.getByRole("heading", { name: "How much time do you have each week?" })).toHaveFocus();
      expect(canvas.getByRole("button", { name: "Continue" })).toHaveAccessibleDescription(
        "Choose your weekly time to continue.",
      );
    });
    const threeHours = canvas.getAllByRole("radio")[1]!;
    const timeLabel = threeHours.textContent!;
    await userEvent.click(threeHours);
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "First job" })).toHaveAttribute("aria-checked", "true"),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(canvas.getByRole("radio", { name: timeLabel })).toHaveAttribute("aria-checked", "true"));
  },
};

/** Reviews the selected goal and weekly time at the last step.
 * Use when: checking the confirmation summary. Avoid when: collecting another answer.
 */
export const Confirmation: Story = {
  play: async (context) => {
    await WeeklyTime.play?.(context);
    const { canvas, userEvent } = context;
    const timeLabel = canvas.getByRole("radio", { checked: true }).textContent!;
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(canvas.getByRole("heading", { name: "Your plan is ready" })).toHaveFocus();
      expect(canvas.getByText("First job")).toBeVisible();
      expect(canvas.getByText(timeLabel)).toBeVisible();
      const progress = canvas.getByRole("list", { name: "Onboarding steps" });
      expect(within(progress).getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");
    });
  },
};

/** Finishes by keyboard and settles on Pip cheering with an earned streak day.
 * Use when: checking the full choose-to-celebrate loop. Avoid when: previewing an unfinished step.
 */
export const Complete: Story = {
  play: async (context) => {
    await Confirmation.play?.(context);
    const { canvas, userEvent } = context;
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Finish" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(
      () => {
        const celebration = canvas.getByRole("region", { name: "You're all set!" });
        expect(celebration).toHaveAttribute("data-finished");
        expect(canvas.getByRole("heading", { name: "You're all set!" })).toHaveFocus();
        expect(celebration.querySelector("[data-slot=streak-increment]")).toBeVisible();
      },
      { timeout: 1600 },
    );
  },
};
