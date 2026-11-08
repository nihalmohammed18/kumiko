import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { EmptyState } from "./empty-state.tsx";
import { Illustration } from "./illustration.tsx";

const names = [
  "envelope",
  "calendar",
  "sealed-envelope",
  "waiting-calendar",
  "dates",
  "lantern",
  "arch",
  "crescent",
  "star",
  "trophy",
  "flame",
] as const;

const meta = {
  title: "Delight/Illustration",
  component: Illustration,
  args: { name: "envelope" },
  argTypes: { name: { control: "select", options: names } },
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Envelope: Story = {};
export const Calendar: Story = { args: { name: "calendar" } };
export const SealedEnvelope: Story = { args: { name: "sealed-envelope" } };
export const WaitingCalendar: Story = { args: { name: "waiting-calendar" } };
export const Dates: Story = { args: { name: "dates" } };
export const Lantern: Story = { args: { name: "lantern" } };
export const Arch: Story = { args: { name: "arch" } };
export const Crescent: Story = { args: { name: "crescent" } };
export const Star: Story = { args: { name: "star" } };
export const Trophy: Story = { args: { name: "trophy" } };
export const Flame: Story = { args: { name: "flame" } };

export const AllObjects: Story = {
  parameters: { vrt: "page" },
  render: () => (
    <div className="@container w-full">
      <div className="grid gap-4 @sm:grid-cols-2 @lg:grid-cols-3 @4xl:grid-cols-6">
        {names.map((name) => (
          <figure key={name} className="grid min-w-0 justify-items-center gap-2">
            <Illustration name={name} />
            <figcaption className="wrap-anywhere text-label text-ink-muted">{name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  ),
};

export const States: Story = { ...AllObjects };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {[48, 96, 180].map((size) => (
        <figure key={size} className="grid min-w-0 justify-items-center gap-2">
          <Illustration {...args} size={size} />
          <figcaption className="text-label text-ink-muted">{size}px</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const ObjectsOnly: Story = {
  render: () => (
    <EmptyState
      art={<Illustration name="sealed-envelope" />}
      title="No applications yet"
      description="Save an opportunity to start keeping track of your applications."
      className="max-w-lg"
    />
  ),
};

export const AccessibleName: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Illustration {...args} name="sealed-envelope" title="A sealed envelope" />
      <Illustration {...args} title={undefined} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvas.getByRole("img", { name: "A sealed envelope" })).toBeVisible();
      expect(canvas.getAllByRole("img")).toHaveLength(1);
      expect(canvasElement.querySelector('[data-slot="illustration"][aria-hidden="true"]')).toBeInTheDocument();
    });
  },
};
