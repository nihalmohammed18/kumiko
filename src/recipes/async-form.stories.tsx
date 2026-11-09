"use client";

import { Field as BaseField } from "@base-ui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { expect, fn, waitFor } from "storybook/test";
import { Alert } from "../components/alert.tsx";
import { Button } from "../components/button.tsx";
import { FeedbackBanner } from "../components/feedback-banner.tsx";
import { Field, FieldError, FieldLabel } from "../components/field.tsx";
import { Fieldset, FieldsetLegend } from "../components/fieldset.tsx";
import { Form, type FormProps } from "../components/form.tsx";
import { Input } from "../components/input.tsx";

type SignUpValues = { name: string; email: string };

async function createAccount(values: SignUpValues, fail: boolean): Promise<NonNullable<FormProps["errors"]>> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  if (fail) throw new Error("Something went wrong on our side");
  return values.email.toLowerCase() === "taken@example.com" ? { email: "That email already has an account" } : {};
}

function AsyncSignUp({ fail = false, onRequest }: { fail?: boolean; onRequest: (values: SignUpValues) => void }) {
  const [errors, setErrors] = useState<FormProps["errors"]>({});
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const submit = useRef<HTMLButtonElement>(null);

  return (
    <div className="grid w-full min-w-0 max-w-md gap-6">
      <Form
        ref={form}
        errors={errors}
        onSubmitCapture={() => {
          if (!inFlight.current) flushSync(() => setErrors({}));
        }}
        onFormSubmit={async (values) => {
          // A ref closes the gap before React renders the loading button, including implicit Enter submissions.
          if (inFlight.current) return;
          inFlight.current = true;
          setPending(true);
          setFailed(false);
          setSucceeded(false);
          const account = { name: String(values.name), email: String(values.email) };
          try {
            onRequest(account);
            const serverErrors = await createAccount(account, fail);
            setErrors(serverErrors);
            if (!serverErrors.email) {
              form.current?.reset();
              setSucceeded(true);
            }
          } catch {
            setFailed(true);
          } finally {
            inFlight.current = false;
            setPending(false);
          }
        }}
      >
        <Fieldset>
          <FieldsetLegend>Create your account</FieldsetLegend>
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input required autoComplete="name" readOnly={pending} />
            <FieldError match="valueMissing">Enter your name.</FieldError>
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              required
              autoComplete="email"
              readOnly={pending}
              onChange={() => setErrors(({ email: _email, ...remaining } = {}) => remaining)}
            />
            <BaseField.Validity>
              {({ validity }) =>
                validity.valueMissing ? (
                  <FieldError match="valueMissing">Enter your email.</FieldError>
                ) : validity.typeMismatch ? (
                  <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
                ) : (
                  <FieldError />
                )
              }
            </BaseField.Validity>
          </Field>
        </Fieldset>
        {failed && (
          <Alert
            role="alert"
            status="danger"
            title="Something went wrong on our side"
            action={
              <Button type="submit" onClick={() => submit.current?.focus()}>
                Try again
              </Button>
            }
          >
            Your answers are still here. Try again when you're ready.
          </Alert>
        )}
        <Button ref={submit} type="submit" tone="primary" loading={pending} loadingLabel="Creating your account…">
          Create account
        </Button>
      </Form>
      {succeeded && <FeedbackBanner status="success" title="Your account is ready!" />}
    </div>
  );
}

const meta = {
  title: "Recipes/Async form",
  component: AsyncSignUp,
  args: { onRequest: fn() },
} satisfies Meta<typeof AsyncSignUp>;

/** Storybook metadata for the mocked sign-up lifecycle.
 * Use when: browsing async submission outcomes. Avoid when: connecting to a real account service.
 */
export default meta;
type Story = StoryObj<typeof meta>;

async function fillAccount({ canvas, userEvent }: Parameters<NonNullable<Story["play"]>>[0], email: string) {
  await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Nihal");
  await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), email);
}

/** Shows loading and ignores both pointer and implicit keyboard resubmission.
 * Use when: checking duplicate-request prevention. Avoid when: leaving a request unresolved.
 */
