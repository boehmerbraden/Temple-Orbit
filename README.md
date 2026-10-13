# Temple Orbit

An original ancient-temple marble-shooter adventure. Six handcrafted paths, a rotating stone guardian, matching and reconnecting chains, four relic powers, synthesized music and effects, and local progression. No accounts, servers, external assets, CDNs, analytics, or ChatGPT services are used by the game.

## Play

Open **Temple-Orbit.html** in a modern desktop browser. Everything is embedded in that single file. For phones and tablets, serve the game on any static host and open its URL in Safari or Chrome; some mobile file-preview apps do not execute downloaded HTML.

Desktop: aim with the mouse; left-click to fire; right-click or Space to swap the loaded and next marble; Escape to pause. Touch: press and drag on the board to aim, then release to fire. Use the Swap button. A canceled touch does not fire. The game pauses automatically when its tab loses focus or becomes hidden.

Match at least three marbles of one color. Removing a group pulls the leading chain backward. Matching colors at the reconnection can produce escalating chain multipliers. Clear the finite procession before its leading marble reaches the eclipse portal. Three lives per expedition. Retries reset the current temple's score; restarting starts a fresh three-life expedition at the selected temple.

Gold-ringed relic marbles activate when destroyed:
- Clock: slows the procession for six seconds.
- Arrow: reverses travel for six seconds.
- Starburst: destroys nearby marbles.
- Crosshair: extends the aiming guide for twelve seconds.

Long shots earn +100; shots detected passing through an open chain gap earn +250. Colors have different geometric marks in addition to their hue. Sound starts after a user gesture and can be muted. Temple unlocks, per-level records, overall high score, and sound preference save locally; an in-progress round is not restored after a reload. Saving follows the browser/origin, so file and hosted versions do not share saves.

## Independent hosting

### GitHub Pages
1. Add this folder's contents to a repository's `main` branch, including `.github/workflows/pages.yml`.
2. In repository Settings → Pages, select Deploy from a branch, `main`, `/ (root)`.
3. Push a commit. GitHub’s Pages workflow publishes the site. The included validation workflow runs the tests and standalone build independently.

Source repository: https://github.com/boehmerbraden/Temple-Orbit. Enable GitHub Pages using the steps above to publish the game.

### Any static host
Upload `dist/index.html`, or upload the modular `index.html`, `style.css`, and `src/` folder together. There are no environment variables, API keys, backend requirements, or paid services. The single-file release is also suitable for hosts that accept a dragged-and-dropped folder.

## Development

Node 20+ is needed only for development commands; no installation of dependencies is needed.

```sh
npm test
npm run build
npm run test:autoplay
```

- `src/core.js`: DOM-free arc-length path, finite chain, segment reconnection, insertion, matching, powers, and swept projectile collision.
- `src/game.js`: Canvas rendering, procedural artwork, UI, inputs, local storage, and fixed-step loop.
- `src/art.js`: cached temple scenery, gem sprites, carved guardian, atmospheric lighting and portal rendering.
- `src/audio.js`: original oscillator-based soundtrack and effects using Web Audio.
- `style.css`: responsive interface.
- `tests/`: deterministic simulation and DOM-adapter integration tests.
- `build.cjs`: bundles the modular source into the standalone release.

The lightweight Canvas 2D implementation deliberately avoids Phaser/CDN loading to make this release small and offline-capable. Simulation runs at 120 fixed updates per simulated second; rendering uses requestAnimationFrame. Tab stalls are clamped. Actual frame rate depends on the device and has not been benchmarked in a real browser.

## Validation status

23 automated tests pass. Coverage includes every path's curvature/spacing and shooter clearance, insertion on both sides of an impact, continuous collision detection, direct matches, separated groups, three-stage reconnection combos, powers, reverse/slow motion, finite-wave win/loss, sustained firing and spacing invariants on all six levels, control handlers, lives/retries, progression, storage reload, failed storage, and pause handling.

A seeded automated player also completed all six levels through ordinary projectiles and swaps, without removing marbles or overriding ammo. With the faster pacing, completion times ranged from 49.5 to 78.7 simulated seconds. This is a feasibility check, not a measurement of human difficulty.

The UI tests use a lightweight DOM/Canvas adapter, not a real browser. Visual layout, audible output, touchscreen feel, actual browser storage, and sustained 60 FPS still require real desktop/mobile playtesting. Do not interpret passing automated tests as that final human acceptance pass.

All names, level layouts, procedural graphics and synthesized sounds are original to this project. This is genre-inspired work and includes no Zuma artwork, music, or branding.

## Presentation and pace update

The six layouts, wave sizes, color counts, relic distribution, scoring, controls, and matching rules are unchanged. Forward travel starts at **1.65× the original speed**, smoothly ramps with elapsed level time, and gains a limited endpoint pressure boost. The maximum is **2.4× original speed**; this is a cap, not the speed used throughout a round.

`PACE` in `src/core.js` centralizes tuning: `startMultiplier`, `maxMultiplier`, `rampSeconds`, `endpointZone`, `endpointBoost`, and `responseSeconds`. An exponential response smooths changes independently of the update rate. Reverse/slow multipliers, gap retraction speed, shot speed, shot cooldown and match rules are preserved. Regression tests compare 30/60/120 Hz movement and exercise maximum-speed reconnection.

The new presentation uses a separate cached procedural art module, six lighting palettes, beveled tracks, stone carvings, foliage, reflective gems, an animated jade guardian, a swirling danger portal, launch sparks, debris and restrained match shake. Reduced-motion preferences suppress shake and idle animation. Effects are capped at 450 particles; the DOM HUD updates at about 12 Hz while canvas rendering continues every animation frame. Mobile layout preserves circular marbles and includes a compact landscape layout with a reachable pause control.

Visual quality, audio mix and actual-device frame rate have not been verified through real-browser playtesting in this environment. All automated simulation and DOM-adapter tests pass.
