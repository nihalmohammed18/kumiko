import type { Decorator, Preview } from "@storybook/react-vite";
import { KumikoProvider } from "../src/provider.tsx";
import { mirrorDemoStates } from "./demo-states.ts";
import "./preview.css";

const arabicLabels = { close: "إغلاق", loading: "جارٍ التحميل" };

declare global {
  interface Window {
    __kumikoSkipVrt?: boolean;
    __kumikoVrtPage?: boolean;
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
  return (
    <KumikoProvider direction={dir} labels={dir === "rtl" ? arabicLabels : undefined}>
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
    layout: "padded",
    controls: { expanded: true },
    // Accessibility violations fail the story's test in every mode.
    a11y: {
      test: "error",
      options: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } },
    },
  },
  tags: ["autodocs"],
};

export default preview;
