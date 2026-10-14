"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { createContext, type ReactNode, use, useMemo } from "react";

/**
 * Text Kumiko shows on its own, such as the label of a close button. English by default; pass `labels` to
 * KumikoProvider to translate any of them.
 */
export const defaultLabels = {
  close: "Close",
  loading: "Loading",
};

export type KumikoLabels = typeof defaultLabels;
export type Direction = "ltr" | "rtl";

interface KumikoSettings {
  direction: Direction;
  locale: string;
  labels: KumikoLabels;
}

const Settings = createContext<KumikoSettings>({ direction: "ltr", locale: "en", labels: defaultLabels });

export interface KumikoProviderProps {
  /** Reading direction. Also set `dir` on `<html>` so the browser lays out text the same way. */
  direction?: Direction;
  /** BCP 47 locale for dates and numbers, such as "en-GB" or "ar". */
  locale?: string;
  /** Replaces any of Kumiko's built-in strings. */
  labels?: Partial<KumikoLabels>;
  children: ReactNode;
}

/**
 * Provides direction, locale and translated labels to every Kumiko component. Render it once, near the root.
 *
 * Use when: always; one per app, inside your theme provider.
 * Avoid when: nesting it for a single section; set `dir` on that element instead.
 */
export function KumikoProvider({ direction = "ltr", locale = "en", labels, children }: KumikoProviderProps) {
  const value = useMemo(
    () => ({ direction, locale, labels: { ...defaultLabels, ...labels } }),
    [direction, locale, labels],
  );
  return (
    <Settings value={value}>
      <DirectionProvider direction={direction}>{children}</DirectionProvider>
    </Settings>
  );
}

/** Reads the direction, locale and labels set on KumikoProvider. */
export function useKumiko(): KumikoSettings {
  return use(Settings);
}