export const Pending: Story = {
  play: async (context) => {
    const { args, canvas, userEvent } = context;
    await fillAccount(context, "nihal@example.com");
    const submit = canvas.getByRole("button", { name: "Create account" });
    const width = submit.getBoundingClientRect().width;
    await userEvent.click(submit);
    await waitFor(() => {
      expect(submit).toHaveAttribute("aria-busy", "true");
      expect(submit).toHaveAccessibleName("Creating your account…");
      expect(submit.getBoundingClientRect().width).toBe(width);
    });
    await userEvent.click(submit);
    await userEvent.click(canvas.getByRole("textbox", { name: "Email" }));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByText("Your account is ready!")).toBeVisible(), { timeout: 2000 });
    await waitFor(() => {
      expect(submit).not.toHaveAttribute("aria-busy");
      expect(args.onRequest).toHaveBeenCalledOnce();
    });
  },
};

/** Clears only the edited field's server error and permits resubmission.
 * Use when: checking external errors and invalid focus. Avoid when: demonstrating a general outage.
 */
export const ServerFieldError: Story = {
  name: "Server field error",
  play: async (context) => {
    const { args, canvas, userEvent } = context;
    await fillAccount(context, "taken@example.com");
    const email = canvas.getByRole("textbox", { name: "Email" });
    const submit = canvas.getByRole("button", { name: "Create account" });
    await userEvent.click(submit);
    await waitFor(
      () => {
        expect(canvas.getByText("That email already has an account")).toBeVisible();
        expect(email).toHaveAttribute("aria-invalid", "true");
        expect(email).toHaveFocus();
      },
      { timeout: 2000 },
    );
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), " Mohammed");
    await waitFor(() => expect(canvas.getByText("That email already has an account")).toBeVisible());
    await userEvent.clear(email);
    await userEvent.type(email, "taken@example.com");
    await waitFor(() => {
      expect(canvas.queryByText("That email already has an account")).not.toBeInTheDocument();
      expect(email).not.toHaveAttribute("aria-invalid", "true");
    });
    await userEvent.click(submit);
    await waitFor(
      () => {
        expect(canvas.getByText("That email already has an account")).toBeVisible();
        expect(submit).not.toHaveAttribute("aria-busy");
        expect(args.onRequest).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );
  },
};

/** Retries a mocked outage without losing either typed value.
 * Use when: checking recoverable request failures. Avoid when: reporting an invalid field.
 */
export const RequestFailure: Story = {
  name: "Request failure",
  args: { fail: true },
  play: async (context) => {
    const { args, canvas, userEvent } = context;
    await fillAccount(context, "nihal@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("Something went wrong on our side"), {
      timeout: 2000,
    });
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(canvas.getByRole("button", { name: "Try again" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(
      () => {
        expect(canvas.getByRole("alert")).toBeVisible();
        expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("Nihal");
        expect(canvas.getByRole("textbox", { name: "Email" })).toHaveValue("nihal@example.com");
        expect(canvas.getByRole("button", { name: "Create account" })).not.toHaveAttribute("aria-busy");
        expect(args.onRequest).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );
  },
};

/** Validates before submitting, confirms the account and resets the form.
 * Use when: checking the completed sign-up path. Avoid when: keeping a successful form populated.
 */
export const Success: Story = {
  play: async (context) => {
    const { args, canvas, userEvent } = context;
    const submit = canvas.getByRole("button", { name: "Create account" });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(canvas.getByText("Enter your name.")).toBeVisible();
      expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus();
      expect(args.onRequest).not.toHaveBeenCalled();
    });
    await fillAccount(context, "nihal@example.com");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(
      () => {
        expect(canvas.getByText("Your account is ready!")).toBeVisible();
        expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("");
        expect(canvas.getByRole("textbox", { name: "Email" })).toHaveValue("");
        expect(submit).not.toHaveAttribute("aria-busy");
        expect(args.onRequest).toHaveBeenCalledOnce();
        expect(args.onRequest).toHaveBeenCalledWith({ name: "Nihal", email: "nihal@example.com" });
      },
      { timeout: 2000 },
    );
  },
};
