import { ClassicHome } from "@/themes/classic";
import type { ThemeProps } from "@/themes/types";
import type { ComponentType } from "react";

/**
 * Theme registry. "modern" and "minimal" currently fall back to classic and
 * get their own component sets in a later pass — the SiteContent shape is
 * shared so swapping is safe.
 */
const themes: Record<string, { Home: ComponentType<ThemeProps> }> = {
  classic: { Home: ClassicHome },
};

export function resolveTheme(themeId: string) {
  return themes[themeId] ?? themes.classic;
}

export function registerTheme(
  id: string,
  theme: { Home: ComponentType<ThemeProps> },
) {
  themes[id] = theme;
}
