export const CATALOG_VERSION = 1 as const;
export const slots = ['body', 'eyes', 'mouth', 'arms', 'feet'] as const;
export type Slot = typeof slots[number];
export const catalog = {
  body: ['Jelly bean', 'Pear pal', 'Squish square', 'Pudding'],
  eyes: ['Big cyclops', 'Bright eyes', 'Three’s company', 'Sleepy peepers', 'Googly eyes', 'Starstruck'],
  mouth: ['Little smile', 'Toothy grin', 'Oh!', 'Tiny fangs', 'Tongue out', 'Wobbly smile'],
  arms: ['Noodle arms', 'Hello there', 'Tiny arms', 'Jazz hands'],
  feet: ['Big boots', 'Sneakers', 'Tippy toes', 'Flippers'],
} as const;
export const palettes = [
  { name: 'Lilac daydream', body: '#bca4ed', accent: '#7b53ba', light: '#e7dbff', shoe: '#f4bd64' },
  { name: 'Peach party', body: '#f3997d', accent: '#c15547', light: '#ffe0c6', shoe: '#9577d0' },
  { name: 'Garden goblin', body: '#c7dc87', accent: '#6e8d43', light: '#e8f0c1', shoe: '#d98b73' },
  { name: 'Blue lagoon', body: '#92cddd', accent: '#477eaa', light: '#d7f0f3', shoe: '#f0bb5e' },
  { name: 'Butter buddy', body: '#f3cf75', accent: '#bb8b38', light: '#fff0ba', shoe: '#91b7a2' },
  { name: 'Berry bubble', body: '#eba7c8', accent: '#ae5a88', light: '#ffdae9', shoe: '#8d9bcd' },
] as const;
export type Recipe = {
  version: typeof CATALOG_VERSION;
  seed: number;
  parts: Record<Slot, number>;
  palette: number;
  locks: Record<Slot, boolean>;
};
export type Favorite = { id: string; name: string; recipe: Recipe };
export const emptyLocks = (): Record<Slot, boolean> => ({ body: false, eyes: false, mouth: false, arms: false, feet: false });
export function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
export function createRecipe(seed: number): Recipe {
  const random = rng(seed);
  return {
    version: CATALOG_VERSION, seed: seed >>> 0,
    parts: Object.fromEntries(slots.map(slot => [slot, Math.floor(random() * catalog[slot].length)])) as Record<Slot, number>,
    palette: Math.floor(random() * palettes.length), locks: emptyLocks(),
  };
}
export const initialRecipe: Recipe = {
  version: 1, seed: 2048, parts: { body: 1, eyes: 2, mouth: 0, arms: 1, feet: 0 }, palette: 0, locks: emptyLocks(),
};
// Each random draw is tied to a slot, so locks do not shift the remaining sequence.
export function rollRecipe(recipe: Recipe, seed: number, only?: Slot): Recipe {
  const random = rng(seed);
  const parts = { ...recipe.parts };
  for (const slot of slots) {
    const step = 1 + Math.floor(random() * (catalog[slot].length - 1));
    if ((!only || only === slot) && !recipe.locks[slot]) parts[slot] = (parts[slot] + step) % catalog[slot].length;
  }
  return { ...recipe, seed: seed >>> 0, parts };
}
export function parseRecipe(value: unknown): Recipe | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<Recipe>;
  if (v.version !== 1 || !Number.isInteger(v.seed) || v.seed! < 0 || v.seed! > 0xffffffff || !Number.isInteger(v.palette) || v.palette! < 0 || v.palette! >= palettes.length || !v.parts || !v.locks) return null;
  if (!slots.every(s => Number.isInteger(v.parts![s]) && v.parts![s] >= 0 && v.parts![s] < catalog[s].length && typeof v.locks![s] === 'boolean')) return null;
  return { version: 1, seed: v.seed!, palette: v.palette!, parts: Object.fromEntries(slots.map(s => [s, v.parts![s]])) as Recipe['parts'], locks: Object.fromEntries(slots.map(s => [s, v.locks![s]])) as Recipe['locks'] };
}
const firstNames = ['Bumble', 'Pickle', 'Noodle', 'Mochi', 'Wobble', 'Pip'];
const lastNames = ['Bean', 'Sprout', 'Pudding', 'McSquish'];
export function monsterName(recipe: Recipe) {
  return `${firstNames[(recipe.parts.eyes + recipe.parts.mouth) % firstNames.length]} ${lastNames[(recipe.parts.body + recipe.parts.feet) % lastNames.length]}`;
}
export function recipeKey(recipe: Recipe) { return [...slots.map(s => recipe.parts[s]), recipe.palette].join('-'); }
export function parseFavorites(value: unknown): Favorite[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(v => {
    if (!v || typeof v.id !== 'string' || typeof v.name !== 'string') return [];
    const recipe = parseRecipe(v.recipe);
    if (!recipe || seen.has(v.id)) return [];
    seen.add(v.id);
    return [{ id: v.id, name: v.name.slice(0, 40), recipe }];
  }).slice(0, 12);
}
