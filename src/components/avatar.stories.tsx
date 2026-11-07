import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { colors } from "../tokens.ts";
import { Avatar, AvatarGroup } from "./avatar.tsx";

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${colors.light["brand-tint"]}"/><circle cx="32" cy="24" r="12" fill="${colors.light["brand-text"]}"/><path d="M8 64v-4a24 24 0 0 1 48 0v4" fill="${colors.light["brand-text"]}"/></svg>`,
  );

const meta = {
  title: "Display/Avatar",
  component: Avatar,
  args: { name: "Ada Lovelace" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    accent: { control: "select", options: ["brand", "sun", "leaf", "coral", "tide"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: (args) => (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4">
        {(["sm", "md", "lg"] as const).map((size) => (
          <Avatar key={size} {...args} size={size} src={portrait} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {(["brand", "sun", "leaf", "coral", "tide"] as const).map((accent) => (
          <div key={accent} className="grid justify-items-center gap-2">
            <Avatar {...args} src={undefined} accent={accent} />
            <span className="text-label text-ink-muted">{accent}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-slot="avatar-image"]:not([aria-hidden])')).toHaveLength(3),
    );
  },
};

export const Fallback: Story = {
  args: { src: "data:image/png;base64,invalid" },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      expect(canvasElement.querySelector('[data-slot="avatar-image"]')).toHaveAttribute("data-error");
      const fallback = canvas.getByRole("img", { name: "Ada Lovelace" });
      expect(fallback).toHaveTextContent("AL");
      expect(fallback.querySelector("span")).toHaveAttribute("aria-hidden", "true");
    });
  },
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3} aria-label="Hiring team">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" accent="sun" />
      <Avatar name="Katherine Johnson" accent="leaf" />
      <Avatar name="Mary Jackson" accent="coral" />
      <Avatar name="Dorothy Vaughan" accent="tide" />
    </AvatarGroup>
  ),
  play: async ({ canvas, globals }) => {
    await waitFor(() => {
      expect(canvas.getByRole("group", { name: "Hiring team" })).toBeInTheDocument();
      expect(canvas.getAllByRole("img")).toHaveLength(4);
      const overflow = canvas.getByRole("img", { name: globals.dir === "rtl" ? "اثنان آخران" : "2 more" });
      expect(overflow).toHaveTextContent(globals.dir === "rtl" ? "+٢" : "+2");
      expect(canvas.queryByRole("img", { name: "Mary Jackson" })).not.toBeInTheDocument();
      expect(canvas.queryByRole("img", { name: "Dorothy Vaughan" })).not.toBeInTheDocument();
    });
  },
};
