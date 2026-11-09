import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, fn, screen, waitFor, within } from "storybook/test";
import { formatLabel, labels } from "../labels.ts";
import { Button } from "./button.tsx";
import {
  Combobox,
  ComboboxChips,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  ComboboxPopup,
  type ComboboxProps,
} from "./combobox.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { Form } from "./form.tsx";

interface CityGroup {
  label: string;
  items: string[];
}

const cityGroups: CityGroup[] = [
  { label: "Europe", items: ["London", "Paris", "Berlin"] },
  { label: "Asia", items: ["Tokyo", "Karachi", "Mumbai"] },
  { label: "North America", items: ["Los Angeles", "Toronto"] },
];
const cities = cityGroups.flatMap((group) => group.items);

interface CityFieldProps extends ComboboxProps<string> {
  label?: string;
  size?: ComboboxInputProps["size"];
  demo?: string;
  invalid?: boolean;
  disabledItem?: string;
  highlighted?: string;
  emptyContent?: ReactNode;
}

function CityField({
  label = "City",
  size,
  demo,
  invalid,
  disabledItem,
  highlighted,
  disabled,
  emptyContent,
  ...props
}: CityFieldProps) {
  return (
    <Field name={props.name ?? "city"} disabled={disabled} invalid={invalid} className="w-full max-w-xs">
      <FieldLabel>{label}</FieldLabel>
      <Combobox {...props} disabled={disabled}>
        <ComboboxInput
          size={size}
          placeholder="Search cities"
          data-demo={demo}
          ref={(input) => {
            if (input && demo) input.parentElement?.setAttribute("data-demo", demo);
          }}
        />
        <ComboboxPopup emptyContent={emptyContent}>
          {(city: string) => (
            <ComboboxItem
              key={city}
              value={city}
              disabled={city === disabledItem}
              {...(city === highlighted ? { "data-highlighted": "" } : {})}
            >
              {city}
            </ComboboxItem>
          )}
        </ComboboxPopup>
      </Combobox>
      <FieldDescription>Choose the city for your next visit.</FieldDescription>
      <FieldError>Choose a city.</FieldError>
    </Field>
  );
}

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  subcomponents: { ComboboxInput, ComboboxChips, ComboboxPopup, ComboboxItem, ComboboxGroup, ComboboxGroupLabel },
  args: { items: cities, onValueChange: fn(), onInputValueChange: fn(), onOpenChange: fn() },
  render: (args) => <CityField {...args} />,
} satisfies Meta<ComboboxProps<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(input).toHaveAccessibleDescription("Choose the city for your next visit."));
    await userEvent.type(input, "Lon");
    await waitFor(() => {
      expect(body.getAllByRole("option")).toHaveLength(1);
      expect(body.getByRole("option", { name: "London" })).toBeVisible();
    });
    await userEvent.click(body.getByRole("option", { name: "London" }));
    await waitFor(() => {
      expect(input).toHaveValue("London");
      expect(input).toHaveAttribute("aria-expanded", "false");
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      expect(args.onValueChange).toHaveBeenCalledWith("London", expect.anything());
      expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    });
  },
};

export const Keyboard: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, "Lo");
    await waitFor(() => expect(body.getAllByRole("option")).toHaveLength(2));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      const firstMatch = body.getByRole("option", { name: "London" });
      expect(firstMatch).toHaveAttribute("data-highlighted");
      expect(input).toHaveAttribute("aria-activedescendant", firstMatch.id);
      expect(input).toHaveFocus();
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(input).toHaveValue("London");
      expect(input).toHaveFocus();
      expect(body.queryByRole("listbox")).not.toBeInTheDocument();
      expect(args.onValueChange).toHaveBeenCalledWith("London", expect.anything());
    });
  },
};

