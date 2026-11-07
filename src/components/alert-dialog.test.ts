import { expectTypeOf, it } from "vitest";
import { AlertDialogPopup } from "./alert-dialog.tsx";

it("requires a visible cancellation action at the popup call site", () => {
  expectTypeOf(AlertDialogPopup).toBeCallableWith({ cancel: "Cancel" });
  // @ts-expect-error Every confirmation must supply its always-visible Cancel action.
  expectTypeOf(AlertDialogPopup).toBeCallableWith({});
});
