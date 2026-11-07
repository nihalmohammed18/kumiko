import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, waitFor, within } from "storybook/test";
import { formatLabel, type LabelKey, labels } from "../labels.ts";
import { Button } from "./button.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { FileUpload, type FileUploadProps } from "./file-upload.tsx";
import { Form } from "./form.tsx";

/** A real drag event carrying the files. (fireEvent rebuilds dataTransfer and loses its "Files" type.) */
function drag(target: Element, type: "dragenter" | "dragleave" | "dragover" | "drop" | "dragend", files: DataTransfer) {
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: files }));
}

/** What the browser does when its file picker closes: the input's files change, then input and change fire.
 * (user-event's upload replaces the input's files with a read-only property, which no browser does.) */
async function pickFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const pdf = (name = "resume.pdf", size = 1024) => new File(["x".repeat(size)], name, { type: "application/pdf" });
const localeFor = (globals: Record<string, unknown>) => (globals.dir === "rtl" ? "ar-u-nu-arab" : "en");
const message = (globals: Record<string, unknown>, key: LabelKey, count?: number) =>
  formatLabel(labels[globals.dir === "rtl" ? "ar" : "en"][key], localeFor(globals), count);

const meta = {
  title: "Forms/FileUpload",
  component: FileUpload,
  args: { accept: ".pdf", maxSize: 5 * 1024 * 1024, onFilesChange: fn(), onReject: fn() },
  render: ({ disabled, ...args }) => (
    <Form className="w-full max-w-md" onSubmit={(event) => event.preventDefault()}>
      <Field name="resume" disabled={disabled}>
        <FieldLabel>Resume</FieldLabel>
        <FileUpload {...args} />
        <FieldDescription>PDF, up to 5 MB</FieldDescription>
        <FieldError match="valueMissing">Choose a resume.</FieldError>
      </Field>
      {args.required && (
        <Button type="submit" className="justify-self-start">
          Upload resume
        </Button>
      )}
    </Form>
  ),
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent, globals }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const form = canvasElement.querySelector("form")!;
    const dropzone = canvasElement.querySelector<HTMLLabelElement>('[data-slot="file-upload-dropzone"]')!;
    await userEvent.tab();
    await waitFor(() => {
      expect(input).toHaveFocus();
      expect(input).toHaveAccessibleName(`Resume ${message(globals, "chooseFile")}`);
      expect(input).toHaveAccessibleDescription("PDF, up to 5 MB");
      expect(input.labels).toHaveLength(2);
      expect(dropzone.control).toBe(input);
      expect(canvas.getByText("Resume")).toHaveAttribute("for", input.id);
      expect(getComputedStyle(dropzone).outlineStyle).toBe("solid");
      expect(parseFloat(getComputedStyle(dropzone).outlineWidth)).toBeGreaterThanOrEqual(2);
    });
    const pickerClick = fn();
    input.addEventListener("click", pickerClick);
    await userEvent.click(dropzone);
    await expect(pickerClick).toHaveBeenCalledOnce();
    input.removeEventListener("click", pickerClick);
    const file = pdf();
    await pickFiles(input, [file]);
    const size = new Intl.NumberFormat(localeFor(globals), {
      style: "unit",
      unit: "kilobyte",
      unitDisplay: "short",
      maximumFractionDigits: 1,
    }).format(1);
    await waitFor(() => {
      expect(canvas.getByText(file.name)).toBeVisible();
      expect(canvas.getByText(size)).toBeVisible();
      expect(
        new FormData(form)
          .getAll("resume")
          .map((entry) => (entry instanceof File ? [entry.name, entry.size, entry.type] : entry)),
      ).toEqual([[file.name, file.size, file.type]]);
      expect(screen.getByRole("status")).toHaveTextContent(message(globals, "filesAdded", 1));
    });
    const submitted = new FormData(form).get("resume") as File;
    await expect(submitted.text()).resolves.toBe(await file.text());
    const remove = canvas.getByRole("button", { name: message(globals, "remove") });
    await expect(remove).toHaveAccessibleDescription(file.name);
    input.focus();
    await userEvent.tab();
    await waitFor(() => expect(remove).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(canvas.queryByRole("list")).not.toBeInTheDocument();
      expect(input.files).toHaveLength(0);
      expect(input).toHaveFocus();
      expect(input.matches(":focus-visible")).toBe(true);
      expect(getComputedStyle(dropzone).outlineStyle).toBe("solid");
      expect(parseFloat(getComputedStyle(dropzone).outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(screen.getByRole("status")).toHaveTextContent(message(globals, "fileRemoved"));
    });
  },
};

