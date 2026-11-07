import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";
import { Input } from "./input.tsx";

const meta = {
  title: "Forms/Input",
  component: Input,
  subcomponents: { Field, FieldLabel, FieldDescription, FieldError },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  render: (args) => (
    <Field name="name" className="w-full max-w-sm">
      <FieldLabel>Name</FieldLabel>
      <Input {...args} autoComplete="name" />
      <FieldDescription>How your teammates will see you.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.tab();
    await userEvent.click(canvas.getByText("Name", { selector: "label" }));
    await waitFor(() => {
      expect(input).toHaveFocus();
      expect(input).toHaveAccessibleDescription("How your teammates will see you.");
    });
    await userEvent.type(input, "Nihal");
    await waitFor(() => expect(input).toHaveValue("Nihal"));
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Field key={size}>
          <FieldLabel>{size}</FieldLabel>
          <Input {...args} size={size} placeholder="Always 16px text" />
        </Field>
      ))}
    </div>
  ),
};

export const Placeholder: Story = { args: { placeholder: "e.g. Nihal Mohammed" } };

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultValue: "Nihal" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.type(input, " edits");
    await waitFor(() => expect(input).toHaveValue("Nihal"));
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Field name="name" disabled className="w-full max-w-sm">
      <FieldLabel>Name</FieldLabel>
      <Input {...args} defaultValue="Nihal" />
    </Field>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Name" })).toBeDisabled());
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Form className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input {...args} required autoComplete="name" />
        <FieldError match="valueMissing">Enter your name.</FieldError>
      </Field>
      <Button type="submit" tone="primary" className="justify-self-start">
        Save
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(canvas.getByText("Enter your name.")).toBeVisible();
      expect(input).toHaveAccessibleDescription("Enter your name.");
    });
    await userEvent.type(input, "Nihal");
    await waitFor(() => expect(canvas.queryByText("Enter your name.")).not.toBeInTheDocument());
  },
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid gap-4 @sm:grid-cols-2 @2xl:grid-cols-3">
        {(["Rest", "Hover", "Focus", "Invalid", "Disabled", "Read only"] as const).map((state) => (
          <Field key={state} disabled={state === "Disabled"} invalid={state === "Invalid" || undefined}>
            <FieldLabel>{state}</FieldLabel>
            <Input
              {...args}
              defaultValue={state === "Invalid" ? "" : "Nihal"}
              readOnly={state === "Read only"}
              data-demo={state === "Hover" ? "hover" : state === "Focus" ? "focus" : undefined}
            />
            {state === "Invalid" && <FieldError match>Enter your name.</FieldError>}
          </Field>
        ))}
      </div>
    </div>
  ),
};

export const LongLabel: Story = {
  name: "Long label",
  render: (args) => (
    <Field className="w-48 max-w-full">
      <FieldLabel>The name you would like everyone on your team to see when you contribute</FieldLabel>
      <Input {...args} />
      <FieldDescription>You can change this name whenever you like without changing your account.</FieldDescription>
    </Field>
  ),
};
