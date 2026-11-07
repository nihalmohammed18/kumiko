import { Field as BaseField } from "@base-ui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BriefcaseBusiness, Clock, GraduationCap } from "lucide-react";
import { expect, fn, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { ChoiceTile, ChoiceTileGroup } from "./choice-tile.tsx";
import { Field, FieldError } from "./field.tsx";
import { Fieldset, FieldsetLegend } from "./fieldset.tsx";
import { Form } from "./form.tsx";

const meta = {
  title: "Forms/ChoiceTile",
  component: ChoiceTileGroup,
  subcomponents: { ChoiceTile },
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <ChoiceTileGroup {...args} aria-label="What kind of role?">
        <ChoiceTile
          value="internship"
          icon={<GraduationCap className="size-6" />}
          description="Learn with hands-on experience."
        >
          Internship
        </ChoiceTile>
        <ChoiceTile
          value="full-time"
          icon={<BriefcaseBusiness className="size-6" />}
          description="Take the next step in your career."
        >
          Full-time
        </ChoiceTile>
        <ChoiceTile
          value="part-time"
          icon={<Clock className="size-6" />}
          description="Find work that fits your schedule."
        >
          Part-time
        </ChoiceTile>
      </ChoiceTileGroup>
    </div>
  ),
} satisfies Meta<typeof ChoiceTileGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const internship = canvas.getByRole("radio", { name: "Internship" });
    const fullTime = canvas.getByRole("radio", { name: "Full-time" });
    const title = internship.querySelector('[data-slot="choice-tile-title"]')!;
    const titleWidth = title.getBoundingClientRect().width;
    await userEvent.click(internship);
    await waitFor(() => {
      expect(internship).toHaveAttribute("aria-checked", "true");
      expect(internship).toHaveAccessibleDescription("Learn with hands-on experience.");
      expect(internship.querySelector('[data-slot="choice-tile-check"]')).toBeVisible();
      expect(title.getBoundingClientRect().width).toBe(titleWidth);
    });
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(fullTime).toHaveFocus();
      expect(fullTime).toHaveAttribute("aria-checked", "true");
      expect(internship).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).toHaveBeenLastCalledWith("full-time", expect.anything());
    });
  },
};

export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ args, canvas, userEvent }) => {
    const internship = canvas.getByRole("checkbox", { name: "Internship" });
    const fullTime = canvas.getByRole("checkbox", { name: "Full-time" });
    await userEvent.tab();
    await waitFor(() => expect(internship).toHaveFocus());
    await userEvent.keyboard(" ");
    await userEvent.tab();
    await waitFor(() => expect(fullTime).toHaveFocus());
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(internship).toHaveAttribute("aria-checked", "true");
      expect(fullTime).toHaveAttribute("aria-checked", "true");
      expect(args.onValueChange).toHaveBeenLastCalledWith(["internship", "full-time"], expect.anything());
    });
    await userEvent.keyboard(" ");
    await waitFor(() => {
      expect(internship).toHaveAttribute("aria-checked", "true");
      expect(fullTime).toHaveAttribute("aria-checked", "false");
    });
  },
};

export const DisabledTile: Story = {
  name: "Disabled tile",
  render: ({ onValueChange }) => (
    <div className="w-full max-w-2xl">
      <ChoiceTileGroup onValueChange={onValueChange} defaultValue="internship" aria-label="What kind of role?">
        <ChoiceTile value="internship">Internship</ChoiceTile>
        <ChoiceTile value="full-time" disabled>
          Full-time
        </ChoiceTile>
        <ChoiceTile value="part-time">Part-time</ChoiceTile>
      </ChoiceTileGroup>
    </div>
  ),
  play: async ({ args, canvas, globals, userEvent }) => {
    const fullTime = canvas.getByRole("radio", { name: "Full-time" });
    await userEvent.click(fullTime);
    await waitFor(() => {
      expect(fullTime).toBeDisabled();
      expect(fullTime).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
    await userEvent.click(canvas.getByRole("radio", { name: "Internship" }));
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "Part-time" })).toHaveAttribute("aria-checked", "true"),
    );
  },
};

export const Columns: Story = { args: { columns: 2 } };

export const ReadOnly: Story = {
  name: "Read only",
  args: { multiple: false, readOnly: true, defaultValue: "internship" },
  play: async ({ args, canvas, globals, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await userEvent.click(canvas.getByRole("radio", { name: "Full-time" }));
    await waitFor(() => {
      expect(canvas.getByRole("radio", { name: "Internship" })).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  render: () => (
    <Form className="w-full max-w-2xl" onSubmit={(event) => event.preventDefault()}>
      <Field name="role">
        <Fieldset>
          <FieldsetLegend id="required-role">What kind of role?</FieldsetLegend>
          <ChoiceTileGroup required aria-labelledby="required-role">
            <BaseField.Item>
              <ChoiceTile value="internship">Internship</ChoiceTile>
            </BaseField.Item>
            <BaseField.Item>
              <ChoiceTile value="full-time">Full-time</ChoiceTile>
            </BaseField.Item>
          </ChoiceTileGroup>
        </Fieldset>
        <FieldError match="valueMissing">Choose a role.</FieldError>
      </Field>
      <Button type="submit" tone="primary" className="justify-self-start">
        Continue
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a role.")).toBeVisible();
      expect(canvas.getByRole("radio", { name: "Internship" })).toHaveAccessibleDescription("Choose a role.");
    });
    await userEvent.click(canvas.getByRole("radio", { name: "Internship" }));
    await waitFor(() => expect(canvas.queryByText("Choose a role.")).not.toBeInTheDocument());
  },
};

/** Checked and unchecked tiles in every interaction state, each in its own named group. */
export const States: Story = {
  render: ({ onValueChange }) => (
    <div className="@container grid w-full max-w-3xl gap-6">
      {[false, true].map((checked) => (
        <div key={String(checked)} className="grid gap-3">
          <p className="text-label font-bold">{checked ? "Checked" : "Unchecked"}</p>
          <div className="grid gap-4 @md:grid-cols-2">
            {(["rest", "hover", "focus", "active", "disabled"] as const).map((interaction) => (
              <ChoiceTileGroup
                onValueChange={onValueChange}
                key={interaction}
                multiple={false}
                aria-label={`${checked ? "Checked" : "Unchecked"} ${interaction} role`}
                defaultValue={checked ? "role" : undefined}
                disabled={interaction === "disabled"}
              >
                <ChoiceTile
                  value="role"
                  description="Choose a role that fits your goals."
                  data-demo={interaction === "rest" || interaction === "disabled" ? undefined : interaction}
                >
                  {interaction.charAt(0).toUpperCase() + interaction.slice(1)}
                </ChoiceTile>
              </ChoiceTileGroup>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const disabled = canvas.getAllByRole("radio", { name: "Disabled" })[1]!;
    await userEvent.click(disabled);
    await waitFor(() => {
      expect(disabled).toBeDisabled();
      expect(disabled).toHaveAttribute("aria-checked", "true");
      expect(disabled.querySelector('[data-slot="choice-tile-check"]')).toBeVisible();
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};