export const NoMatches: Story = {
  name: "No matches",
  args: { open: true },
  parameters: { vrt: "page" },
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const strings = labels[globals.dir === "rtl" ? "ar" : "en"];
    await waitFor(() => expect(body.getByRole("listbox")).toBeVisible());
    const empty = document.querySelector("[data-slot=combobox-empty]");
    await userEvent.type(canvas.getByRole("combobox", { name: "City" }), "zzz");
    await waitFor(() => {
      expect(body.getByText(strings.noMatches)).toBeVisible();
      expect(body.queryAllByRole("option")).toHaveLength(0);
      expect(document.querySelector("[data-slot=combobox-empty]")).toBe(empty);
      expect(empty).toHaveAttribute("role", "status");
      expect(empty).toHaveAttribute("aria-live", "polite");
      expect(empty).toHaveAttribute("aria-atomic", "true");
    });
  },
};

export const CustomEmptyContent: Story = {
  name: "Custom empty content",
  args: { open: true },
  parameters: { vrt: "page" },
  render: (args) => <CityField {...args} emptyContent={<span>Try another city or check the spelling.</span>} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "City" }), "zzz");
    await waitFor(() => {
      const empty = canvasElement.ownerDocument.querySelector("[data-slot=combobox-empty]");
      expect(empty).toHaveTextContent("Try another city or check the spelling.");
      expect(empty).toBeVisible();
      expect(empty).toHaveAttribute("role", "status");
      expect(empty).toHaveAttribute("aria-live", "polite");
      expect(empty).toHaveAttribute("aria-atomic", "true");
    });
  },
};

function ControlledCity(props: ComboboxProps<string>) {
  const [value, setValue] = useState<string | null>(props.defaultValue ?? null);
  const [inputValue, setInputValue] = useState(props.defaultValue ?? "");
  const [open, setOpen] = useState(false);
  return (
    <CityField
      {...props}
      value={value}
      inputValue={inputValue}
      open={open}
      onValueChange={(next, details) => {
        setValue(next);
        props.onValueChange?.(next, details);
      }}
      onInputValueChange={(next, details) => {
        setInputValue(next);
        props.onInputValueChange?.(next, details);
      }}
      onOpenChange={(next, details) => {
        setOpen(next);
        props.onOpenChange?.(next, details);
      }}
    />
  );
}

export const Clear: Story = {
  args: { defaultValue: "London" },
  render: (args) => <ControlledCity {...args} />,
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    const clear = labels[globals.dir === "rtl" ? "ar" : "en"].clear;
    await waitFor(() => expect(input).toHaveValue("London"));
    await userEvent.click(canvas.getByRole("button", { name: clear }));
    await waitFor(() => {
      expect(input).toHaveValue("");
      expect(input).toHaveFocus();
      expect(canvas.queryByRole("button", { name: clear })).not.toBeInTheDocument();
      expect(args.onValueChange).toHaveBeenCalledWith(null, expect.objectContaining({ reason: "clear-press" }));
      expect(args.onInputValueChange).toHaveBeenCalledWith("", expect.objectContaining({ reason: "clear-press" }));
    });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).toBeNull());
  },
};

export const Open: Story = {
  args: { items: cityGroups, open: true },
  parameters: { vrt: "page" },
  render: (args) => (
    <Field name="city" className="w-full max-w-xs">
      <FieldLabel>City</FieldLabel>
      <Combobox {...args}>
        <ComboboxInput placeholder="Search cities" />
        <ComboboxPopup>
          {(group: CityGroup) => (
            <ComboboxGroup key={group.label} items={group.items}>
              <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
              {group.items.map((city) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxPopup>
      </Combobox>
    </Field>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.type(input, "Par");
    await waitFor(() => {
      expect(body.getAllByRole("option")).toHaveLength(1);
      expect(body.getByRole("option", { name: "Paris" })).toBeVisible();
      expect(body.getByRole("group", { name: "Europe" })).toBeVisible();
      expect(body.queryByRole("group", { name: "Asia" })).not.toBeInTheDocument();
    });
    await userEvent.clear(input);
    await waitFor(() => {
      expect(body.getAllByRole("option")).toHaveLength(cities.length);
      expect(body.getByRole("group", { name: "Asia" })).toBeVisible();
      expect(body.getByRole("group", { name: "North America" })).toBeVisible();
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "London" },
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    const trigger = canvas.getByRole("button", { name: "City" });
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(trigger).toBeDisabled();
      expect(canvas.queryByRole("button", { name: labels[globals.dir === "rtl" ? "ar" : "en"].clear })).toBeNull();
    });
    await userEvent.click(input);
    await userEvent.click(trigger);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(input).not.toHaveFocus();
      expect(input).toHaveValue("London");
      expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).not.toBeInTheDocument();
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(args.onInputValueChange).not.toHaveBeenCalled();
      expect(args.onOpenChange).not.toHaveBeenCalled();
    });
  },
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultValue: "London" },
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "City" });
    await waitFor(() => {
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
      expect(canvas.queryByRole("button", { name: labels[globals.dir === "rtl" ? "ar" : "en"].clear })).toBeNull();
    });
    await userEvent.type(input, "Paris");
    await waitFor(() => {
      expect(input).toHaveValue("London");
      expect(args.onValueChange).not.toHaveBeenCalled();
      expect(args.onInputValueChange).not.toHaveBeenCalled();
    });
    // A read-only list still opens for browsing; Escape closes it, so the story rests closed.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).toBeNull());
  },
};

