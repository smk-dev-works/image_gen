# First-iteration verification

Checked against FIRST_ITERATION.md on 25 October 2026.

- `pnpm build`: passes; the home page and SVG app icon are statically rendered.
- `pnpm typecheck`: passes. The production build also checks TypeScript.
- `pnpm test`: eight passing tests. Covers all 32 lock combinations for 20 rolls each, individual rerolls, deterministic seeds, 2,000 sampled valid recipes, exact storage round-trips, invalid saved data, and reduced-motion animation behavior.
- Browser: a finished monster appears on first load. Twenty successive rolls preserved locked eyes; all-locked state disables Roll; unlocking and rolling via Space/Enter worked. A direct mouth reroll changed only the mouth. Fresh start unlocked all five slots.
- Persistence: after saving a favorite, refresh restored its exact SVG, palette, and lock state. Rolling away and recalling it also produced identical SVG markup.
- Latency: sampled production rolls committed the new SVG in 1.2 ms, before the optional 320 ms reveal. Development measurements were 14–17 ms. These are local measurements, not a guarantee across devices.
- Artwork: visually inspected an 80-character contact sheet covering every eye, mouth, arm, and foot variant on each of the four silhouettes. Faces remained readable; limbs met bodies and no character was clipped. Slots occupy separate, consistent attachment regions.
- Export: browser download produced a valid 1200 × 1290 PNG. Inspected the downloaded image: the selected anatomy and palette matched the preview, and the whole character and shadow were visible.
- Responsive layout: tested 320 px, 375 px, and 1280 px widths. No horizontal overflow at either narrow width. A decorative arrow that crowded the Roll label on mobile was removed there and rechecked.
- Browser production smoke test: no captured console errors or warnings.

Preview screenshot: `.artifacts/monster-mixer-desktop.jpg` (local QA artifact, ignored by Git).

The five-person fun test in FIRST_ITERATION.md requires real participants and has not been performed. The app is ready for that playtest. AI illustration and additional templates remain deferred as specified.

## Stage 2 — kids’ AI illustrations (25 October 2026)

- `pnpm test`: 15 passing tests including prompt anatomy/colors/locks, all three looks, safe provider errors, missing images, raster validation, local-origin checks, immutable saved snapshots, concurrency limits, and persistent request-ID deduplication after both success and failure.
- `pnpm build` and `pnpm typecheck`: pass with the new server routes and client illustration studio.
- Live browser generation: GPT Image 2.5 Flare, high quality, Playful. Produced a valid 1024 × 1024 PNG in 18.9 seconds; provider-reported cost $0.05368. Visually inspected the friendly three-eyed clay monster, purple palette, waving hand and yellow boots. AI added its own surface details and small crest; exact feature fidelity is not guaranteed.
- Rolled to a different character while the paid request was running: the completed illustration retained its original snapshot and did not overwrite the newer mixer. “Remix original” restored the saved original. Refresh retained the local image collection and original recipe.
- Verified Realistic/Playful selection, saved-result switching, and narrow mobile layout. Fixed wrapping on the collection heading for narrow screens. Realistic rendering has offline prompt coverage but was not separately generated in this check.
- Image download returns HTTP 200, PNG MIME type, nosniff, and an attachment filename. File inspection confirms a decodable 1024 × 1024 PNG.
- Confirmed `.env.local` and generated artifacts are ignored by Git. No secrets appear in the client configuration response or committed example configuration.
- This is a local, synchronous integration. Public/multi-process hosting and crash recovery need additional infrastructure as described in README.md. No participant fun test or comparative model benchmark was performed.
