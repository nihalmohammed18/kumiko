import { z } from "zod";

/** Cities available in both job-alert recipes.
 * Use when: rendering the city Combobox. Avoid when: accepting a free-text location.
 */
export const cities = ["London", "Paris", "Berlin", "Mumbai", "Karachi"] as const;

/** Role values and their visible labels.
 * Use when: rendering the role ChoiceTileGroup. Avoid when: choosing several roles at once.
 */
export const roles = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
] as const;

/** Delivery frequencies available in both job-alert recipes.
 * Use when: rendering the frequency Select. Avoid when: configuring a custom delivery schedule.
 */
export const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
] as const;

/** Validates a job alert and converts an empty NumberField value to undefined.
 * Use when: submitting either job-alert recipe. Avoid when: validating unrelated product forms.
 */
export const jobAlertSchema = z.object({
  email: z
    .string({ error: "Enter your email." })
    .min(1, "Enter your email.")
    .pipe(z.email({ error: "Enter an email like name@example.com." })),
  city: z.string({ error: "Choose a city." }).pipe(z.enum(cities, { error: "Choose a city." })),
  role: z.string({ error: "Choose a kind of role." }).pipe(
    z.enum(
      roles.map(({ value }) => value),
      { error: "Choose a kind of role." },
    ),
  ),
  minSalary: z
    .number()
    .min(10, "Use at least 10.")
    .nullish()
    .transform((value) => value ?? undefined),
  frequency: z.string({ error: "Choose a frequency." }).pipe(
    z.enum(
      frequencies.map(({ value }) => value),
      { error: "Choose a frequency." },
    ),
  ),
  remote: z.boolean(),
  terms: z.boolean({ error: "Tick this to get alerts." }).refine((value) => value, "Tick this to get alerts."),
});

/** Parsed submission values, with numeric salary and boolean choices.
 * Use when: typing a job-alert submit handler. Avoid when: typing values before validation; use JobAlertInput.
 */
export type JobAlert = z.infer<typeof jobAlertSchema>;

/** Editable values before parsing, including empty choices and a nullable salary.
 * Use when: typing React Hook Form's fields. Avoid when: typing a successful submission; use JobAlert.
 */
export type JobAlertInput = z.input<typeof jobAlertSchema>;

/** Initial values shared by the two job-alert recipes.
 * Use when: initializing a fresh job alert. Avoid when: replacing values in an existing alert.
 */
export const jobAlertDefaults = {
  email: "",
  city: "",
  role: "",
  minSalary: null,
  frequency: "weekly",
  remote: false,
  terms: false,
} satisfies JobAlertInput;
