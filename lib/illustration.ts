import { catalog, palettes, slots, type Recipe, type Slot } from './recipe';

export const looks = [
  { id: 'playful', title: 'Playful', symbol: '✿', description: 'Soft clay, big smiles, storybook magic.', prompt: 'A joyful handmade clay animation character, soft rounded shapes, tactile clay, warm pastel studio lighting, charming storybook art direction.' },
  { id: 'realistic', title: 'Realistic', symbol: '◉', description: 'A fuzzy little friend you could almost hug.', prompt: 'A photorealistic practical creature puppet, velvety plush skin, tiny tactile fibers, physically believable materials, soft cinematic studio light. Like a lovable handmade movie creature photographed in real life.' },
  { id: 'ultra-crazy', title: 'Ultra Crazy', symbol: '✷', description: 'Cosmic colors. Maximum silly. Zero scary.', prompt: 'An exuberant surreal 3D character illustration: iridescent jelly textures, candy-colored highlights, a tiny floating planet, fizzy confetti and impossible rainbow bubbles. Delightfully absurd and hilarious. Keep the specified anatomy and eye count; put the extra craziness in textures and surroundings.' },
] as const;
export type Look = typeof looks[number]['id'];
export const isLook = (value: unknown): value is Look => looks.some(look => look.id === value);
export const PROMPT_VERSION = 2;
const bodies = ['a lumpy jelly-bean silhouette', 'a pear-shaped silhouette, narrow at the top and round at the bottom', 'a soft rounded square silhouette', 'a tapered pudding silhouette with a scalloped top and broad flat rounded base'];
const eyes = ['exactly one large round eye', 'exactly two bright round eyes', 'exactly three round eyes arranged in a shallow triangle, middle eye higher and slightly larger', 'exactly two sleepy half-closed eyes', 'exactly two mismatched googly eyes', 'exactly two eyes with star-shaped pupils'];
const mouths = ['a small gentle smile', 'a broad friendly grin with rounded teeth', 'a little round surprised O mouth', 'a smile with two tiny harmless rounded fangs', 'a playful smile with a pink tongue sticking out', 'an asymmetric wobbly smile'];
const arms = ['two long curling noodle arms', 'two arms, one raised with an open hand waving hello', 'two tiny stubby arms', 'two outstretched arms with open jazz hands'];
const feet = ['two large chunky boots', 'two sneakers with white laces', 'two tiny rounded tiptoe feet', 'two broad flat flipper feet'];
export type PartDescriptions = Record<Slot, string>;
export function describeParts(recipe: Recipe): PartDescriptions {
  return { body: bodies[recipe.parts.body], eyes: eyes[recipe.parts.eyes], mouth: mouths[recipe.parts.mouth], arms: arms[recipe.parts.arms], feet: feet[recipe.parts.feet] };
}
export type PartEdit = { sourceId: string; slot: Slot; description: string };
export function compileEditPrompt(edit: PartEdit) {
  return [
    'Edit the supplied current monster illustration. Make one localized change only.',
    `Replace only the ${edit.slot === 'feet' ? 'feet and legs' : edit.slot} with: ${edit.description}.`,
    'Keep the same character identity, body silhouette, pose, framing, background, lighting, materials, palette, and every other body part unchanged. Do not add extra limbs or eyes. Blend the changed part into the existing style and attachment points.',
    'Suitable for young children: friendly, gentle, never frightening. No lettering or logos.',
  ].join('\n');
}
export function compilePrompt(recipe: Recipe, look: Look, descriptions = describeParts(recipe)) {
  const palette = palettes[recipe.palette];
  return [
    'Create one original, friendly monster for a children’s character-making app. Suitable for young children: gentle, cuddly, joyful, never frightening. No violence, gore, weapons, sexual content, lettering or logos.',
    'The supplied image is the exact SVG design reference. Match its silhouette, proportions, eye positions and counts, mouth shape, arm gesture, and footwear. Translate the materials and lighting only; do not redesign the anatomy. Shape fidelity takes priority over style.',
    looks.find(item => item.id === look)!.prompt,
    'Single full-body character centered, entire hands and feet visible with generous breathing room. Integrated head and body, no separate head or neck. Cream background with a soft contact shadow.',
    `Anatomy: ${slots.map(slot => `${slot}: ${descriptions[slot]}`).join('; ')}.`,
    `Colors: body ${palette.body}, deeper accents ${palette.accent}, highlights ${palette.light}, feet or footwear ${palette.shoe}.`,
    `Preserve the selected anatomy and counts. ${slots.filter(slot => recipe.locks[slot]).map(slot => `Especially preserve locked ${slot}: ${catalog[slot][recipe.parts[slot]]}.`).join(' ')}`,
  ].join('\n');
}
export type Generation = {
  id: string; status: 'running' | 'succeeded' | 'failed'; createdAt: string;
  recipe: Recipe; look: Look; model: string; prompt: string; promptVersion: number;
  descriptions?: PartDescriptions; edit?: PartEdit;
  recipeHash: string; requestHash?: string; latencyMs?: number; cost?: number; mediaType?: string; error?: string;
};
