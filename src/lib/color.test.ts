import { describe, expect, it } from "vitest";
import { getContrastTextColor } from "@/lib/color";

describe("getContrastTextColor", () => {
  it.each([
    ["#FFFFFF", "#18181B"],
    ["#000000", "#FFFFFF"],
    ["#F59E0B", "#18181B"],
    ["#4F46E5", "#FFFFFF"],
  ])("AC-7: %s -> %s", (hex, expected) => {
    expect(getContrastTextColor(hex)).toBe(expected);
  });
});
