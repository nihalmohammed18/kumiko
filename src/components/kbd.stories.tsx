import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./kbd.tsx";

const meta = { title: "Display/Kbd", component: Kbd } satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <p className="text-body">
      <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
    </p>
  ),
};
