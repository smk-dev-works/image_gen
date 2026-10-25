# Monster Mixer — product concept

## Product idea

A playful character mixer: roll a character, keep the parts you like, reroll the rest, and optionally turn the result into an AI illustration.

The reference is the reveal-and-surprise moment of the Monsterjäger mixer. This product focuses on character creation, with original artwork and naming. No board, matching cards, scoring, or physical-game simulation.

Two starting worlds:

- **Monster Lab:** friendly, absurd creatures for children and families.
- **Caricature Studio:** funny fictional characters and clearly illustrated public-figure mashups for adults.

Working name: **Monster Mixer**. Naming and branding are provisional.

## The core interaction

1. Choose a world and a template, such as Blob, Little Beast, Robot, or Caricature Bust.
2. Press **Roll!**. Body parts spin briefly and resolve into a character immediately.
3. Tap a part to lock it. Roll everything else, or reroll one part.
4. Choose a look: flat cartoon, coloring page, clay toy, or detailed illustration.
5. Press **Illustrate** for an AI version. The instant assembled version remains available.
6. Name, save, download, or remix the character.

The main screen has a large character stage, one prominent Roll button, and a compact row of feature cards with lock controls. Desktop can show a side panel; mobile uses a bottom sheet. Children can operate the basic mixer through icons and previews without reading long descriptions. Support reduced motion and keyboard interaction.

Example: a pear-shaped purple monster with three sleepy eyes, noodle arms, tiny boots, and a magnificent moustache. Lock its eyes and moustache, then keep rolling its body and legs.

## Three independent choices

| Choice | Options | Meaning |
| --- | --- | --- |
| Controls | Simple / Detailed | How many traits can be edited independently |
| Rendering | Instant / AI illustration | Assembled assets or a generated image |
| Visual detail | Low / High | Bold simple forms or richer texture and smaller details |

Low detail is useful for coloring pages and easy-to-read characters. High detail can add fur, scales, stitching, accessories, lighting, and texture. Neither setting should change the selected anatomy.

Simple controls expose head, body, arms, legs, face, and palette. Detailed controls split face into eye count, eye shape, eyebrows, nose, mouth, teeth, and ears, and add horns, hair, surface, hands, feet, accessories, pose, and expression. Template-specific fields prevent irrelevant controls on a blob or a portrait bust.

Switching controls must preserve the existing recipe. Hidden detailed values remain stable until explicitly rerolled.

## Templates and parts

A template defines the character structure, available slots, attachment points, layering order, compatible parts, and camera framing. A part supplies a visual asset, descriptive prompt fragment, tags, and compatibility rules.

Initial monster templates:

- Blob: integrated head/body, eyes, mouth, arms, feet, optional accessories.
- Little Beast: separate head/body, arms, legs, face, ears/horns.
- Robot: mechanical equivalents using the same core slots.

Later templates: long creature, many-legged creature, food creature, full-body human caricature.

Use curated SVG parts for the instant renderer, with shared attachment conventions. Geometry-changing parts provide anchors for connected slots; a face follows the head's face box, and limbs follow body anchors. Layers account for arms behind the body and hands in front. This is more robust than simply stacking arbitrary pictures.

Randomization samples compatible parts using weights. A chaos setting changes the selection pool: mild favors harmonious combinations; wild favors unusual proportions and mismatches. Counts and attachments still need to be valid. Intentional asymmetry is an explicit option.

A text model may propose a recipe later, but its output must resolve to valid catalog IDs. Unrestricted descriptions belong to AI-only traits with a visible indication that the instant preview is approximate.

## One recipe, two renderers

The saved character recipe is the source of truth. It contains template and catalog versions, seed, chosen part IDs, custom trait descriptions, colors, locks, visual detail, and style.

**Instant rendering** assembles SVG assets locally. It is fast, works without an API key, and preserves locked traits exactly. The same versioned recipe reproduces the same assembled result.

**AI rendering** compiles that recipe into a concrete prompt, optionally accompanied by an exported preview image when the selected model accepts references. Generate the whole character in one pass initially; generating individual AI body parts introduces alignment, scale, and seam problems.

Locks guarantee that the recipe does not change. AI illustration can still drift in eye count, likeness, proportions, or accessory placement. Describe AI locks as instructions to preserve features, and retain the exact assembled preview. A reference image guides a model but does not guarantee exact adherence. Region editing is a later capability requiring separate model evaluation.

Keep recipe seed separate from provider image seeds: deterministic recipe generation does not imply deterministic AI pixels.

## Caricature Studio

Use a portrait-bust template first. Offer feature slots for base subject, hair, nose, ears, eyebrows, smile, clothing, and exaggerated proportions.

Example recipe: “An obviously drawn editorial caricature of politician A, with politician B's recognizable nose shape, oversized glasses, tiny shoulders, and a very serious expression.”

Feature attribution must be explicit in the recipe, such as nose.sourceSubject and hair.sourceSubject, so swapping a nose does not accidentally change the whole identity. Offer abstract traits too: enormous nose, windswept hair, pompous eyebrows.

For an initial release, use text-based public-figure references and a clearly drawn caricature style. Exact likeness is model-dependent and must be tested. Label exported public-figure mashups as AI caricatures. Family mode uses its own curated catalogs and prompt constraints; adult template packs are entered deliberately. Photo uploads and private-person likeness workflows are outside the first release.

## AI prompt construction

Build prompts deterministically from validated recipes; no extra text-model request is needed for ordinary rolls.

Order:

