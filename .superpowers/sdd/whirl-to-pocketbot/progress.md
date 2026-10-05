# SDD ledger — plan: whirl→PocketBot rebrand (conversation plan)

Tasks: 0-snapshot, 1-content-replace, 2-file-renames, 3-web-brand-swap, 4-mobile-brand-swap, 5-readme, 6-derived-artifacts, 7-verify
Task 1: complete (commit 7dc5906, verify: protected URLs 8/36/6 intact, 0 unprotected whirl in 375 files)
Task 3: complete (commit c37c738, v2 static mark + pb-logos assets; tsc --noEmit -> 0 errors; artifact-runtime rebuilt, old protocol strings 0)
Ruling Task 3: marketing logo uses theme-aware bg-foreground, not a baked brand color — pb-logos defines no marketing accent; cost if wrong: recolor one class later.
Ruling Task 3: bun install pulled ahead of Task 6 — v2 tsc needs the renamed workspace links to resolve.
Task 4: complete (commit 2ca638e; mobile tsc -> 0 errors; app.json valid; Ruling: mark stays vector via react-native-svg with new pb-logos geometry, keeps color prop theme-aware instead of fixed-color PNG)
Task 5: complete (commit 03b23a2, README header replaced with user snippet verbatim)
Task 6: complete (bun.lock regenerated + artifact-runtime.js rebuilt in Task 3; email logo raster deferred — windows-only Playwright script, TODO added; commit a620b1b)
Final: minor (deferred): pocketbot-mark.png still old swirl raster until render-email-logo.mjs rerun
