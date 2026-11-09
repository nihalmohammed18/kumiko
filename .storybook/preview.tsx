import type { Decorator, Preview } from "@storybook/react-vite";
import { KumikoProvider } from "../src/provider.tsx";
import { mirrorDemoStates } from "./demo-states.ts";
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

/** Applies the toolbar's theme and direction the way an app would: a class and `dir` on <html>. */
const withKumiko: Decorator = (Story, { globals, parameters }) => {
  mirrorDemoStates();
  const dir = globals.dir === "rtl" ? "rtl" : "ltr";
  const root = document.documentElement;
  root.classList.toggle("dark", globals.theme === "dark");
  root.dir = dir;
  root.lang = dir === "rtl" ? "ar" : "en";
  window.__kumikoSkipVrt = parameters.vrt === false;
  window.__kumikoVrtPage = parameters.vrt === "page";
  window.__kumikoUx = parameters.ux;
  return (
    <KumikoProvider direction={dir} locale={dir === "rtl" ? "ar-u-nu-arab" : "en"}>
      {/* The screenshot target; the padding keeps focus rings inside the picture. */}
      <div data-kumiko-story className="p-3">
        <Story />
      </div>
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
    dir: {
      description: "Reading direction",
      toolbar: {
        title: "Direction",
        icon: "transfer",
        items: [
          { value: "ltr", title: "Left to right" },
          { value: "rtl", title: "Right to left" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light", dir: "ltr" },
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
