"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Button } from "./components/button.tsx";
import { useKumiko } from "./provider.tsx";

function AnnounceButton() {
  const { announce } = useKumiko();
  return <Button onClick={() => announce("Saved")}>Save</Button>;
}

// No screenshots: the button is covered by Button's stories; this story tests behaviour.
const meta = { title: "Foundation/Provider", parameters: { vrt: false } } satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Announces a completed action through the provider's polite live region.
 * Use when: verifying announcements. Avoid when: testing a button's variants or states.
 */
export const Announce: Story = {
  render: () => <AnnounceButton />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).getByRole("status")).toHaveTextContent("Saved"),
    );
  },
};
