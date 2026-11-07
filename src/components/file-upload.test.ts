import { expect, it } from "vitest";
import { fileMatchesAccept, validateFiles } from "./file-upload.tsx";

const pdf = (name = "resume.pdf", size = 1) => new File(["x".repeat(size)], name, { type: "application/pdf" });

it("accepts case-insensitive extensions and exact MIME types", () => {
  const file = pdf("RESUME.PDF");
  expect(fileMatchesAccept(file, " .csv, .pdf ")).toBe(true);
  expect(fileMatchesAccept(file, "application/pdf")).toBe(true);
});

it("matches a MIME wildcard only within its type", () => {
  expect(fileMatchesAccept(new File(["x"], "photo.png", { type: "image/png" }), "image/*")).toBe(true);
  expect(fileMatchesAccept(pdf(), "image/*")).toBe(false);
});

it("rejects an unaccepted type without replacing the current file", () => {
  const current = [pdf()];
  const file = new File(["x"], "setup.exe", { type: "application/octet-stream" });
  expect(validateFiles([file], current, { accept: ".pdf" })).toEqual({
    files: current,
    accepted: [],
    rejections: [{ file, reason: "type" }],
  });
});

it("accepts the size limit and rejects a file above it", () => {
  const accepted = pdf("small.pdf", 5);
  const rejected = pdf("large.pdf", 6);
  expect(validateFiles([accepted, rejected], [], { multiple: true, maxSize: 5 })).toEqual({
    files: [accepted],
    accepted: [accepted],
    rejections: [{ file: rejected, reason: "size" }],
  });
});

it("counts existing files toward the multiple-file limit", () => {
  const first = pdf("first.pdf");
  const second = pdf("second.pdf");
  const third = pdf("third.pdf");
  expect(validateFiles([second, third], [first], { multiple: true, maxFiles: 2 })).toEqual({
    files: [first, second],
    accepted: [second],
    rejections: [{ file: third, reason: "count" }],
  });
});

it("replaces the previous file in single mode and rejects extra files", () => {
  const replacement = pdf("replacement.pdf");
  const extra = pdf("extra.pdf");
  expect(validateFiles([replacement, extra], [pdf()])).toEqual({
    files: [replacement],
    accepted: [replacement],
    rejections: [{ file: extra, reason: "count" }],
  });
});
