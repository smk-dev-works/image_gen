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

This implements the playable slice in FIRST_ITERATION.md. AI illustration, additional templates, accounts, and shared galleries remain later stages. The five-person fun test still needs real participants; implementation checks cannot establish that people enjoy it.
