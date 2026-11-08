import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Streak } from "./streak.tsx";

const meta = {
  title: "Delight/Streak",
  component: Streak,
  args: {
    count: 12,
    today: "2026-11-06",
    done: ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"],
    className: "w-full max-w-sm",
  },
} satisfies Meta<typeof Streak>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await waitFor(() => {
      expect(canvas.getAllByRole("listitem")).toHaveLength(7);
      expect(canvas.getAllByRole("listitem").filter((day) => day.hasAttribute("data-done"))).toHaveLength(4);
      expect(canvas.getByRole("list").querySelector('[aria-current="date"]')).toHaveAttribute("data-date", args.today);
    });
  },
};

export const WeekStart: Story = {
  name: "Week start",
  play: async ({ canvas, globals }) => {
    const locale = new Intl.Locale(globals.dir === "rtl" ? "ar-u-nu-arab" : "en") as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay ?? 1;
    await waitFor(() => {
      const date = canvas.getAllByRole("listitem")[0]!.getAttribute("data-date");
      expect(new Date(`${date}T00:00:00Z`).getUTCDay()).toBe(firstDay % 7);
    });
  },
};

export const Increment: Story = {
  args: { increment: true },
  play: async ({ canvasElement, globals }) => {
    const chip = canvasElement.querySelector('[data-slot="streak-increment"]');
    const one = new Intl.NumberFormat(globals.dir === "rtl" ? "ar-u-nu-arab" : "en").format(1);
    await waitFor(() => {
      expect(chip).toBeVisible();
      expect(chip).toHaveTextContent(`+${one}`);
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="flex min-w-0 flex-wrap items-start gap-6">
      <Streak {...args} count={0} done={[]} />
      <Streak {...args} count={1} done={[args.today]} />
      <Streak {...args} />
      <Streak {...args} increment />
    </div>
  ),
};
