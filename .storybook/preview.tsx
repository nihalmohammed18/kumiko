"use client";

import type { Decorator, Preview } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { KumikoProvider, useKumiko } from "../src/provider.tsx";
import { mirrorDemoStates } from "./demo-states.ts";
import { storySettings } from "./story-copy.ts";
import type { UxParameters } from "./ux/harness.ts";
import "../src/fonts.css";
import "./preview.css";

declare global {
  interface Window {
    __kumikoSkipVrt?: boolean;
    __kumikoVrtPage?: boolean;
    __kumikoUx?: UxParameters;
  }
}

function StoryFrame({ children }: { children: ReactNode }) {
  const { locale } = useKumiko();
  // The screenshot target; the padding keeps focus rings inside the picture.
  return (
    <div data-kumiko-story data-kumiko-locale={locale} className="p-3">
      {children}
    </div>
  );
}

/** Applies the toolbar's theme, language and direction the way an app would, including the provider's locale. */
const withKumiko: Decorator = (Story, { globals, parameters }) => {
  mirrorDemoStates();
  const { language, locale, dir } = storySettings(globals);
  const root = document.documentElement;
  root.classList.toggle("dark", globals.theme === "dark");
  root.dir = dir;
  root.lang = language;
  window.__kumikoSkipVrt = parameters.vrt === false;
  window.__kumikoVrtPage = parameters.vrt === "page";
  window.__kumikoUx = parameters.ux;
  return (
    <KumikoProvider direction={dir} locale={locale}>
      <StoryFrame>
        <Story />
      </StoryFrame>
    </KumikoProvider>
  );
};

const preview: Preview = {
  decorators: [withKumiko],
  globalTypes: {
    theme: {
      description: "Light or dark",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Language for copy, labels, dates and numbers",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "ar", title: "Arabic (العربية)" },
          { value: "ur", title: "Urdu (اردو)" },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: "Automatic direction from language, or a forced reading direction",
      toolbar: {
        title: "Direction",
        icon: "transfer",
        items: [
          { value: "auto", title: "Auto" },
          { value: "ltr", title: "Left to right" },
          { value: "rtl", title: "Right to left" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", locale: "en", dir: "auto" },
  parameters: {
    // The welcome page first, then the parts that show the Playground look, so a newcomer meets the cast early.
    options: {
      storySort: {
        order: [
          "Welcome",
          "Actions",
          "Delight",
          "Forms",
          "Feedback",
          "Display",
          "Overlays",
          "Navigation",
          "Data",
          "Email",
          "Theming",
          "Recipes",
          "Foundation",
          "Internal",
        ],
      },
    },
    layout: "padded",
    controls: { expanded: true },
    // Accessibility violations fail the story's test in every mode.
    a11y: {
      // a11y-exception: Base UI brackets open popups with invisible focus guards (aria-hidden, tabindex=0) that send
      // focus straight back; focus never rests on them, so axe's aria-hidden-focus rule misreads them.
      context: { exclude: ["[data-base-ui-focus-guard]"] },
      test: "error",
      options: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } },
    },
  },
  tags: ["autodocs"],
};

export default preview;
