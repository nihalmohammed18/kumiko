import {
  Checkbox,
  CheckboxGroup,
  ChoiceTile,
  ChoiceTileGroup,
  DateInput,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  FileUpload,
  Input,
  NativeSelect,
  NumberField,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Slider,
  SliderValue,
  Textarea,
} from "kumiko-ui";
import { CityField } from "./city-field";
import { MatchPreferences } from "./match-preferences";
import { SignUpForm } from "./sign-up-form";

const disciplines = [
  { label: "Product and engineering", items: ["Product design", "Frontend", "Backend"] },
  { label: "Business", items: ["Operations", "Marketing"] },
];

export default function FormsPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Create your job-seeker profile</h1>
      <p className="text-ink-muted">
        Try submitting an empty form to see what needs attention. No account is created in this preview.
      </p>
      <SignUpForm>
        <Fieldset>
          <FieldsetLegend>About you</FieldsetLegend>
          <div className="grid gap-4 @lg:grid-cols-2">
            <Field name="name">
              <FieldLabel>Full name</FieldLabel>
              <Input required autoComplete="name" />
              <FieldError match="valueMissing">Enter your name.</FieldError>
            </Field>
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" required autoComplete="email" />
              <FieldError match="valueMissing">Enter your email.</FieldError>
              <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
            </Field>
            <Field name="country">
              <FieldLabel>Country</FieldLabel>
              <NativeSelect defaultValue="" required autoComplete="country">
                <option value="">Choose a country</option>
                <option value="in">India</option>
                <option value="gb">United Kingdom</option>
                <option value="ae">United Arab Emirates</option>
              </NativeSelect>
              <FieldError match="valueMissing">Choose a country.</FieldError>
            </Field>
            <CityField />
          </div>
          <Field name="bio">
            <FieldLabel>A little about you</FieldLabel>
            <Textarea placeholder="What would you love to work on?" />
            <FieldDescription>A few sentences are enough.</FieldDescription>
          </Field>
          <Field name="resume">
            <FieldLabel>Resume (optional)</FieldLabel>
            <FileUpload accept=".pdf" maxSize={5 * 1024 * 1024} />
            <FieldDescription>PDF, up to 5 MB. Files stay on your device.</FieldDescription>
          </Field>
        </Fieldset>
        <Fieldset>
          <FieldsetLegend>Your next role</FieldsetLegend>
          <div className="grid gap-4 @lg:grid-cols-2">
            <Field name="query">
              <FieldLabel>Roles to watch</FieldLabel>
              <SearchField placeholder="Job title or skill" />
            </Field>
            <Field name="discipline">
              <FieldLabel>Discipline</FieldLabel>
              <Select items={disciplines} defaultValue="Frontend">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a discipline" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectGroup>
                    <SelectGroupLabel>{disciplines[0].label}</SelectGroupLabel>
                    {disciplines[0].items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectGroupLabel>{disciplines[1].label}</SelectGroupLabel>
                    {disciplines[1].items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectPopup>
              </Select>
            </Field>
            <Field name="startDate">
              <FieldLabel>Available from</FieldLabel>
              <DateInput />
            </Field>
            <Field name="experience">
              <FieldLabel>Years of experience</FieldLabel>
              <NumberField defaultValue={0} min={0} max={40} />
            </Field>
          </div>
          <Field name="commute">
            <Slider label="Maximum commute (minutes)" defaultValue={45} min={15} max={120} step={15}>
              <SliderValue />
            </Slider>
          </Field>
          <ChoiceTileGroup name="careerStage" defaultValue="first" aria-label="Your career stage" columns={2}>
            <ChoiceTile value="first" description="Build experience with a supportive team.">
              My first role
            </ChoiceTile>
            <ChoiceTile value="next" description="Take the next step in a field you know.">
              My next role
            </ChoiceTile>
          </ChoiceTileGroup>
          <Fieldset>
            <FieldsetLegend id="schedule-label">Work schedule</FieldsetLegend>
            <RadioGroup name="schedule" defaultValue="full-time" aria-labelledby="schedule-label">
              <Radio value="full-time">Full-time</Radio>
              <Radio value="part-time">Part-time</Radio>
            </RadioGroup>
          </Fieldset>
          <Fieldset>
            <FieldsetLegend id="benefits-label">What matters to you</FieldsetLegend>
            <CheckboxGroup defaultValue={["mentorship"]} aria-labelledby="benefits-label">
              <Checkbox name="benefits" value="mentorship">
                Mentorship
              </Checkbox>
              <Checkbox name="benefits" value="learning">
                Learning budget
              </Checkbox>
            </CheckboxGroup>
          </Fieldset>
          <MatchPreferences />
        </Fieldset>
        <Field name="terms">
          <Checkbox required>I agree to be contacted about suitable roles.</Checkbox>
          <FieldError match="valueMissing">Confirm that employers may contact you.</FieldError>
        </Field>
      </SignUpForm>
    </>
  );
}
