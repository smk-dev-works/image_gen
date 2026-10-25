# First iteration: a monster worth rolling again

## Goal

Make a single Blob monster template fun within the first 30 seconds: see a character immediately, roll a surprising variation, lock a favorite feature, and reroll the rest without losing it.

This is the recommended first slice of the broader Monster Mixer concept in CONCEPT.md. The assumption to test is that surprise plus control makes people want to keep creating, even before AI illustration is available.

## The first experience

Open directly onto a finished, friendly monster and a large **Roll!** button. No setup or template picker.

Press Roll to reveal a new combination with a short, playful animation. Show five illustrated feature controls: body, eyes, mouth, arms, and feet. Tap a lock to keep a feature; tap its preview to reroll only that feature. A visible palette control changes the colors.

After finding a favorite, download it as a PNG or save its recipe locally to continue later. Include a clear reset for starting fresh. Respect reduced motion and make every action available by keyboard.

## Small, coherent catalog

- One integrated head/body Blob template.
- Four silhouettes, six eye arrangements, six mouths, four arm pairs, and four foot pairs.
- Six curated palettes with readable contrast.
- One consistent cartoon style with clean outlines and expressive shapes.

Treat these counts as a starting budget. Every combination must attach cleanly and remain readable. Replace weak parts before expanding the catalog. Distinct expressions and silly proportions matter more than the number of possible combinations.

## Build only the core loop

Use local SVG composition for immediate feedback. Store a versioned, seeded recipe; locks preserve selected trait values exactly. Keep rolling free of network requests. Persist the current recipe and a small favorites collection locally, and support PNG download.

Keep one clear visual hierarchy: character first, Roll second, feature controls third. Give locks an unmistakable active state. Animation should make the reveal satisfying without delaying repeated rolls.

Defer the second template, detailed anatomy controls, visual-detail settings, style selection, accounts, public galleries, and caricatures. AI illustration follows once the core loop passes the playtest; it should use the saved recipe and remain an explicit action.

## Reviewable finish

The iteration is ready for a playtest when:

- A character appears immediately on opening, and each roll updates locally within 200 ms before any optional reveal animation.
- Locking any combination of features preserves their selected values across 20 consecutive rolls.
- Every catalog part fits the template without floating limbs, clipped eyes, or an obscured mouth.
- Refresh restores the current character; saving and reopening a favorite reproduces it exactly.
- A PNG download matches the visible character and includes the entire monster.
- The loop works on a narrow mobile screen, with keyboard controls and reduced motion.

## Fun test

Ask five people to try it without a demonstration. Watch whether they can roll, lock a feature, reroll, and save a favorite within one minute. Then give them two minutes of unstructured play.

The initial target is that at least four understand locks without help, and at least three voluntarily keep rolling or create a second favorite. Ask which moment made them smile and what felt repetitive. These are proposed targets, not validated findings.

If people stop early, improve expressions, combinations, and the reveal before adding breadth. If they enjoy assembling monsters and want a more polished version of a favorite, that is the signal to add the first AI illustration flow.
