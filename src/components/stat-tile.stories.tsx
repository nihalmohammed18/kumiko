import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageSquare, Send, UserRound } from "lucide-react";
import { CountUp } from "./count-up.tsx";
import { StatTile } from "./stat-tile.tsx";

const meta = {
  title: "Delight/StatTile",
  component: StatTile,
  args: { label: "Applications", value: "12", icon: <Send />, caption: "This week" },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  render: (args) => (
    <div className="grid w-full max-w-3xl grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">
      <StatTile {...args} value={<CountUp value={12} />} />
      <StatTile
        label="Interviews"
        value={<CountUp value={3} />}
        icon={<MessageSquare />}
        tone="leaf"
        caption="This week"
      />
      <StatTile
        label="Profile"
        value={<CountUp value={0.8} format={{ style: "percent" }} />}
        icon={<UserRound />}
        tone="sun"
        caption="Complete"
      />
    </div>
  ),
};

export const LongText: Story = {
  name: "Long text",
  args: {
    className: "w-full max-w-80",
    label: "Applications submitted to teams building thoughtful products around the world",
    value: "12,345,678,901,234,567",
    caption: "Every application counts, including opportunities with longer translated names and descriptions.",
  },
};

export const States: Story = {
  render: (args) => (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4">
      {(["brand", "sun", "leaf", "coral", "tide"] as const).map((tone) => (
        <StatTile key={tone} {...args} tone={tone} label={`${tone} statistic`} />
      ))}
      <StatTile {...args} label="Without an icon" icon={undefined} />
      <StatTile {...args} label="Without a caption" caption={undefined} />
    </div>
  ),
};