export const Invalid: Story = {
  args: { required: true },
  render: (args) => (
    <Form onSubmit={(event) => event.preventDefault()} className="w-full max-w-xs">
      <CityField {...args} />
      <Button type="submit" tone="primary" className="justify-self-start">
        Save city
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save city" }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a city.")).toBeVisible();
      const input = canvas.getByRole("combobox", { name: "City" });
      expect(input).toHaveAttribute("aria-required", "true");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(/Choose a city\./);
    });
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-full flex-wrap items-start gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <CityField key={size} {...args} label={`Size ${size}`} size={size} />
      ))}
    </div>
  ),
};

/** An open list with a highlighted and a disabled option, held open through the harness's focus reset. */
export const ItemStates: Story = {
  name: "Item states",
  args: { defaultValue: "London", open: true },
  parameters: { vrt: "page" },
  render: (args) => (
    <div className="min-h-96">
      <CityField {...args} disabledItem="Tokyo" highlighted="London" />
    </div>
  ),
};

/** Every closed state. Open lists have their own stories: an open popup hides the rest of the page from
 * assistive technology, so two open at once would hide each other's fields. */
export const States: Story = {
  render: (args) => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] items-start gap-8">
      <CityField {...args} label="Rest" />
      <CityField {...args} label="Hover" demo="hover" />
      <CityField {...args} label="Pressed" demo="active" />
      <CityField {...args} label="Keyboard focus" demo="focus" />
      <CityField {...args} label="Disabled" defaultValue="London" disabled />
      <CityField {...args} label="Read only" defaultValue="London" readOnly />
      <CityField {...args} label="Invalid" required invalid />
      <CityField {...args} label="Selected" defaultValue="Paris" />
    </div>
  ),
};

const skills = ["TypeScript", "CSS", "Git", "React", "Accessibility", "Interaction design", "User research"];
const chosenSkills = skills.slice(0, 3);

function SkillsField({
  label = "Skills",
  placeholder = "Search skills",
  invalid,
  disabled,
  ...props
}: ComboboxProps<string, true> & { label?: string; placeholder?: string; invalid?: boolean }) {
  return (
    <Field name="skills" disabled={disabled} invalid={invalid} className="w-full max-w-xs">
      <FieldLabel>{label}</FieldLabel>
      <Combobox {...props} items={skills} multiple>
        <ComboboxChips placeholder={placeholder} />
        <ComboboxPopup>
          {(skill: string) => (
            <ComboboxItem key={skill} value={skill}>
              {skill}
            </ComboboxItem>
          )}
        </ComboboxPopup>
      </Combobox>
      <FieldError match={invalid}>Choose at least one skill.</FieldError>
    </Field>
  );
}

function MultipleSkills() {
  const [value, setValue] = useState(chosenSkills);
  const [submitted, setSubmitted] = useState<FormDataEntryValue[]>([]);
  return (
    <Form
      className="w-full max-w-xs"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(new FormData(event.currentTarget).getAll("skills"));
      }}
    >
      <SkillsField value={value} onValueChange={setValue} />
      <Button type="submit" className="justify-self-start">
        Save skills
      </Button>
      <p data-testid="submitted-skills" className="wrap-anywhere text-body-sm">
        {submitted.join(", ")}
      </p>
    </Form>
  );
}

