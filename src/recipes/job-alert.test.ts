import { describe, expect, it } from "vitest";
import { z } from "zod";
import { jobAlertDefaults, jobAlertSchema } from "./job-alert.ts";

describe("job-alert schema", () => {
  it("reports all missing required choices, including frequency", () => {
    const result = jobAlertSchema.safeParse({ ...jobAlertDefaults, city: null, role: undefined, frequency: "" });
    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected an invalid job alert");
    expect(z.flattenError(result.error).fieldErrors).toEqual({
      email: ["Enter your email."],
      city: ["Choose a city."],
      role: ["Choose a kind of role."],
      frequency: ["Choose a frequency."],
      terms: ["Tick this to get alerts."],
    });
  });

  it("reports malformed email and a salary below the minimum", () => {
    const result = jobAlertSchema.safeParse({
      ...jobAlertDefaults,
      email: "not-an-email",
      city: "London",
      role: "full-time",
      minSalary: 5,
      terms: true,
    });
    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected an invalid job alert");
    expect(z.flattenError(result.error).fieldErrors).toEqual({
      email: ["Enter an email like name@example.com."],
      minSalary: ["Use at least 10."],
    });
  });

  it("preserves submission types and treats an empty salary as optional", () => {
    const values = {
      email: "nihal@example.com",
      city: "London",
      role: "full-time",
      minSalary: 25,
      frequency: "weekly",
      remote: false,
      terms: true,
    };
    expect(jobAlertSchema.parse(values)).toEqual(values);
    expect(jobAlertSchema.parse({ ...values, minSalary: null })).toEqual({ ...values, minSalary: undefined });
  });
});