export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvas, canvasElement, userEvent, globals }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await pickFiles(input, [pdf("first.pdf"), pdf("second.pdf")]);
    await waitFor(() => expect(canvas.getAllByRole("listitem")).toHaveLength(2));
    await expect(input).toHaveAccessibleName(`Resume ${message(globals, "chooseFiles")}`);
    input.focus();
    await userEvent.tab();
    const firstRemove = within(canvas.getAllByRole("listitem")[0]!).getByRole("button");
    await waitFor(() => expect(firstRemove).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(canvas.getAllByRole("listitem")).toHaveLength(1);
      expect(canvas.getByRole("button", { name: message(globals, "remove") })).toHaveFocus();
      expect(input.files?.[0]?.name).toBe("second.pdf");
    });
  },
};

export const Rejected: Story = {
  play: async ({ args, canvas, canvasElement, globals }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const onFilesChange = args.onFilesChange!;
    const calls = onFilesChange.mock.calls.length;
    const file = new File(["x"], "setup.exe", { type: "application/octet-stream" });
    await pickFiles(input, [file]);
    await waitFor(() => {
      expect(canvas.getByText(message(globals, "fileTypeRejected"))).toBeVisible();
      expect(canvas.queryByRole("list")).not.toBeInTheDocument();
      expect(onFilesChange.mock.calls).toHaveLength(calls);
      expect(args.onReject).toHaveBeenLastCalledWith([{ file, reason: "type" }]);
      expect(input.files).toHaveLength(0);
      expect(input).toHaveAccessibleDescription(/PDF, up to 5 MB/);
      expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(
        canvas.getByText(message(globals, "fileTypeRejected")).id,
      );
    });
  },
};

export const Dragging: Story = {
  play: async ({ canvas, canvasElement, globals }) => {
    const dropzone = canvasElement.querySelector('[data-slot="file-upload-dropzone"]')!;
    const transfer = new DataTransfer();
    transfer.items.add(pdf());
    drag(dropzone, "dragenter", transfer);
    await waitFor(() => {
      expect(dropzone).toHaveAttribute("data-dragging");
      expect(canvas.getByText(message(globals, "dropNow"))).toBeVisible();
    });
    const icon = dropzone.querySelector("svg")!;
    drag(icon, "dragenter", transfer);
    drag(icon, "dragleave", transfer);
    await waitFor(() => expect(dropzone).toHaveAttribute("data-dragging"));
    drag(dropzone, "drop", transfer);
    await waitFor(() => {
      expect(dropzone).not.toHaveAttribute("data-dragging");
      expect(canvas.getByText("resume.pdf")).toBeVisible();
      expect(canvasElement.querySelector('[data-slot="field"]')).toHaveAttribute("data-filled");
    });
    drag(dropzone, "dragenter", transfer);
    drag(dropzone, "dragend", transfer);
    await waitFor(() => expect(dropzone).not.toHaveAttribute("data-dragging"));
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const choose = canvasElement.querySelector('[data-slot="file-upload-choose"]')!;
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const dropzone = canvasElement.querySelector('[data-slot="file-upload-dropzone"]')!;
    const transfer = new DataTransfer();
    transfer.items.add(pdf());
    const onFilesChange = args.onFilesChange!;
    const calls = onFilesChange.mock.calls.length;
    const pickerClick = fn();
    input.addEventListener("click", pickerClick);
    await userEvent.click(dropzone);
    await userEvent.tab();
    drag(dropzone, "dragenter", transfer);
    drag(dropzone, "drop", transfer);
    await waitFor(() => {
      expect(choose).toHaveAttribute("data-disabled");
      expect(input).toBeDisabled();
      expect(input).not.toHaveFocus();
      expect(dropzone).toHaveAttribute("data-disabled");
      expect(dropzone).not.toHaveAttribute("data-dragging");
      expect(canvas.queryByRole("list")).not.toBeInTheDocument();
      expect(onFilesChange.mock.calls).toHaveLength(calls);
      expect(pickerClick).not.toHaveBeenCalled();
    });
    input.removeEventListener("click", pickerClick);
  },
};