export const Multiple: Story = {
  render: () => <MultipleSkills />,
  play: async ({ canvas, canvasElement, globals, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Skills" });
    const body = within(canvasElement.ownerDocument.body);
    const strings = labels[globals.dir === "rtl" ? "ar" : "en"];
    const locale = globals.dir === "rtl" ? "ar" : "en";
    const form = canvasElement.querySelector("form")!;
    for (const skill of ["React", "Accessibility"]) {
      await userEvent.type(input, skill);
      await waitFor(() => expect(body.getByRole("option", { name: skill })).toBeVisible());
      await userEvent.click(body.getByRole("option", { name: skill }));
      await waitFor(() => {
        expect(input).toHaveValue("");
        expect(body.queryByRole("listbox")).not.toBeInTheDocument();
        expect(
          canvas.getByRole("button", { name: formatLabel(strings.removeChip, locale, undefined, { label: skill }) }),
        ).toBeVisible();
      });
    }
    await expect(new FormData(form).getAll("skills")).toEqual([...chosenSkills, "React", "Accessibility"]);
    await userEvent.click(
      canvas.getByRole("button", { name: formatLabel(strings.removeChip, locale, undefined, { label: "React" }) }),
    );
    await waitFor(() => {
      expect(new FormData(form).getAll("skills")).toEqual([...chosenSkills, "Accessibility"]);
      expect(screen.getByRole("status")).toHaveTextContent(
        formatLabel(strings.removedChip, locale, undefined, { label: "React" }),
      );
    });
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowRight}" : "{ArrowLeft}");
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="combobox-chip"]:last-of-type')).toHaveFocus());
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => {
      expect(new FormData(form).getAll("skills")).toEqual(chosenSkills);
      expect(screen.getByRole("status")).toHaveTextContent(
        formatLabel(strings.removedChip, locale, undefined, { label: "Accessibility" }),
      );
    });
    await userEvent.click(canvas.getByRole("button", { name: "Save skills" }));
    await waitFor(() => expect(canvas.getByTestId("submitted-skills")).toHaveTextContent(chosenSkills.join(", ")));
  },
};

export const MultipleStates: Story = {
  name: "Multiple states",
  render: () => (
    <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] items-start gap-8">
      <SkillsField label="Empty" />
      <SkillsField label="Wrapping" defaultValue={["React", "CSS", "Accessibility"]} />
      <SkillsField label="Disabled skills" defaultValue={chosenSkills} disabled />
      <SkillsField label="Invalid skills" invalid required />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const disabled = canvas.getByRole("combobox", { name: "Disabled skills" });
    const field = disabled.closest('[data-slot="field"]')!;
    const remove = within(field as HTMLElement).getAllByRole("button")[0]!;
    await userEvent.click(remove);
    await waitFor(() => {
      expect(disabled).toBeDisabled();
      expect(remove).toBeDisabled();
      expect(field.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(3);
      expect(canvas.getByRole("combobox", { name: "Invalid skills" })).toHaveAttribute("aria-invalid", "true");
      expect(canvas.getByText("Choose at least one skill.")).toBeVisible();
    });
    const wrapping = canvas.getByRole("combobox", { name: "Wrapping" }).closest('[data-slot="combobox-chips"]')!;
    await waitFor(() => {
      const chips = [...wrapping.querySelectorAll('[data-slot="combobox-chip"]')];
      expect(new Set(chips.map((chip) => chip.getBoundingClientRect().top)).size).toBe(2);
    });
    await userEvent.click(canvas.getByRole("combobox", { name: "Empty" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("listbox")).toBeNull());
  },
};

export const MultipleRtl: Story = {
  name: "Multiple right to left",
  globals: { dir: "rtl" },
  render: () => <SkillsField label="المهارات" placeholder="ابحث عن مهارة" defaultValue={chosenSkills} />,
};
