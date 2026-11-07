import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Skeleton } from "./skeleton.tsx";

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardPlaceholder: Story = {
  name: "Card placeholder",
  render: () => (
    <section
      aria-label="Loading job"
      aria-busy="true"
      className="grid w-full max-w-sm gap-4 rounded-card border-2 border-line bg-surface p-4"
    >
      <Skeleton shape="circle" className="size-12" />
      <div className="grid gap-2">
        <Skeleton shape="text" className="w-3/4" />
        <Skeleton shape="text" className="w-1/2" />
      </div>
      <Skeleton className="h-24 w-full" />
    </section>
  ),
  play: async ({ canvas }) => {
    const container = canvas.getByRole("region", { name: "Loading job" });
    const placeholders = container.querySelectorAll("[data-slot=skeleton]");
    await waitFor(() => {
      expect(container).toHaveAttribute("aria-busy", "true");
      expect(placeholders).toHaveLength(4);
      for (const placeholder of placeholders) {
        expect(placeholder).toHaveAttribute("aria-hidden", "true");
      }
    });
  },
};

export const States: Story = { render: CardPlaceholder.render };
