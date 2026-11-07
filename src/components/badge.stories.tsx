import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";
import { expect, waitFor } from "storybook/test";
import { Badge } from "./badge.tsx";

const tones = ["neutral", "brand", "sun", "leaf", "coral", "tide", "success", "warning", "danger", "info"] as const;

const meta = {
  title: "Display/Badge",
  component: Badge,
  argTypes: { tone: { control: "select", options: tones } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <div className="grid gap-3">
      {tones.map((tone) => (
        <div key={tone} className="flex flex-wrap items-center gap-2">
          <Badge tone={tone}>{tone}</Badge>
          <Badge tone={tone}>
            <Sparkles aria-hidden />
            {tone}
          </Badge>
        </div>
      ))}
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div lang="ar" dir="rtl" className="flex flex-wrap gap-3">
      <Badge tone="leaf">عن بُعد</Badge>
      <Badge tone="brand">
        <Sparkles aria-hidden />
        جديد
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => {
      const style = getComputedStyle(canvas.getByText("عن بُعد"));
      expect(style.textTransform).toBe("none");
      expect(style.letterSpacing).toMatch(/^(?:normal|0px)$/);
    });
  },
};
