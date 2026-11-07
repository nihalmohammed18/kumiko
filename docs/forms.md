# Form recipes

Use Zod with Kumiko's Form for most forms. Form manages field errors and focus, so you do not need a form library.
Install Zod in the product with `pnpm add zod`.

Use React Hook Form with Zod for large forms, field arrays, or watching values as they change.

```sh
pnpm add zod react-hook-form @hookform/resolvers
```

Both recipes build the same job alert. Copy the [shared schema, types and options](../src/recipes/job-alert.ts) with
the recipe. `JobAlert` is inferred from the schema: salary is a number or undefined, and remote and terms are booleans.

## Zod with Form

The [full recipe](../src/recipes/zod-form.stories.tsx) uses `onFormSubmit` to receive named Field values as a
JavaScript object. NumberField supplies a number or null; the schema converts null to undefined. Checkbox and
Switch supply booleans. Do not convert these values from strings.

```tsx
const [errors, setErrors] = useState<FormProps["errors"]>({});

<Form
  errors={errors}
  onSubmitCapture={() => flushSync(() => setErrors({}))}
  onFormSubmit={(values) => {
    const result = jobAlertSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }}
>
  <Field name="minSalary">
    <FieldLabel>Minimum salary</FieldLabel>
    <NumberField defaultValue={jobAlertDefaults.minSalary ?? undefined} step={5} min={0} />
    <FieldDescription>In thousands. Leave blank for any salary; otherwise use at least 10.</FieldDescription>
    <FieldError />
  </Field>
</Form>;
```

Import `useState` from React, `flushSync` from React DOM, `z` from Zod, and the controls and `FormProps` from Kumiko.
The omitted fields are in the full recipe. `onSubmit` receives a `JobAlert`.

Clear old external errors synchronously in `onSubmitCapture`: otherwise Base UI blocks `onFormSubmit` while they
remain. After the handler supplies new errors, Form focuses the first invalid control in reading order. Editing a
field clears its external error on change. The next submit parses the current values again.

The schema owns required validation, so the controls use `aria-required`. Form also checks native constraints
before calling `onFormSubmit`. The full recipe uses `BaseField.Validity` to give an email `typeMismatch` the same
format message as the schema.

## React Hook Form with Zod

The [full recipe](../src/recipes/react-hook-form.stories.tsx) uses `register` for the email input and `Controller`
for the Base UI controls. A native form with `noValidate` lets React Hook Form own submission and focus.

```tsx
const { register, control, handleSubmit, formState: { errors } } = useForm<JobAlertInput, unknown, JobAlert>({
  resolver: zodResolver(jobAlertSchema),
  defaultValues: jobAlertDefaults,
  mode: "onSubmit",
  reValidateMode: "onChange",
  shouldFocusError: true,
});

<form noValidate onSubmit={handleSubmit((values) => onSubmit(values))}>
  <Field name="email" invalid={Boolean(errors.email)}>
    <FieldLabel>Email</FieldLabel>
    <Input {...register("email")} type="email" autoComplete="email" aria-required />
    {errors.email && <FieldError match>{errors.email.message}</FieldError>}
  </Field>
  <Controller
    name="minSalary"
    control={control}
    render={({ field, fieldState }) => (
      <Field name={field.name} invalid={Boolean(fieldState.error)}>
        <FieldLabel>Minimum salary</FieldLabel>
        <NumberField
          name={field.name}
          value={field.value ?? null}
          onValueChange={field.onChange}
          inputProps={{ ref: field.ref, onBlur: field.onBlur }}
          step={5}
          min={0}
        />
        <FieldDescription>In thousands. Leave blank for any salary; otherwise use at least 10.</FieldDescription>
        {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
      </Field>
    )}
  />
</form>;
```

Import `useForm` and `Controller` from `react-hook-form`, and `zodResolver` from `@hookform/resolvers/zod`.
`JobAlertInput` describes editable values; `JobAlert` describes the parsed submission. Validation starts on submit;
invalid fields revalidate on change. Render FieldError conditionally: `match` always shows the error when mounted.

`shouldFocusError` needs `field.ref` on the element that takes focus. Pass `field.onBlur` there too, using the group's
bubbling blur event for ChoiceTileGroup.

| Control | Where to pass `field.ref` |
| --- | --- |
| Combobox | `ComboboxInput` |
| ChoiceTileGroup | The first `ChoiceTile` |
| NumberField | `inputProps.ref` |
| Select | `SelectTrigger` |
| Checkbox and Switch | The control, rendered as a native button |

Both recipes run the same empty-submit, error-correction and valid-submit play tests. The tests check required
messages, invalid attributes, focus on successive errors, direction-aware keyboard selection, and the submitted values.
