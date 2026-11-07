import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { Checkbox } from "./checkbox.tsx";
import { Field, FieldError } from "./field.tsx";
import { Form } from "./form.tsx";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { children: "Accept terms", onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    await userEvent.click(canvas.getByText("Accept terms"));
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    });
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("checkbox", { name: "Accept terms" })).toHaveAttribute("aria-checked", "mixed"),
    );
  },
};

export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    await userEvent.tab();
    await waitFor(() => expect(checkbox).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => expect(checkbox).toHaveAttribute("aria-checked", "true"));
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    await userEvent.click(checkbox);
    await userEvent.click(canvas.getByText("Accept terms"));
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-disabled", "true");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultChecked: true },
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await userEvent.click(canvas.getByText("Accept terms"));
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Form className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <Field name="terms">
        <Checkbox {...args} required />
        <FieldError match="valueMissing">Accept the terms to continue.</FieldError>
      </Field>
      <Button type="submit" tone="primary" className="justify-self-start">
        Continue
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
      expect(canvas.getByText("Accept the terms to continue.")).toBeVisible();
      expect(checkbox).toHaveAccessibleDescription("Accept the terms to continue.");
    });
  },
};

/** Unchecked, checked and indeterminate choices in every interaction state. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {(["Unchecked", "Checked", "Indeterminate"] as const).map((state) => (
        <div key={state} className="grid gap-3">
          <p className="text-label font-bold">{state}</p>
          <div className="flex flex-wrap items-start gap-4">
            {(["rest", "hover", "focus", "active", "disabled"] as const).map((interaction) => (
              <Checkbox
                {...args}
                key={interaction}
                defaultChecked={state === "Checked"}
                indeterminate={state === "Indeterminate"}
                disabled={interaction === "disabled"}
                data-demo={interaction === "rest" || interaction === "disabled" ? undefined : interaction}
              >
                {interaction}
              </Checkbox>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
