import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator.tsx";

const meta = { title: "Display/Separator", component: Separator } satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4 text-body">
      <p>Profile</p>
      <Separator {...args} />
      <p>Preferences</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-20 items-center gap-4 text-body">
      <span>Profile</span>
      <Separator {...args} />
      <span>Preferences</span>
    </div>
  ),
};
