"use client";

import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxPopup,
  Field,
  FieldError,
  FieldLabel,
} from "kumiko-ui";

const regions = [
  { label: "India", items: ["Bengaluru", "Chennai", "Delhi", "Mumbai"] },
  { label: "Elsewhere", items: ["Dubai", "Karachi", "London", "Toronto"] },
];

/** Keeps Combobox's filtered-list render callback inside a client boundary.
 * Use when: choosing a city for job matches. Avoid when: accepting a free-text location.
 */
export function CityField() {
  return (
    <Field name="city">
      <FieldLabel>Preferred city</FieldLabel>
      <Combobox items={regions} required>
        <ComboboxInput placeholder="Search cities" />
        <ComboboxPopup>
          {(region: (typeof regions)[number]) => (
            <ComboboxGroup key={region.label} items={region.items}>
              <ComboboxGroupLabel>{region.label}</ComboboxGroupLabel>
              {region.items.map((city) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxPopup>
      </Combobox>
      <FieldError match="valueMissing">Choose a city.</FieldError>
    </Field>
  );
}
