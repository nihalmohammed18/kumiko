"use client";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { pickStoryCopy, storyCopy, storySettings } from "../../.storybook/story-copy.ts";
import { useKumiko } from "../provider.tsx";
import { Card, CardTitle } from "./card.tsx";
import { Prose } from "./prose.tsx";

const meta = {
  title: "Display/Prose",
  component: Prose,
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

function useCopy() {
  return pickStoryCopy(storyCopy.prose, useKumiko().locale);
}

function Intro() {
  const copy = useCopy();
  return (
    <>
      <h1>{copy.title}</h1>
      <p>
        {copy.introStart}
        <a href="#guide">{copy.link}</a>
        {copy.introEnd}
      </p>
      <h2>{copy.stepsTitle}</h2>
      <ol>
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </>
  );
}

function Aside() {
  const copy = useCopy();
  return (
    <Card>
      <CardTitle>{copy.cardTitle}</CardTitle>
      <ul>
        {copy.cardPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </Card>
  );
}

function Article() {
  const copy = useCopy();
  return (
    <Prose>
      <Intro />
      <blockquote>
        <p>{copy.quote}</p>
      </blockquote>
      <h3>{copy.codeTitle}</h3>
      <p>
        {copy.codeStart}
        <code>hello.py</code>
        {copy.codeEnd}
      </p>
      <pre>
        <code>{'print("Hello, world!")'}</code>
      </pre>
      <hr />
      <h2>{copy.tableTitle}</h2>
      <table>
        <thead>
          <tr>
            {copy.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {copy.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Aside />
    </Prose>
  );
}

export const Default: Story = {
  render: () => (
    <Prose>
      <Intro />
    </Prose>
  ),
  play: async ({ canvas, globals, userEvent }) => {
    const copy = pickStoryCopy(storyCopy.prose, storySettings(globals).locale);
    const link = canvas.getByRole("link", { name: copy.link });
    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    await waitFor(() => expect(getComputedStyle(link).outlineStyle).toBe("solid"));
    const heading = canvas.getByRole("heading", { level: 2 });
    expect(getComputedStyle(heading).fontFamily).toContain("Fredoka");
    expect(getComputedStyle(heading).marginBlockStart).toBe("32px");
    expect(getComputedStyle(canvas.getByRole("list")).listStyleType).toBe("decimal");
  },
};

export const WithComponents: Story = {
  name: "With components",
  render: () => (
    <Prose>
      <Intro />
      <Aside />
    </Prose>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-slot="card"]')!;
    const list = card.querySelector("ul")!;
    await waitFor(() => {
      // The card joins the article's rhythm, but its own content isn't restyled.
      expect(getComputedStyle(card).marginBlockStart).toBe("16px");
      expect(getComputedStyle(list).listStyleType).toBe("none");
      expect(getComputedStyle(list).paddingInlineStart).toBe("0px");
    });
  },
};

export const States: Story = {
  render: () => <Article />,
  play: async ({ canvasElement }) => {
    // Code stays left to right, even in a right-to-left article.
    await waitFor(() => expect(getComputedStyle(canvasElement.querySelector("pre")!).direction).toBe("ltr"));
  },
};