export const Invalid: Story = {
  args: { required: true },
  play: async ({ canvas, canvasElement, userEvent, globals }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.click(canvas.getByRole("button", { name: "Upload resume" }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a resume.")).toBeVisible();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(/Choose a resume\./);
      expect(input).toHaveFocus();
    });
    await pickFiles(input, [pdf()]);
    await waitFor(() => expect(canvas.queryByText("Choose a resume.")).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: message(globals, "remove") }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a resume.")).toBeVisible();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveFocus();
    });
  },
};

function ControlledUpload(args: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  return meta.render({
    ...args,
    files,
    onFilesChange: (next) => {
      setFiles(next);
      args.onFilesChange?.(next);
    },
  });
}

export const Controlled: Story = {
  render: (args) => <ControlledUpload {...args} />,
  play: async ({ canvas, canvasElement, userEvent, globals }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await pickFiles(input, [pdf()]);
    await waitFor(() => {
      expect(canvas.getByText("resume.pdf")).toBeVisible();
      expect(input.files).toHaveLength(1);
    });
    await userEvent.click(canvas.getByRole("button", { name: message(globals, "remove") }));
    await waitFor(() => {
      expect(canvas.queryByRole("list")).not.toBeInTheDocument();
      expect(input.files).toHaveLength(0);
      expect(input).toHaveFocus();
    });
  },
};

export const States: Story = {
  render: (args) => (
    <div className="@container w-full max-w-3xl">
      <div className="grid gap-6 @lg:grid-cols-2">
        {["Rest", "Hover", "Press", "Focus", "Selected", "Dragging", "Disabled", "Invalid"].map((state) => (
          <Field
            key={state}
            data-state={state}
            disabled={state === "Disabled"}
            invalid={state === "Invalid" || undefined}
          >
            <FieldLabel>{state}</FieldLabel>
            <FileUpload
              {...args}
              defaultFiles={state === "Selected" ? [pdf(`${"very-long-resume-name-".repeat(8)}.pdf`)] : []}
            />
            {state === "Invalid" && <FieldError match>Choose a resume.</FieldError>}
          </Field>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [state, demo] of [
      ["Hover", "hover"],
      ["Press", "active"],
      ["Focus", "focus"],
    ]) {
      const dropzone = canvasElement.querySelector(`[data-state="${state}"] [data-slot="file-upload-dropzone"]`)!;
      dropzone.setAttribute("data-demo", demo!);
      if (state === "Focus") dropzone.querySelector("input")!.setAttribute("data-demo", "focus");
    }
    const selected = canvasElement.querySelector('[data-state="Selected"]')!;
    await waitFor(() => {
      expect(selected.querySelector<HTMLInputElement>("input")!.files).toHaveLength(1);
      expect(selected).toHaveAttribute("data-filled");
      expect(selected).not.toHaveAttribute("data-dirty");
    });
    const transfer = new DataTransfer();
    transfer.items.add(pdf());
    const dragging = canvasElement.querySelector('[data-state="Dragging"] [data-slot="file-upload-dropzone"]')!;
    drag(dragging, "dragenter", transfer);
    await waitFor(() => expect(dragging).toHaveAttribute("data-dragging"));
  },
};
