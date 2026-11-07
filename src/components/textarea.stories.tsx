import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { Textarea } from "./textarea.tsx";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  args: { onValueChange: fn() },
  render: (args) => (
    <Field name="message" className="w-full max-w-sm">
      <FieldLabel>Message</FieldLabel>
      <Textarea {...args} placeholder="Tell us a little more" />
      <FieldDescription>Include the details your team needs.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Message" });
    await userEvent.type(textarea, "First line{Enter}Second line");
    await waitFor(() => {
      expect(textarea).toHaveValue("First line\nSecond line");
      expect(args.onValueChange).toHaveBeenLastCalledWith("First line\nSecond line", expect.anything());
    });
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Field name="message" invalid className="w-full max-w-sm">
      <FieldLabel>Message</FieldLabel>
      <Textarea {...args} required />
      <FieldError match>Add a message.</FieldError>
    </Field>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Field name="message" disabled className="w-full max-w-sm">
      <FieldLabel>Message</FieldLabel>
      <Textarea {...args} defaultValue="This message cannot be edited." />
    </Field>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Message" })).toBeDisabled());
  },
};
