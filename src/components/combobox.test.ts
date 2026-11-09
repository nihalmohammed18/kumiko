import { expectTypeOf, it } from "vitest";
import type { ComboboxProps } from "./combobox.tsx";

it("types multiple selection changes as arrays and single selection changes as nullable values", () => {
  type MultipleValue = Parameters<NonNullable<ComboboxProps<string, true>["onValueChange"]>>[0];
  type SingleValue = Parameters<NonNullable<ComboboxProps<string>["onValueChange"]>>[0];
  expectTypeOf<MultipleValue>().toEqualTypeOf<string[]>();
  expectTypeOf<SingleValue>().toEqualTypeOf<string | null>();
});
