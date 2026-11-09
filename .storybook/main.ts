import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Not src/**: screenshot folders are named after their story files (__screenshots__/x.stories.tsx/), and the dev
  // server's watcher tries to read a newly created one as a story.
  stories: [
    "../src/*.stories.tsx",
    "../src/components/*.stories.tsx",
    "../src/email/*.stories.tsx",
    "../src/recipes/*.stories.tsx",
    "./ux/fixtures.stories.tsx",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  staticDirs: [{ from: "../src/email/art", to: "/email-art" }],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
};

export default config;
