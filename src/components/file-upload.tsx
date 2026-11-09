"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { Field as BaseField } from "@base-ui/react/field";
import { type ComponentProps, useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { FileIcon, UploadIcon, XIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { IconButton } from "./button.tsx";
import { buttonStyles } from "./button-styles.ts";
import { useKumikoField } from "./field.tsx";

/** A file refused by FileUpload and the constraint it failed.
 * Use when: reporting rejected files. Avoid when: representing accepted files; use File.
 */
export interface FileUploadRejection {
  file: File;
  reason: "type" | "size" | "count";
}

/** Props for a native file picker, its file list and acceptance limits.
 * Use when: typing FileUpload. Avoid when: uploading bytes to a server; submit the files separately.
 */
export interface FileUploadProps extends Omit<ComponentProps<"div">, "children" | "defaultValue"> {
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  onReject?: (rejections: FileUploadRejection[]) => void;
}

/** Matches a file against native accept extensions, exact MIME types and type wildcards.
 * Use when: checking picker or dropped files. Avoid when: trusting the file's contents; validate them on the server.
 */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  const rules =
    accept
      ?.split(",")
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean) ?? [];
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    rules.length === 0 ||
    rules.some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    )
  );
}

/** Applies type, byte-size and count limits, preserving existing files when every candidate is rejected.
 * Use when: adding files to FileUpload. Avoid when: validating externally supplied file lists.
 */
export function validateFiles(
  candidates: File[],
  current: File[] = [],
  {
    accept,
    multiple = false,
    maxSize,
    maxFiles,
  }: Pick<FileUploadProps, "accept" | "multiple" | "maxSize" | "maxFiles"> = {},
) {
  const accepted: File[] = [];
  const rejections: FileUploadRejection[] = [];
  const limit = Math.max(0, multiple ? (maxFiles ?? Infinity) : Math.min(1, maxFiles ?? 1));
  for (const file of candidates) {
    const reason = !fileMatchesAccept(file, accept)
      ? "type"
      : maxSize !== undefined && file.size > maxSize
        ? "size"
        : (multiple ? current.length : 0) + accepted.length >= limit
          ? "count"
          : undefined;
    if (reason) rejections.push({ file, reason });
    else accepted.push(file);
  }
  return { files: accepted.length ? (multiple ? [...current, ...accepted] : accepted) : current, accepted, rejections };
}

function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

function FileUploadName({ name, id }: { name: string; id: string }) {
  const [expanded, setExpanded] = useState(false);
  const dot = name.lastIndexOf(".");
  const hasExtension = dot > 0 && dot < name.length - 1;
  const base = hasExtension ? name.slice(0, dot) : name;
  const extension = hasExtension ? name.slice(dot) : "";
  return (
    <BaseButton
      data-slot="file-upload-name"
      id={id}
      type="button"
      aria-label={name}
      aria-expanded={expanded}
      className={buttonStyles({
        tone: "ghost",
        size: "sm",
        className: "w-full min-w-0 justify-start p-0 text-start text-body font-normal normal-case tracking-normal",
      })}
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? (
        <bdi data-slot="file-upload-full-name" className="min-w-0 wrap-anywhere">
          {name}
        </bdi>
      ) : (
        <span dir="auto" className="flex min-w-0 items-end">
          <bdi data-slot="file-upload-name-base" className="min-w-0 line-clamp-2 wrap-anywhere">
            {base}
          </bdi>
          {extension && (
            <bdi data-slot="file-upload-name-extension" dir="ltr" className="max-w-1/2 shrink-0 wrap-anywhere">
              {extension}
            </bdi>
          )}
        </span>
      )}
    </BaseButton>
  );
}

/** A native file picker and dropzone with removable files, expandable names, localized feedback and Field validation.
 * Use when: choosing a resume or several attachments; submit the listed files with FormData.
 * Avoid when: starting a server upload automatically; handle that separately with onFilesChange.
 *
 * @example
 * <Field name="resume">
 *   <FieldLabel>Resume</FieldLabel>
 *   <FileUpload accept=".pdf" maxSize={5_000_000} required />
 *   <FieldDescription>Upload a PDF up to 5 MB.</FieldDescription>
 *   <FieldError />
 * </Field>
 */
