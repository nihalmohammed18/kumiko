"use client";

import { Button, Form } from "kumiko-ui";
import { type ReactNode, useState } from "react";

/** Collects the server-composed fields and previews a successful signup locally.
 * Use when: trying the example form. Avoid when: creating a real account without a backend.
 */
export function SignUpForm({ children }: { children: ReactNode }) {
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState("");
  return (
    <Form
      onFormSubmit={async (values) => {
        if (saving) return;
        setSavedName("");
        setSaving(true);
        // A local preview delay makes the loading state visible; no account or upload is sent.
        await new Promise((resolve) => setTimeout(resolve, 750));
        setSavedName(String(values.name));
        setSaving(false);
      }}
    >
      {children}
      <Button type="submit" tone="primary" loading={saving} className="justify-self-start">
        Create my profile
      </Button>
      <p role="status" className="text-success-text">
        {savedName && `${savedName}, your profile is ready to review. This preview stays on this page.`}
      </p>
    </Form>
  );
}
