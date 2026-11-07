import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { Field, FieldError, FieldLabel } from "./field.tsx";
import { Fieldset, FieldsetLegend } from "./fieldset.tsx";
import { Form } from "./form.tsx";
import { Input } from "./input.tsx";
import { NativeSelect } from "./native-select.tsx";

const meta = {
  title: "Forms/Form",
  component: Form,
  subcomponents: { Fieldset, FieldsetLegend },
  args: { onFormSubmit: fn() },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignUp: Story = {
  name: "Sign up",
  render: (args) => (
    <Form {...args} className="w-full max-w-sm">
      <Fieldset>
        <FieldsetLegend>Create your account</FieldsetLegend>
        <Field name="name">
          <FieldLabel>Name</FieldLabel>
          <Input required autoComplete="name" />
          <FieldError match="valueMissing">Enter your name.</FieldError>
        </Field>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" required autoComplete="email" />
          <FieldError match="valueMissing">Enter your email.</FieldError>
          <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
        </Field>
        <Field name="country">
          <FieldLabel>Country</FieldLabel>
          <NativeSelect defaultValue="" required autoComplete="country">
            <option value="">Choose a country</option>
            <option value="in">India</option>
            <option value="gb">United Kingdom</option>
            <option value="us">United States</option>
          </NativeSelect>
          <FieldError match="valueMissing">Choose a country.</FieldError>
        </Field>
      </Fieldset>
      <Button type="submit" tone="primary" className="justify-self-start">
        Sign up
      </Button>
    </Form>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Nihal");
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "nihal@example.com");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Country" }), "gb");
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }));
    await waitFor(() =>
      expect(args.onFormSubmit).toHaveBeenCalledWith(
        { name: "Nihal", email: "nihal@example.com", country: "gb" },
        expect.anything(),
      ),
    );
  },
};

export const ServerErrors: Story = {
  name: "Server errors",
  args: { errors: { email: "This email is already registered." } },
  render: (args) => (
    <Form {...args} className="w-full max-w-sm">
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input defaultValue="Nihal" autoComplete="name" />
        <FieldError />
      </Field>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" defaultValue="nihal@example.com" autoComplete="email" />
        <FieldError />
      </Field>
      <Button type="submit" tone="primary" className="justify-self-start">
        Try again
      </Button>
    </Form>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => {
      expect(canvas.getByText("This email is already registered.")).toBeVisible();
      expect(canvas.getByRole("textbox", { name: "Email" })).toHaveAccessibleDescription(
        "This email is already registered.",
      );
    });
  },
};
