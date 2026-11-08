import { expect, it } from "vitest";
import { paginationRange } from "./pagination.tsx";

it("keeps nearby pages together near the start", () => {
  expect(paginationRange({ page: 2, pageCount: 20 })).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
});

it("shows siblings and both boundaries in the middle", () => {
  expect(paginationRange({ page: 10, pageCount: 20 })).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
});

it("keeps nearby pages together near the end", () => {
  expect(paginationRange({ page: 19, pageCount: 20 })).toEqual([1, "ellipsis", 16, 17, 18, 19, 20]);
});

it("shows a short count without gaps", () => {
  expect(paginationRange({ page: 3, pageCount: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

it("drops boundaries without expanding the sibling window for narrow containers", () => {
  expect(paginationRange({ page: 2, pageCount: 20, boundaries: 0 })).toEqual([1, 2, 3, "ellipsis"]);
});

it("honours custom sibling and boundary counts", () => {
  expect(paginationRange({ page: 20, pageCount: 40, siblings: 2, boundaries: 2 })).toEqual([
    1,
    2,
    "ellipsis",
    18,
    19,
    20,
    21,
    22,
    "ellipsis",
    39,
    40,
  ]);
});

it("returns no pages for an empty count and clamps an out-of-range page", () => {
  expect(paginationRange({ page: 1, pageCount: 0 })).toEqual([]);
  expect(paginationRange({ page: 99, pageCount: 3, boundaries: 0 })).toEqual(["ellipsis", 2, 3]);
});
