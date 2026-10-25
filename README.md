# Monster Mixer

A local, playful character mixer. Roll a Blob monster, lock the bits you love, reroll individual parts, choose a palette, save up to twelve favorites, and download a 1200 × 1290 PNG.

## Run

Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For a production build, use `npm run build` followed by `npm start`.

```sh
npm test
npm run typecheck
```

## First iteration

The catalog has four silhouettes, six eye arrangements, six mouths, four arm pairs, four foot pairs, and six palettes. All artwork is original inline SVG, composed instantly in the browser. Rolling does not call an API. The seed, catalog version, parts, palette, and locks live in one validated recipe. An unlocked reroll always changes the selected feature; palette changes are deliberate.

Current character and favorites persist in this browser's local storage. Clearing browser data clears the collection. A storage warning appears if saving is unavailable. Downloaded PNGs use the same SVG artwork as the preview on a cream background. Fresh start unlocks every feature and creates a new character and palette; it keeps favorites.

This implements the playable slice in FIRST_ITERATION.md plus the kids’ stage 2 illustration flow. Additional templates, adult caricatures, accounts, and shared galleries remain later stages. The five-person fun test still needs real participants; implementation checks cannot establish that people enjoy it.


## AI illustration — kids first

Create `.env.local` in the project root (never commit the real key):

```dotenv
OPENROUTER_API_KEY=your-key
OPENROUTER_IMAGE_MODEL=openai/gpt-image-2.5-flare
GENERATION_TIMEOUT_MS=180000
```

Restart the server after changing configuration. The default model is GPT Image 2.5 Flare with high quality and square framing, selected for quality and speed in a playful character workflow. The adapter uses OpenRouter’s dedicated `POST /api/v1/images` endpoint, with no SDK dependency. Other models can be configured; OpenAI models receive `quality: high`, and other models receive only the common square aspect ratio and one-image setting. Confirm capabilities before changing models.

Choose **Playful** (clay storybook), **Realistic** (tactile creature puppet), or **Ultra Crazy** (surreal jelly and cosmic confetti), then press **Illustrate my monster**. Each click uses OpenRouter credits; rolls stay local and free. Prompts come from validated catalog recipes, with explicit eye counts, anatomy, colors, and locked features. No free-form child prompts or uploads are accepted. AI may reinterpret details; the exact mixer recipe remains available through **Remix original**.

Images and immutable recipe/model/prompt/status/latency/cost records are saved under ignored `.artifacts/generations/`. The collection shows the latest 24 generation records (successful illustrations appear as cards). Download the AI image separately from the original mixer PNG. Files survive browser refresh and server restart; removing the artifact folder removes them. Back up this folder if you want to keep the collection.

Generation is synchronous with one paid request per local server process, a bounded provider timeout, and persistent request IDs to prevent repeat billing for a retried ID. There are no automatic paid retries. If a browser connection is lost, refresh the collection before trying again. A record left running after a process crash is an uncertain outcome; check OpenRouter activity before creating another request. Missing cost is unknown, never assumed zero.

This is a local app: illustration endpoints accept loopback hosts and reject cross-origin requests. Keep the server bound to loopback. Public deployment needs authentication, durable storage, shared concurrency/rate/spending limits, and generation execution appropriate to the host’s timeout.

Provider references: [OpenRouter Image API](https://openrouter.ai/docs/guides/overview/multimodal/image-generation), [OpenAI image model guidance](https://developers.openai.com/api/docs/guides/image-generation).