1. Illustration style, composition, and visual-detail level.
2. Template and body silhouette.
3. Explicit anatomy, counts, selected parts, and colors.
4. Expression, pose, and accessories.
5. Features to preserve, especially during remixes.
6. Background and output requirements.

Example:

“Full-body friendly cartoon monster, centered on a plain cream background. Low visual detail with bold outlines and large clear shapes. Pear-shaped purple body, no separate head, exactly three sleepy eyes in a horizontal row, a small smiling mouth, two long noodle arms, two short legs wearing yellow boots, and a large curled orange moustache. Playful and gentle. Entire character visible. No lettering.”

Keep model-specific request options in an adapter, separate from product prompts. Not all providers support negative prompts, seeds, transparency, references, or the same quality settings.

## Technical architecture

**Application:** Next.js App Router, TypeScript, React, schema validation, client-side SVG preview, server-side OpenRouter integration.

**Python:** a uv-managed tooling package for API smoke tests, batch model comparisons, prompt evaluation, and artifact inspection. Production logic stays in TypeScript; Python exercises the running app or consumes exported schemas and fixtures rather than reimplementing the mixer.

Suggested layout:

```text
app/
  page.tsx
  api/generations/route.ts
  api/generations/[id]/route.ts
components/mixer/
lib/
  catalog/
  recipes/
  random/
  rendering/
  prompts/
  providers/openrouter.ts
public/parts/
schemas/recipe.schema.json
fixtures/recipes/
tools/python/
  pyproject.toml
  src/monster_tools/
  tests/
.env.example
CONCEPT.md
```

Initial flow:

```text
Roll → seeded recipe → immediate SVG preview
                         ↓ Illustrate
Next.js server → validate → compile prompt → OpenRouter → save image + metadata
                         ↓
                 generation status → UI result
```

Use a generation record with queued/running/succeeded/failed states and a client request ID to suppress duplicate submissions. Associate every result with an immutable recipe snapshot. A late response must not overwrite a newer recipe's preview.

For a local MVP, start with one in-flight generation and server-side files plus SQLite records. Keep persistence behind a small interface. A hosted deployment needs durable image storage and generation execution that fits the host's timeout limits; introduce a worker when required by the chosen hosting platform.

## OpenRouter and configuration

OpenRouter documents a dedicated image-generation API and image-model capability discovery. Use the image endpoint through a server-only adapter. Select models through configuration after comparing them on the same recipe fixtures. Check reference-image and output-format support before sending those parameters.

Proposed `.env.example`:

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_IMAGE_MODEL=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
GENERATION_TIMEOUT_MS=120000
MAX_CONCURRENT_GENERATIONS=1
```

Store the real key in an ignored `.env` file and load it on the server. Never give the key a NEXT_PUBLIC_ prefix. Python tooling loads the same local configuration explicitly; avoid printing secrets in diagnostics. Commit placeholders only.

Record model ID, prompt version, recipe hash, request ID, latency, and reported usage/cost when available. Missing cost is unknown, not zero. User-triggered generation only; rolling does not make paid calls. Do not blindly retry ambiguous timeouts that may have already produced a billed image. A shared hosted version needs server-side access control, rate limits, and spending caps before exposure.

## Validation and uv tooling

Planned commands, to implement alongside the app:

```sh
uv run --project tools/python pytest
uv run --project tools/python monster-tools smoke --base-url http://localhost:3000
uv run --project tools/python monster-tools compare --fixtures fixtures/recipes --max-images 6
```

Default tests run offline. Paid live calls require an explicit flag and a maximum-image limit.

Meaningful checks:

- Rolling with locks never changes locked values, including when controls switch between simple and detailed.
- Seeded fixture rolls are stable within the pinned catalog and RNG version.
- Every sampled part is compatible with its template and produces valid attachment data.
- API rejects malformed recipes and unsupported model options before calling the provider.
- Generation status handles provider errors, missing images, and stale responses visibly.
- Prompts include the selected counts and attributed caricature features.
- Generated image payloads decode and report supported dimensions/MIME types.

Use a small contact sheet for visual comparison: requested anatomy, preserved features, friendliness, caricature readability, time, and cost. Human inspection is needed to assess humor and whether an image followed the recipe; schema tests cannot establish visual quality.

## First release and sequencing

**First: make rolling fun.** Two monster templates, a small coherent parts catalog, locks, individual rerolls, simple/detailed controls, low/high visual detail, seeded recipes, save/load, SVG/PNG export, and a coloring-page look. No API dependency for this stage.

**Second: add illustration.** OpenRouter adapter, one evaluated model, recipe-to-prompt compiler, optional reference preview, explicit generation button, status/error handling, and saved original plus AI result.

**Third: add adult caricatures.** Bust template, attributed feature swaps, curated presets, model comparison fixtures, and labeled exports.

Success criteria: users get an immediate character from a roll; can keep a favorite feature across rerolls; can recover and reproduce an assembled design; can generate an AI illustration from its saved recipe; and can distinguish precise assembled output from AI interpretation.

Defer accounts, public feeds, multiplayer, payments, model marketplaces, photo uploads, and per-part AI inpainting until the core loop is enjoyable and dependable.

## Sources

- Schmidt Spiele, Monsterjäger product page: https://www.schmidtspiele-shop.de/monsterjaeger — reference for the physical mixer's reveal mechanic.
- OpenRouter image-generation tutorial: https://openrouter.ai/blog/tutorials/image-generation/ — dedicated image API and optional references.
- OpenRouter image-model discovery: https://openrouter.ai/docs/api/api-reference/images/list-image-models — capabilities and model-specific parameter discovery.

External API details should be rechecked during implementation. This document is the product and implementation concept; no application or test package has been built yet.
