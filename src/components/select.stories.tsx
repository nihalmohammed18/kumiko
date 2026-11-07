import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "./button.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  type SelectProps,
  SelectSeparator,
  SelectTrigger,
  type SelectTriggerProps,
  SelectValue,
} from "./select.tsx";

const periods = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

interface PeriodFieldProps extends SelectProps<string> {
  label?: string;
  size?: SelectTriggerProps["size"];
  demo?: string;
  invalid?: boolean;
  highlighted?: string;
  disabledItem?: string;
}

function PeriodField({
  label = "Period",
  size,
  demo,
  invalid,
  highlighted,
  disabledItem,
  disabled,
  ...props
}: PeriodFieldProps) {
  return (
    <Field name={props.name ?? "period"} disabled={disabled} invalid={invalid} className="w-full max-w-xs">
      <FieldLabel>{label}</FieldLabel>
      <Select {...props} disabled={disabled}>
        <SelectTrigger size={size} data-demo={demo}>
          <SelectValue placeholder="Choose a period" />
        </SelectTrigger>
        <SelectPopup>
          {periods.map(({ value, label: itemLabel }) => (
            <SelectItem
              key={value}
              value={value}
              disabled={value === disabledItem}
              {...(value === highlighted ? { "data-highlighted": "" } : {})}
            >
              {itemLabel}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
      <FieldDescription>Choose how to group report data.</FieldDescription>
      <FieldError>Choose a period.</FieldError>
    </Field>
  );
}

const meta = {
  title: "Forms/Select",
  component: Select,
  subcomponents: {
    SelectTrigger,
    SelectValue,
    SelectPopup,
    SelectItem,
    SelectGroup,
    SelectGroupLabel,
    SelectSeparator,
  },
  args: { items: periods, defaultValue: "day", onValueChange: fn(), onOpenChange: fn() },
  render: (args) => <PeriodField {...args} />,
} satisfies Meta<SelectProps<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Period" });
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(trigger).toHaveAccessibleDescription("Choose how to group report data."));
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("listbox")).toBeVisible());
    await userEvent.click(body.getByRole("option", { name: "Week" }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Week");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      expect(args.onValueChange).toHaveBeenCalledWith("week", expect.anything());
      expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    });
  },
};

export const Keyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Period" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(body.getByRole("listbox")).toBeVisible();
      expect(body.getByRole("option", { name: "Day" })).toHaveFocus();
    });
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      const week = body.getByRole("option", { name: "Week" });
      expect(week).toHaveFocus();
      expect(week).toHaveAttribute("data-highlighted");
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Week");
      expect(trigger).toHaveFocus();
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
    });
  },
};

export const Open: Story = {
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => <PeriodField {...args} highlighted="day" />,
};

const periodGroups = [
  { label: "Frequent reports", items: periods.slice(0, 3) },
  { label: "Long-term reports", items: periods.slice(3) },
];

