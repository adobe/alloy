# Functional → Integration Test Migration

The TestCafe functional suite that lived in `packages/browser/test/functional`
has been fully replaced by the Vitest browser-mode (Playwright + MSW)
integration suite in `packages/browser/test/integration` (PDCL-13402). The
TestCafe specs, config, scripts, and dependencies have been removed from this
package. The original specs are available in git history before the removal
commit.

## Running

```bash
pnpm run build
pnpm exec vitest run --project=browser/integration
```

CI runs the same project through `pnpm run test` in
`.github/workflows/quality-checks.yml`.

## Traceability

Each ported test keeps its TestRail case ID as the title prefix (for example
`C2580: ...`). Personalization case-by-case notes live at the top of
`specs/Personalization/personalization.spec.js`.

## Live Experience Edge tests

Most tests are hermetic and use MSW fixtures. Tests that depend on behavior only
Experience Edge or Target can produce leave the request unhandled; the worker
uses `onUnhandledRequest: "bypass"`, so they reach the real edge (mostly the
`ee-pre-prd` base path) and need network access. Each one carries a comment
explaining why it is live. They are in:

- `specs/Command Logic/sendEventCommand.spec.js` (C13819)
- `specs/CNAME/cname.spec.js` (C148846)
- `specs/Identity/identity.spec.js` (C5594872, C6842980, C6842982)
- `specs/Migration/migration.spec.js` (C8085779, C8085780 with live at.js and
  Target)
- `specs/Personalization/liveTarget.spec.js` (C3272624, C44363, C8631576,
  C8631577)
- `specs/Personalization/mergedMetrics.spec.js` (C5805676)

## Not ported

Cases that cannot run faithfully in browser mode are recorded as
`// Formerly TestCafe CXXXXX (...): ... Not ported: <reason>.` comments next to
the closest related tests. Search for `Formerly TestCafe` to list them. They are
mostly true cross-origin identity behavior (the runner page has a single
origin), cookies scoped to `alloyio.com`, HTTPS-only cookie attributes, and a
Target activity that no longer qualifies headless Chromium.

Tests that were already disabled in the TestCafe suite were dropped without a
replacement.
