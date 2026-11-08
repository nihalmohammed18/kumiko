"use client";

import { CSPProvider } from "@base-ui/react/csp-provider";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useRef } from "react";
import { labels as builtInLabels, englishLabels, type Label, type LabelKey } from "./labels.ts";

/**
 * Labels available to Kumiko components in the provider's locale.
 * Use when: typing label overrides. Avoid when: choosing a language; set locale on KumikoProvider.
 */
export type KumikoLabels = Record<LabelKey, Label>;

/** Reading direction for Kumiko and Base UI components.
 * Use when: typing a provider direction. Avoid when: selecting translated labels; use locale.
 */
export type Direction = "ltr" | "rtl";

interface KumikoSettings {
  direction: Direction;
  locale: string;
  labels: KumikoLabels;
  announce: (message: string) => void;
}

const Settings = createContext<KumikoSettings>({
  direction: "ltr",
  locale: "en",
  labels: englishLabels,
  announce: () => undefined,
});

/** Settings, CSP nonce and children for KumikoProvider.
 * Use when: wrapping an app in Kumiko's provider. Avoid when: configuring an individual control.
 */
export interface KumikoProviderProps {
  /** Reading direction. Also set `dir` on `<html>` so the browser lays out text the same way. */
  direction?: Direction;
  /** BCP 47 locale for labels, dates and numbers, such as "en-GB" or "ar-u-nu-arab". */
  locale?: string;
  /** Replaces any of Kumiko's built-in strings. */
  labels?: Partial<KumikoLabels>;
  /** CSP nonce for Base UI's inline scripts; inline style elements are disabled. */
  nonce?: string;
  children: ReactNode;
}

/**
 * Provides direction, locale, translated labels, CSP settings and polite announcements to every Kumiko component.
 *
 * Use when: always; one per app, inside your theme provider.
 * Avoid when: nesting it for a single section; set `dir` on that element instead.
 *
 * @example
 * <KumikoProvider direction="ltr" locale="en">
 *   <Toaster /><main><LinkButton href="/jobs">Browse jobs</LinkButton></main>
 * </KumikoProvider>
 */
export function KumikoProvider({ direction = "ltr", locale = "en", labels, nonce, children }: KumikoProviderProps) {
  const region = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const announce = useCallback((message: string) => {
    if (typeof window === "undefined" || !region.current) return;
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    // A separate frame after clearing lets screen readers announce identical messages again.
    region.current.textContent = "";
    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      if (region.current) region.current.textContent = message;
    });
  }, []);
  useEffect(
    () => () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    },
    [],
  );
  const value = useMemo<KumikoSettings>(() => {
    const language = locale.toLowerCase().split("-")[0];
    const defaults = builtInLabels[language === "ar" || language === "ur" ? language : "en"];
    return { direction, locale, labels: { ...defaults, ...labels }, announce };
  }, [direction, locale, labels, announce]);
  return (
    <Settings value={value}>
      <DirectionProvider direction={direction}>
        <CSPProvider nonce={nonce} disableStyleElements>
          {children}
          <div ref={region} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
        </CSPProvider>
      </DirectionProvider>
    </Settings>
  );
}

/** Reads the provider's direction, locale, labels and announce function; announcements do nothing on the server.
 * Use when: localizing a control or announcing an action's result. Avoid when: announcing on every render.
 */
export function useKumiko(): KumikoSettings {
  return use(Settings);
}
