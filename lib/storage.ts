import { parseRecipe, parseFavorites, type Recipe, type Favorite } from './recipe';
export const STORAGE_KEY = 'monster-mixer.v1';
export type SavedState = { recipe: Recipe; favorites: Favorite[] };
export function decodeState(raw: string | null): SavedState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const recipe = parseRecipe(value?.recipe);
    return recipe ? { recipe, favorites: parseFavorites(value.favorites) } : null;
  } catch { return null; }
}
