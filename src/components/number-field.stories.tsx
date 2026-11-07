import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { labels } from "../labels.ts";
import { KumikoProvider } from "../provider.tsx";
import { Button } from "./button.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";
import { NumberField, type NumberFieldProps } from "./number-field.tsx";

interface QuantityFieldProps extends NumberFieldProps {
  label?: string;
  invalid?: boolean;
}

function QuantityField({ label = "Quantity", invalid, ...props }: QuantityFieldProps) {
  return (
    <Field name={props.name ?? "quantity"} disabled={props.disabled} invalid={invalid} className="w-full max-w-sm">
      <FieldLabel>{label}</FieldLabel>
      <NumberField {...props} />
      <FieldDescription>Choose how many items to include.</FieldDescription>
      <FieldError match={invalid ? true : "valueMissing"}>Enter a quantity.</FieldError>
    </Field>
  );
}

const meta = {
  title: "Forms/NumberField",
  component: NumberField,
  args: { defaultValue: 4, min: 0, step: 2, onValueChange: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  render: (args) => <QuantityField {...args} />,
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const locale = globals.dir === "rtl" ? "ar-u-nu-arab" : "en";
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    const increase = labels[globals.dir === "rtl" ? "ar" : "en"].increment;
    await userEvent.click(canvas.getByRole("button", { name: increase }));
    await waitFor(() => {
      expect(input).toHaveValue(new Intl.NumberFormat(locale).format(6));
      expect(input).toHaveAccessibleDescription("Choose how many items to include.");
      expect(args.onValueChange).toHaveBeenCalledWith(6, expect.objectContaining({ reason: "increment-press" }));
    });
  },
};

export const Bounds: Story = {
  args: { defaultValue: 10, max: 10 },
  play: async ({ args, canvas, globals, userEvent }) => {
    const increase = canvas.getByRole("button", { name: labels[globals.dir === "rtl" ? "ar" : "en"].increment });
    await waitFor(() => expect(increase).toBeDisabled());
    await userEvent.click(increase);
    await waitFor(() => expect(args.onValueChange).not.toHaveBeenCalled());
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, globals, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    const increase = canvas.getByRole("button", { name: labels[globals.dir === "rtl" ? "ar" : "en"].increment });
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(increase).toBeDisabled();
    });
    await userEvent.click(increase);
    await userEvent.tab();
    await waitFor(() => {
      expect(input).not.toHaveFocus();
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  args: { defaultValue: undefined, required: true },
  render: (args) => (
    <Form onSubmit={(event) => event.preventDefault()} className="w-full max-w-sm">
      <QuantityField {...args} defaultValue={undefined} />
      <Button type="submit" tone="primary" className="justify-self-start">
        Save quantity
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.click(canvas.getByRole("button", { name: "Save quantity" }));
    await waitFor(() => {
      expect(canvas.getByText("Enter a quantity.")).toBeVisible();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(/Enter a quantity\./);
    });
    await userEvent.type(input, "12");
    await waitFor(() => expect(canvas.queryByText("Enter a quantity.")).not.toBeInTheDocument());
  },
};

export const ArabicDigits: Story = {
  name: "Arabic digits",
  args: { defaultValue: undefined, step: 1 },
  render: (args, { globals }) => (
    <KumikoProvider locale="ar-u-nu-arab" direction={globals.dir === "rtl" ? "rtl" : "ltr"}>
      <div lang="ar">
        <QuantityField {...args} defaultValue={undefined} name="arabic-quantity" label="الكمية" />
      </div>
    </KumikoProvider>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "الكمية" });
    await userEvent.type(input, "١٢");
    await waitFor(() => {
      expect(input).toHaveValue("١٢");
      expect(args.onValueChange).toHaveBeenLastCalledWith(12, expect.objectContaining({ reason: "input-change" }));
      expect(canvasElement.querySelector<HTMLInputElement>('input[type="number"][name="arabic-quantity"]')).toHaveValue(
        12,
      );
    });
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <QuantityField key={size} {...args} size={size} name={`quantity-${size}`} label={size} />
      ))}
    </div>
  ),
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Quantity" });
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(input).toHaveAttribute("readonly");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid items-start gap-6 @sm:grid-cols-2">
        {(["Rest", "Hover", "Focus", "Active", "Disabled", "Read only", "Invalid"] as const).map((state) => (
          <QuantityField
            key={state}
            {...args}
            name={`quantity-${state}`}
            label={state}
            disabled={state === "Disabled"}
            readOnly={state === "Read only"}
            invalid={state === "Invalid" || undefined}
            required={state === "Invalid"}
            defaultValue={state === "Invalid" ? undefined : 4}
            inputProps={{
              "aria-label": state,
              ...{ "data-demo": state === "Hover" ? "hover" : state === "Focus" ? "focus" : undefined },
            }}
            ref={(root) => {
              if (state !== "Hover" && state !== "Active") return;
              if (state === "Hover")
                root?.querySelector("[data-slot=number-field-group]")?.setAttribute("data-demo", "hover");
              root?.querySelector("[data-slot=number-field-increment]")?.setAttribute("data-demo", state.toLowerCase());
            }}
          />
        ))}
      </div>
    </div>
  ),
};
