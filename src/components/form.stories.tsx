import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { pickStoryCopy, storyCopy } from "../../.storybook/story-copy.ts";
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
  render: (args, { globals }) => {
    const copy = pickStoryCopy(storyCopy.formSignUp, globals.locale);
    return (
      <Form {...args} className="w-full max-w-sm">
        <Fieldset>
          <FieldsetLegend>{copy.title}</FieldsetLegend>
          <Field name="name">
            <FieldLabel>{copy.name}</FieldLabel>
            <Input required autoComplete="name" />
            <FieldError match="valueMissing">{copy.nameRequired}</FieldError>
          </Field>
          <Field name="email">
            <FieldLabel>{copy.email}</FieldLabel>
            <Input type="email" required autoComplete="email" />
            <FieldError match="valueMissing">{copy.emailRequired}</FieldError>
            <FieldError match="typeMismatch">{copy.emailInvalid}</FieldError>
          </Field>
          <Field name="country">
            <FieldLabel>{copy.country}</FieldLabel>
            <NativeSelect defaultValue="" required autoComplete="country">
              <option value="">{copy.chooseCountry}</option>
              <option value="in">{copy.india}</option>
              <option value="gb">{copy.uk}</option>
              <option value="us">{copy.us}</option>
            </NativeSelect>
            <FieldError match="valueMissing">{copy.countryRequired}</FieldError>
          </Field>
        </Fieldset>
        <Button type="submit" tone="primary" className="justify-self-start">
          {copy.submit}
        </Button>
      </Form>
    );
  },
  play: async ({ args, canvas, globals, userEvent }) => {
    const copy = pickStoryCopy(storyCopy.formSignUp, globals.locale);
    const submit = canvas.getByRole("button", { name: copy.submit });
    const email = canvas.getByRole("textbox", { name: copy.email });
    await userEvent.click(submit);
    await waitFor(() => {
      expect(canvas.getByText(copy.nameRequired)).toBeVisible();
      expect(canvas.getByText(copy.emailRequired)).toBeVisible();
      expect(canvas.getByText(copy.countryRequired)).toBeVisible();
      expect(args.onFormSubmit).not.toHaveBeenCalled();
    });
    await userEvent.type(canvas.getByRole("textbox", { name: copy.name }), "Nihal");
    await userEvent.type(email, "invalid");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: copy.country }), "gb");
    await userEvent.click(submit);
    await waitFor(() => expect(email).toHaveAccessibleDescription(copy.emailInvalid));
    await userEvent.clear(email);
    await userEvent.type(email, "nihal@example.com");
    await userEvent.click(submit);
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