export function FileUpload({
  files: filesProp,
  defaultFiles = [],
  onFilesChange,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled: disabledProp = false,
  required,
  name,
  onReject,
  className,
  ...props
}: FileUploadProps) {
  const { labels, locale, announce } = useKumiko();
  const field = useKumikoField();
  const inputId = useId();
  const [uncontrolledFiles, setFiles] = useState(defaultFiles);
  const files = filesProp ?? uncontrolledFiles;
  const previousFiles = useRef(files);
  const inputRef = useRef<HTMLInputElement>(null);
  const syncingInput = useRef(false);
  const nativeFiles = useRef<File[] | null>(null);
  const initializeInput = useCallback((input: HTMLInputElement | null) => {
    inputRef.current = input;
    syncInputFiles(input, previousFiles.current);
  }, []);
  const removeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusIndex = useRef<number | null>(null);
  const fileKeys = useRef(new WeakMap<File, number>());
  const nextKey = useRef(0);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<FileUploadRejection["reason"] | null>(null);
  const disabled = Boolean(field.disabled || disabledProp);
  const rejectionId = `${inputId}-rejection`;
  const chooseLabel = formatLabel(multiple ? labels.chooseFiles : labels.chooseFile, locale);
  const limit = Math.max(0, multiple ? (maxFiles ?? Infinity) : Math.min(1, maxFiles ?? 1));
  const rejectionLabel =
    rejection === "type"
      ? labels.fileTypeRejected
      : rejection === "size"
        ? labels.fileSizeRejected
        : labels.fileCountRejected;
  const occurrences = new Map<File, number>();

  useLayoutEffect(() => {
    syncInputFiles(inputRef.current, files);
    if (previousFiles.current !== files) {
      previousFiles.current = files;
      // Drops, removals and controlled updates notify Field through the native input.
      if (nativeFiles.current !== files) {
        syncingInput.current = true;
        inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
        syncingInput.current = false;
      }
      nativeFiles.current = null;
      if (focusIndex.current !== null) {
        (removeRefs.current[Math.min(focusIndex.current, files.length - 1)] ?? inputRef.current)?.focus();
        focusIndex.current = null;
      }
    }
  }, [files]);
  useLayoutEffect(() => {
    if (disabled) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }, [disabled]);

  function changeFiles(next: File[]) {
    if (filesProp === undefined) setFiles(next);
    syncInputFiles(inputRef.current, filesProp ?? next);
    onFilesChange?.(next);
  }
  function addFiles(candidates: File[]) {
    if (disabled) return files;
    const result = validateFiles(candidates, files, { accept, multiple, maxSize, maxFiles });
    if (result.accepted.length) {
      changeFiles(result.files);
      setRejection(null);
    } else {
      // Nothing was added, but a rejected pick left the browser's own selection in the input. Once this event is
      // over (Field validates during it), put the listed files back and let Field validate those.
      queueMicrotask(() => {
        syncInputFiles(inputRef.current, files);
        syncingInput.current = true;
        inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
        syncingInput.current = false;
      });
    }
    if (result.rejections.length) {
      setRejection(result.rejections[0]!.reason);
      onReject?.(result.rejections);
    }
    const messages = result.accepted.length ? [formatLabel(labels.filesAdded, locale, result.accepted.length)] : [];
    for (const { file, reason } of result.rejections) {
      const reasonLabel =
        reason === "type"
          ? labels.fileTypeRejected
          : reason === "size"
            ? labels.fileSizeRejected
            : labels.fileCountRejected;
      messages.push(
        formatLabel(labels.fileRejected, locale, undefined, {
          name: file.name,
          reason: formatLabel(reasonLabel, locale, reason === "count" ? limit : undefined),
        }),
      );
    }
    if (messages.length) announce(messages.join(". "));
    return result.files;
  }
  function clearDragging() {
    dragDepth.current = 0;
    setDragging(false);
  }

  return (
    <div
      {...props}
      data-slot="file-upload"
      data-disabled={disabled ? "" : undefined}
      data-invalid={field.invalid ? "" : undefined}
      className={cn("grid min-w-0 gap-3", className)}
    >
      <label
        htmlFor={inputId}
        data-slot="file-upload-dropzone"
        data-disabled={disabled ? "" : undefined}
        data-dragging={dragging && !disabled ? "" : undefined}
        className={cn(
          "relative grid min-w-0 cursor-pointer place-items-center gap-3 rounded-card border-2 border-dashed border-control-line bg-field p-6 text-center text-ink",
          "hover:not-data-disabled:not-disabled:border-ink-muted active:not-data-disabled:not-disabled:border-ink",
          "focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-offset-2 focus-visible:outline-focus",
          "has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-(length:--kumiko-ring-width) has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
          "has-[[data-invalid]]:not-data-disabled:border-danger has-[[aria-invalid=true]]:not-data-disabled:border-danger",
          "data-dragging:not-data-disabled:border-solid data-dragging:not-data-disabled:border-focus data-dragging:not-data-disabled:bg-brand-tint",
          "data-disabled:cursor-not-allowed data-disabled:border-disabled-line data-disabled:bg-disabled-fill data-disabled:text-disabled-text",
        )}
        onDragEnter={(event) => {
          if (disabled || !event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = disabled ? "none" : "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          clearDragging();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        onDragEnd={clearDragging}
      >
        {/* Let both native labels name the control together. */}
        <BaseField.Control
          ref={initializeInput}
          id={inputId}
          render={<input type="file" />}
          data-slot="file-upload-input"
          name={name}
          accept={accept}
          multiple={multiple}
          required={required}
          disabled={disabled}
          aria-labelledby={undefined}
          aria-describedby={rejection ? rejectionId : undefined}
          className="sr-only cursor-pointer data-disabled:cursor-not-allowed"
          onChange={(event) => {
            if (syncingInput.current) return;
            const next = addFiles(Array.from(event.currentTarget.files ?? []));
            if (filesProp === undefined) nativeFiles.current = next;
          }}
        />
        <UploadIcon className="size-6" />
        <span aria-hidden className="min-w-0 wrap-anywhere text-body">
          {formatLabel(dragging && !disabled ? labels.dropNow : multiple ? labels.dropFiles : labels.dropFile, locale)}
        </span>
        <span
          data-slot="file-upload-choose"
          data-disabled={disabled ? "" : undefined}
          className={buttonStyles({ tone: "secondary", size: "sm", className: "max-w-full" })}
        >
          {chooseLabel}
        </span>
      </label>
      {rejection && (
        <p id={rejectionId} className="min-w-0 wrap-anywhere text-body-sm text-danger">
          {formatLabel(rejectionLabel, locale, rejection === "count" ? limit : undefined)}
        </p>
      )}
      {files.length > 0 && (
        <ul data-slot="file-upload-list" className="grid min-w-0 gap-2">
          {files.map((file, index) => {
            if (!fileKeys.current.has(file)) fileKeys.current.set(file, nextKey.current++);
            const occurrence = occurrences.get(file) ?? 0;
            occurrences.set(file, occurrence + 1);
            const fileId = `${inputId}-file-${fileKeys.current.get(file)}-${occurrence}`;
            const megabytes = file.size >= 1024 * 1024;
            return (
              <li key={fileId} className="flex min-w-0 items-start gap-3">
                <FileIcon className="mt-2 size-5 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1 text-start">
                  <FileUploadName name={file.name} id={fileId} />
                  <p className="min-w-0 wrap-anywhere text-body-sm text-ink-muted tabular-nums">
                    {new Intl.NumberFormat(locale, {
                      style: "unit",
                      unit: megabytes ? "megabyte" : "kilobyte",
                      unitDisplay: "short",
                      maximumFractionDigits: 1,
                    }).format(file.size / (megabytes ? 1024 * 1024 : 1024))}
                  </p>
                </div>
                <IconButton
                  ref={(button) => {
                    removeRefs.current[index] = button;
                  }}
                  type="button"
                  tone="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label={`${formatLabel(labels.remove, locale)} ${file.name}`}
                  onClick={() => {
                    if (disabled) return;
                    focusIndex.current = index;
                    changeFiles(files.filter((_, position) => position !== index));
                    setRejection(null);
                    announce(formatLabel(labels.fileRemoved, locale));
                  }}
                >
                  <XIcon />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