export const Groups: Story = {
  args: { items: periodGroups, open: true, defaultValue: "quarter" },
  parameters: { vrt: "page" },
  render: (args) => (
    <Field name="period" className="w-full max-w-xs">
      <FieldLabel>Period</FieldLabel>
      <Select {...args}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a period" />
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            <SelectGroupLabel>{periodGroups[0]!.label}</SelectGroupLabel>
            {periodGroups[0]!.items.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>{periodGroups[1]!.label}</SelectGroupLabel>
            {periodGroups[1]!.items.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectPopup>
      </Select>
    </Field>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Period" });
    await waitFor(() => expect(trigger).toBeDisabled());
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(trigger).not.toHaveFocus();
      expect(trigger).toHaveTextContent("Day");
      expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).not.toBeInTheDocument();
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

export const DisabledItem: Story = {
  name: "Disabled item",
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => <PeriodField {...args} disabledItem="week" />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Period" });
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole("option", { name: "Week" })).toHaveAttribute("aria-disabled", "true"));
    await userEvent.click(body.getByRole("option", { name: "Week" }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Day");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
    // The keyboard can land on a disabled option (Base UI keeps it reachable, as ARIA allows) but can't choose it.
    body.getByRole("option", { name: "Day" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("option", { name: "Week" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onValueChange).not.toHaveBeenCalled());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(body.getByRole("option", { name: "Month" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Month");
      expect(args.onValueChange).toHaveBeenCalledWith("month", expect.anything());
    });
  },
};

export const Invalid: Story = {
  args: { defaultValue: null, required: true },
  render: (args) => (
    <Form onSubmit={(event) => event.preventDefault()} className="w-full max-w-xs">
      <PeriodField {...args} />
      <Button type="submit" tone="primary" className="justify-self-start">
        Save period
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save period" }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a period.")).toBeVisible();
      const trigger = canvas.getByRole("combobox", { name: "Period" });
      expect(trigger).toHaveAttribute("aria-required", "true");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
      expect(trigger).toHaveAccessibleDescription(/Choose a period\./);
    });
  },
};

const longPeriods = [
  { value: "weekly", label: "Every week, including the complete activity report for all teams and their projects" },
  { value: "monthly", label: "Every month, after reconciling all transactions across the organization's workspaces" },
  { value: "quarterly", label: "Every quarter, with a detailed comparison against the previous financial year" },
  { value: "ar", label: "كل أسبوع مع تقرير مفصل عن نشاط جميع الفرق والمشروعات خلال الفترة المحددة" },
  { value: "unbroken", label: "MonthlyReconciliationAcrossAllProjectsAndWorkspacesWithoutAbbreviatingTheReportLabel" },
];

export const LongOptions: Story = {
  name: "Long options",
  args: { items: longPeriods, open: true, defaultValue: "weekly" },
  parameters: { vrt: "page" },
  render: (args) => (
    <Field name="period" className="w-56 max-w-full">
      <FieldLabel>Reporting schedule</FieldLabel>
      <Select {...args}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup className="w-56 max-w-full">
          {longPeriods.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    await waitFor(() => {
      expect(within(document.body).getByRole("listbox")).toBeVisible();
      const texts = document.querySelectorAll<HTMLElement>("[data-slot=select-item-text], [data-slot=select-value]");
      expect(texts.length).toBeGreaterThan(0);
      for (const text of texts) expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth + 1);
      const first = document.querySelector<HTMLElement>("[data-slot=select-item-text]")!;
      expect(first.getBoundingClientRect().height).toBeGreaterThan(
        Number.parseFloat(getComputedStyle(first).lineHeight),
      );
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    });
  },
};

function ControlledPeriod(props: SelectProps<string>) {
  const [value, setValue] = useState<string | null>("month");
  const [open, setOpen] = useState(false);
  return (
    <PeriodField
      {...props}
      value={value}
      open={open}
      onValueChange={(next, details) => {
        setValue(next);
        props.onValueChange?.(next, details);
      }}
      onOpenChange={(next, details) => {
        setOpen(next);
        props.onOpenChange?.(next, details);
      }}
    />
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledPeriod {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("combobox", { name: "Period" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("listbox")).toBeVisible());
    await userEvent.click(body.getByRole("option", { name: "Year" }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Year");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
    });
  },
};

export const ReadOnly: Story = { name: "Read only", args: { readOnly: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-full flex-wrap items-start gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <PeriodField key={size} {...args} name={`period-${size}`} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

/** All applicable select states, with the popup held open through the UX harness's focus reset. */
export const States: Story = {
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] items-start gap-8">
      <div className="min-h-96">
        <PeriodField {...args} label="Open" defaultValue="week" open modal={false} disabledItem="year" />
      </div>
      <PeriodField {...args} label="Rest" />
      <PeriodField {...args} label="Placeholder" defaultValue={null} />
      <PeriodField {...args} label="Hover" demo="hover" />
      <PeriodField {...args} label="Pressed" demo="active" />
      <PeriodField {...args} label="Keyboard focus" demo="focus" />
      <PeriodField {...args} label="Disabled" defaultValue={null} disabled />
      <PeriodField {...args} label="Read only" readOnly />
      <PeriodField {...args} label="Invalid" defaultValue={null} required invalid />
      <PeriodField {...args} label="Selected" defaultValue="week" />
    </div>
  ),
};
