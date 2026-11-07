import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Field, FieldDescription } from "./field.tsx";
import { Slider, SliderValue } from "./slider.tsx";

const meta = {
  title: "Forms/Slider",
  component: Slider,
  subcomponents: { SliderValue },
  args: { label: "Volume", defaultValue: 40, onValueChange: fn(), onValueCommitted: fn() },
  render: (args) => (
    <Field name="volume" disabled={args.disabled} className="w-full max-w-sm">
      <Slider {...args} />
      <FieldDescription>Adjust the playback volume.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, globals, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await waitFor(() => {
      expect(thumb).toHaveFocus();
      expect(thumb).toHaveAccessibleDescription("Adjust the playback volume.");
    });
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(thumb).toHaveValue("41");
      expect(args.onValueChange).toHaveBeenCalledWith(41, expect.objectContaining({ reason: "keyboard" }));
      expect(args.onValueCommitted).toHaveBeenCalledWith(41, expect.objectContaining({ reason: "keyboard" }));
    });
  },
};

export const Range: Story = {
  args: {
    label: "Price range",
    defaultValue: [25, 75],
    thumbProps: { getAriaLabel: (index) => (index === 0 ? "Minimum price" : "Maximum price") },
  },
  render: (args) => (
    <Field name="price" className="w-full max-w-sm">
      <Slider {...args} />
      <FieldDescription>Only show items in this price range.</FieldDescription>
    </Field>
  ),
  play: async ({ canvas, globals, userEvent }) => {
    const minimum = canvas.getByRole("slider", { name: "Minimum price" });
    const maximum = canvas.getByRole("slider", { name: "Maximum price" });
    await userEvent.tab();
    await waitFor(() => expect(minimum).toHaveFocus());
    await userEvent.tab();
    await waitFor(() => expect(maximum).toHaveFocus());
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() => {
      expect(minimum).toHaveValue("25");
      expect(maximum).toHaveValue("76");
    });
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const thumb = canvas.getByRole("slider", { name: "Volume" });
    await waitFor(() => expect(thumb).toBeDisabled());
    await userEvent.click(canvasElement.querySelector<HTMLElement>("[data-slot=slider-thumb]")!);
    await userEvent.tab();
    await waitFor(() => {
      expect(thumb).not.toHaveFocus();
      expect(thumb).toHaveValue("40");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

export const Dragging: Story = {
  args: {
    defaultValue: [40, 75],
    thumbProps: { getAriaLabel: (index) => (index === 0 ? "Minimum volume" : "Maximum volume") },
  },
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const [thumb, other] = canvasElement.querySelectorAll<HTMLElement>("[data-slot=slider-thumb]");
    if (!thumb || !other) throw new Error("The range needs two thumbs.");
    const box = thumb.getBoundingClientRect();
    const start = { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
    const end = { ...start, clientX: start.clientX + (globals.dir === "rtl" ? -32 : 32) };
    await userEvent.pointer({ target: thumb, keys: "[MouseLeft>]", coords: start });
    await userEvent.pointer({ target: thumb, coords: end });
    await waitFor(() => {
      expect(thumb).toHaveAttribute("data-dragging");
      expect(other).not.toHaveAttribute("data-dragging");
    });
    await userEvent.pointer({ target: thumb, keys: "[/MouseLeft]", coords: end });
    await waitFor(() => {
      expect(thumb).not.toHaveAttribute("data-dragging");
      expect(
        (canvas.getByRole("slider", { name: "Minimum volume" }) as HTMLInputElement).valueAsNumber,
      ).toBeGreaterThan(40);
      expect(canvas.getByRole("slider", { name: "Maximum volume" })).toHaveValue("75");
      expect(args.onValueCommitted).toHaveBeenCalledWith(
        [expect.any(Number), 75],
        expect.objectContaining({ reason: "drag" }),
      );
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid gap-6 @sm:grid-cols-2">
        {(["Rest", "Hover", "Focus", "Active", "Disabled"] as const).map((state) => (
          <Slider
            key={state}
            {...args}
            label={state}
            disabled={state === "Disabled"}
            thumbProps={{
              "aria-label": state,
              ...{ "data-demo": ["Hover", "Focus", "Active"].includes(state) ? state.toLowerCase() : undefined },
            }}
          />
        ))}
      </div>
    </div>
  ),
};
