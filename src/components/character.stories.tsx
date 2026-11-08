import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Character } from "./character.tsx";
import { EmptyState } from "./empty-state.tsx";

const names = ["pip", "mori", "tuck"] as const;
const poses = ["idle", "waving", "cheering", "thinking", "sleepy", "oops"] as const;
const labels = { pip: "Pip", mori: "Mori", tuck: "Tuck" };

const meta = {
  title: "Delight/Character",
  component: Character,
  args: { name: "pip", pose: "idle" },
  argTypes: {
    name: { control: "inline-radio", options: names },
    pose: { control: "select", options: poses },
  },
} satisfies Meta<typeof Character>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const Waving: Story = { args: { pose: "waving" } };
export const Cheering: Story = { args: { pose: "cheering" } };
export const Thinking: Story = { args: { pose: "thinking" } };
export const Sleepy: Story = {
  args: { pose: "sleepy" },
  play: async ({ canvasElement, globals }) => {
    const character = canvasElement.querySelector('[data-slot="character"]')!;
    const marks = character.querySelector('[data-slot="character-sleep-marks"]')!;
    await waitFor(() => {
      const body = character.getBoundingClientRect();
      const trail = marks.getBoundingClientRect();
      if (globals.dir === "rtl") expect(trail.right).toBeLessThan(body.x + body.width / 2);
      else expect(trail.left).toBeGreaterThan(body.x + body.width / 2);
    });
  },
};
export const Oops: Story = { args: { pose: "oops" } };

export const AllPoses: Story = {
  parameters: { vrt: "page" },
  render: () => (
    <div className="@container w-full">
      <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3 @4xl:grid-cols-6">
        {names.flatMap((name) =>
          poses.map((pose) => (
            <figure key={`${name}-${pose}`} className="grid min-w-0 justify-items-center gap-2">
              <Character name={name} pose={pose} />
              <figcaption className="wrap-anywhere text-label text-ink-muted">
                {labels[name]} · {pose}
              </figcaption>
            </figure>
          )),
        )}
      </div>
    </div>
  ),
};

export const States: Story = { ...AllPoses };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {[48, 96, 180].map((size) => (
        <figure key={size} className="grid min-w-0 justify-items-center gap-2">
          <Character {...args} size={size} />
          <figcaption className="text-label text-ink-muted">{size}px</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const InAnEmptyState: Story = {
  render: () => (
    <EmptyState
      art={<Character name="mori" pose="thinking" />}
      title="No matching jobs"
      description="Try another search or adjust your filters to find your next opportunity."
      className="max-w-lg"
    />
  ),
};

export const AccessibleName: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Character {...args} pose="waving" title="Pip waving hello" />
      <Character {...args} title={undefined} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvas.getByRole("img", { name: "Pip waving hello" })).toBeVisible();
      expect(canvas.getAllByRole("img")).toHaveLength(1);
      expect(canvasElement.querySelector('[data-slot="character"][aria-hidden="true"]')).toBeInTheDocument();
    });
  },
};
