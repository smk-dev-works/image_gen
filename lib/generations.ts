import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { compilePrompt, compileEditPrompt, describeParts, PROMPT_VERSION, type Generation, type Look, type PartDescriptions, type PartEdit } from './illustration';
import type { Recipe } from './recipe';
import { DEFAULT_IMAGE_MODEL, generateImage, ProviderError } from './providers/openrouter';

const directory = path.join(process.cwd(), '.artifacts', 'generations');
export const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
export const imagePath = (id: string) => path.join(directory, `${id}.image`);
export const configuredModel = () => process.env.OPENROUTER_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
export async function getGeneration(id: string): Promise<Generation | null> {
  if (!validId(id)) return null;
  try { return JSON.parse(await readFile(path.join(directory, `${id}.json`), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}
async function persist(record: Generation) {
  await mkdir(directory, { recursive: true });
  const filename = path.join(directory, `${record.id}.json`);
  await writeFile(`${filename}.tmp`, JSON.stringify(record, null, 2));
  await rename(`${filename}.tmp`, filename);
}
export async function listGenerations() {
  await mkdir(directory, { recursive: true });
  const filenames = (await readdir(directory)).filter(name => name.endsWith('.json'));
  const records = await Promise.all(filenames.map(name => getGeneration(name.slice(0, -5))));
  return records.filter((item): item is Generation => !!item).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 24);
}
// One local server process, one paid request at a time. Kept across dev hot reloads.
const state = globalThis as typeof globalThis & { monsterGenerationBusy?: boolean };
export class GenerationBusyError extends Error {}
export class RequestConflictError extends Error {}
export async function illustrate(id: string, recipe: Recipe, look: Look, options: { reference?: string; descriptions?: PartDescriptions; edit?: PartEdit } = {}): Promise<Generation> {
  if (state.monsterGenerationBusy) throw new GenerationBusyError('An illustration is already cooking. Please wait for it to finish.');
  state.monsterGenerationBusy = true;
  try {
    const hash = createHash('sha256').update(JSON.stringify(recipe)).digest('hex');
    const requestHash = createHash('sha256').update(JSON.stringify({ recipe, look, options })).digest('hex');
    const existing = await getGeneration(id);
    if (existing) {
      if (existing.recipeHash !== hash || existing.look !== look || (existing.requestHash && existing.requestHash !== requestHash)) throw new RequestConflictError('That request ID belongs to another monster.');
      return existing;
    }
    const references: string[] = [];
    let descriptions = options.descriptions || describeParts(recipe);
    if (options.edit) {
      const source = await getGeneration(options.edit.sourceId);
      if (!source || source.status !== 'succeeded') throw new RequestConflictError('Choose a completed illustration to edit.');
      if (JSON.stringify(source.recipe) !== JSON.stringify(recipe) || source.look !== look) throw new RequestConflictError('Part edits must use the current illustration recipe and look.');
      descriptions = { ...(source.descriptions || describeParts(source.recipe)), [options.edit.slot]: options.edit.description };
      references.push(`data:${source.mediaType};base64,${(await readFile(imagePath(source.id))).toString('base64')}`);
    } else if (options.reference) references.push(options.reference);
    const record: Generation = { id, recipe: structuredClone(recipe), look, model: configuredModel(), recipeHash: hash, prompt: options.edit ? compileEditPrompt(options.edit) : compilePrompt(recipe, look, descriptions), descriptions, edit: options.edit, requestHash, promptVersion: PROMPT_VERSION, status: 'running', createdAt: new Date().toISOString() };
    await persist(record);
    const started = Date.now();
    try {
      const image = await generateImage(record.prompt, record.model, fetch, references);
      await writeFile(imagePath(id), image.bytes);
      Object.assign(record, { status: 'succeeded', mediaType: image.mediaType, cost: image.cost });
    } catch (error) {
      record.status = 'failed';
      record.error = error instanceof ProviderError ? error.message : 'The illustration could not be saved. Check OpenRouter activity before trying again.';
    }
    record.latencyMs = Date.now() - started;
    await persist(record);
    return record;
  } finally { state.monsterGenerationBusy = false; }
}
