import { ClassicHome } from "@/themes/classic";
import { ModernHome } from "@/themes/modern";
import { MinimalHome } from "@/themes/minimal";
import type { ThemeProps } from "@/themes/types";
import type { ComponentType } from "react";

const themes: Record<string, { Home: ComponentType<ThemeProps> }> = {
  classic: { Home: ClassicHome },
  modern: { Home: ModernHome },
  minimal: { Home: MinimalHome },
};

export function resolveTheme(themeId: string) {
  return themes[themeId] ?? themes.classic;
}
