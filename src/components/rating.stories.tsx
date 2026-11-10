import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { storySettings } from "../../.storybook/story-copy.ts";
import { formatLabel, labels } from "../labels.ts";
import { Rating } from "./rating.tsx";

const meta = {
  title: "Display/Rating",
  component: Rating,
  args: { value: 4.7, count: 12345 },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, globals }) => {
    const { language, locale } = storySettings(globals);
    const label = formatLabel(labels[language].ratingCount, locale, 12345, {
      value: new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(4.7),
      max: new Intl.NumberFormat(locale).format(5),
    });
    await waitFor(() => {
      expect(canvas.getByText(label)).toBeInTheDocument();
      const stars = canvasElement.querySelectorAll<HTMLElement>('[data-slot="rating-star"] > span');
      expect(Array.from(stars, (star) => star.style.inlineSize)).toEqual(["100%", "100%", "100%", "100%", "70%"]);
    });
  },
};

export const WithoutCount: Story = {
  name: "Without count",
  args: { value: 3.5, count: undefined },
};

export const Full: Story = {
  args: { value: 5, count: 1 },
};

export const NoRatings: Story = {
  name: "No ratings",
  args: { value: 0, count: 0 },
  play: async ({ canvas, globals }) => {
    const { language, locale } = storySettings(globals);
    await waitFor(() => expect(canvas.getByText(formatLabel(labels[language].noRatings, locale))).toBeVisible());
  },
};

export const States: Story = {
  render: () => (
    <div className="grid justify-items-start gap-3">
      <Rating value={0} count={0} />
      <Rating value={3.5} />
      <Rating value={4.7} count={12345} />
      <Rating value={5} count={1} />
    </div>
  ),
};
