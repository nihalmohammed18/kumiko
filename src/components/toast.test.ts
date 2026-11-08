import type { ToastManagerPromiseOptions } from "@base-ui/react/toast";
import { createElement } from "react";
import { expect, it, vi } from "vitest";
import { Illustration } from "./illustration.tsx";
import { toast } from "./toast.tsx";

const manager = vi.hoisted(() => ({
  add: vi.fn((options: { id?: string }) => options.id ?? "toast-id"),
  close: vi.fn(),
  update: vi.fn(),
  promise: vi.fn((value: Promise<unknown>, _options: ToastManagerPromiseOptions<unknown, object>) => value),
}));

vi.mock("@base-ui/react/toast", () => ({ Toast: { createToastManager: () => manager } }));

it("raises achievements politely, with a trophy by default and optional replacement art", () => {
  expect(toast.achievement("Goal reached", { id: "goal", timeout: 0 })).toBe("goal");
  expect(manager.add.mock.calls.at(-1)?.[0]).toEqual({
    id: "goal",
    timeout: 0,
    title: "Goal reached",
    type: "achievement",
    priority: "low",
    data: { art: createElement(Illustration, { name: "trophy", size: 40 }) },
  });
  const art = createElement(Illustration, { name: "star" });
  toast.achievement("A new milestone", { art });
  expect(manager.add.mock.calls.at(-1)?.[0]).toMatchObject({ data: { art } });
});

it("turns promise messages into titles, preserves result options and makes failures urgent", async () => {
  const operation = Promise.resolve("Report ready");
  const result = toast.promise(operation, {
    loading: "Preparing report…",
    success: (title) => ({ title, timeout: 0 }),
    error: (error) => error.message,
  });
  const options = manager.promise.mock.calls.at(-1)![1];
  expect(options.loading).toEqual({ title: "Preparing report…", priority: "low" });
  if (typeof options.success !== "function" || typeof options.error !== "function")
    throw new Error("Promise results must be evaluated when the operation settles");
  expect(options.success("Report ready")).toEqual({ title: "Report ready", timeout: 0, priority: "low" });
  expect(options.error(new Error("Report failed"))).toEqual({ title: "Report failed", priority: "high" });
  await expect(result).resolves.toBe("Report ready");
});

it("preserves omitted actions on update and lets callers explicitly remove them", () => {
  toast.update("undo", { title: "Still available" });
  expect(manager.update.mock.calls.at(-1)).toEqual(["undo", { title: "Still available" }]);
  toast.update("undo", { action: undefined });
  expect(manager.update.mock.calls.at(-1)).toEqual(["undo", { actionProps: undefined }]);
});
