import { catalog, palettes, slots, type Recipe } from './recipe';

export const looks = [
  { id: 'playful', title: 'Playful', symbol: '✿', description: 'Soft clay, big smiles, storybook magic.', prompt: 'A joyful handmade clay animation character, soft rounded shapes, tactile clay, warm pastel studio lighting, charming storybook art direction.' },
  { id: 'realistic', title: 'Realistic', symbol: '◉', description: 'A fuzzy little friend you could almost hug.', prompt: 'A photorealistic practical creature puppet, velvety plush skin, tiny tactile fibers, physically believable materials, soft cinematic studio light. Like a lovable handmade movie creature photographed in real life.' },
  { id: 'ultra-crazy', title: 'Ultra Crazy', symbol: '✷', description: 'Cosmic colors. Maximum silly. Zero scary.', prompt: 'An exuberant surreal 3D character illustration: iridescent jelly textures, candy-colored highlights, a tiny floating planet, fizzy confetti and impossible rainbow bubbles. Delightfully absurd and hilarious. Keep the specified anatomy and eye count; put the extra craziness in textures and surroundings.' },
] as const;
export type Look = typeof looks[number]['id'];
export const isLook = (value: unknown): value is Look => looks.some(look => look.id === value);
export const PROMPT_VERSION = 1;
const bodies = ['a lumpy jelly-bean silhouette', 'a pear-shaped silhouette, narrow at the top and round at the bottom', 'a soft rounded square silhouette', 'a wobbly pudding-shaped silhouette'];
const eyes = ['exactly one large round eye', 'exactly two bright round eyes', 'exactly three round eyes in a horizontal row', 'exactly two sleepy half-closed eyes', 'exactly two mismatched googly eyes', 'exactly two eyes with star-shaped pupils'];
const mouths = ['a small gentle smile', 'a broad friendly grin with rounded teeth', 'a little round surprised O mouth', 'a smile with two tiny harmless rounded fangs', 'a playful smile with a pink tongue sticking out', 'an asymmetric wobbly smile'];
const arms = ['two long curling noodle arms', 'two arms, one raised with an open hand waving hello', 'two tiny stubby arms', 'two outstretched arms with open jazz hands'];
const feet = ['two large chunky boots', 'two sneakers with white laces', 'two tiny rounded tiptoe feet', 'two broad flat flipper feet'];
export function compilePrompt(recipe: Recipe, look: Look) {
  const palette = palettes[recipe.palette];
  return [
    'Create one original, friendly monster for a children’s character-making app. Suitable for young children: gentle, cuddly, joyful, never frightening. No violence, gore, weapons, sexual content, lettering or logos.',
    looks.find(item => item.id === look)!.prompt,
    'Single full-body character centered, entire hands and feet visible with generous breathing room. Integrated head and body, no separate head or neck. Cream background with a soft contact shadow.',
    `Anatomy: ${bodies[recipe.parts.body]}; ${eyes[recipe.parts.eyes]}; ${mouths[recipe.parts.mouth]}; ${arms[recipe.parts.arms]}; ${feet[recipe.parts.feet]}.`,
    `Colors: body ${palette.body}, deeper accents ${palette.accent}, highlights ${palette.light}, feet or footwear ${palette.shoe}.`,
    `Preserve the selected anatomy and counts. ${slots.filter(slot => recipe.locks[slot]).map(slot => `Especially preserve locked ${slot}: ${catalog[slot][recipe.parts[slot]]}.`).join(' ')}`,
  ].join('\n');
}
export type Generation = {
  id: string; status: 'running' | 'succeeded' | 'failed'; createdAt: string;
  recipe: Recipe; look: Look; model: string; prompt: string; promptVersion: number;
  recipeHash: string; latencyMs?: number; cost?: number; mediaType?: string; error?: string;
};
