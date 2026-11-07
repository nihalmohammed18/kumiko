import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { Field, FieldDescription, FieldLabel } from "./field.tsx";
import { SearchField } from "./search-field.tsx";

const meta = {
  title: "Forms/SearchField",
  component: SearchField,
  render: (args) => (
    <Field name="query" className="w-full max-w-sm">
      <FieldLabel>Search jobs</FieldLabel>
      <SearchField {...args} placeholder="Title or skill" />
      <FieldDescription>Find jobs by title or skill.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const search = canvas.getByRole("searchbox", { name: "Search jobs" });
    await userEvent.type(search, "React designer");
    await waitFor(() => expect(search).toHaveValue("React designer"));
  },
};
