# Functional → Integration Test Migration Plan

Migrating the atrophied TestCafe **functional** suite
(`packages/browser/test/functional`) into the Vitest + Playwright + MSW
**integration** suite (`packages/browser/test/integration`).

Status: **migration in progress — all 18 categories have integration spec files.**

### Current integration test counts (2026-06-11)
- **43 integration spec files** across all categories
- **163 passing, ~29 failing (being fixed), 39 skipped**
- All 170 functional specs have been assessed; ~130 translated to integration tests,
  the remainder skipped with documented rationale (page-reload, Visitor.js dependency,
  live-edge-only, shadow DOM, known baseline failures).

### New handlers / fixtures added
- `handlers.js`: `acquireHandler` (identity/acquire endpoint)
- `mocks/acquireResponse.json`, `identityAcquireResponse.json`
- `mocks/sendEventWithIdentityCookieResponse.json`
- `mocks/personalizationFormBasedResponse.json`, `personalizationSetHtmlResponse.json`, `personalizationSpaResponse.json`
- `helpers/constants/consent.js`: consent constants (CONSENT_IN/OUT, ADOBE2_IN/OUT, IAB_*)
- `helpers/utils/legacyCookies.js`: AMCV cookie helpers for migration tests

---

## 1. How to run the functional suite (parity baseline)

The functional tests *do* run; they were just hard to invoke in a fresh/VPN'd
environment. Two gotchas, both solved:

| Symptom | Cause | Fix |
| --- | --- | --- |
| All edge tests fail instantly, `Network request failed` | `edge.adobedc.net` was DNS‑blackholed to `0.0.0.0` off‑VPN | Connect to VPN (edge now resolves to a real IP) |
| `browser disconnected` at ~6 min / `page.goto Timeout` to a `192.168.x.x` URL | TestCafe binds its browser proxy to the machine's LAN IP, which the headless browser can't reach (worse under VPN) | Pass **`--hostname localhost`** |

**Canonical command** (run from `packages/browser`):

```bash
EDGE_BASE_PATH="ee-pre-prd" ALLOY_ENV="int" \
  npx testcafe --hostname localhost playwright:chromium:headless \
  "test/functional/specs/**/*.js"
```

Verified: `Command Logic` category = **12 passed in 4s**; the edge‑dependent
`C11634155` (sendEvent + edge assertion) = **3 passed in 2s**.

### Full-suite baseline (VPN on, `--hostname localhost`)

**245 tests → 228 passed, 17 failed, 16 skipped (4m09s).** The 17 failures are
the "before" state — parity work must account for these (some are likely
atrophied/flaky, some env-specific like the `collect` endpoint / `RequestMock
CORS validation failed`):

- BrandConcierge `sendConversationalEvent` ×5 (`C2590433–437`) — `ClientFunction` errors
- Collect endpoint: `C455258`, `C8118`, `C9369211`
- Identity/ECID/cookie/protobuf ×4 (CORE identity from cookie, ECID after collect beacon, base64/protobuf fallbacks)
- `C2589` getLibraryInfo
- `C21886916` shadow-DOM click tracking
- Personalization `C5298194` ×2, `C5805676`

> Triage these before/while migrating their categories — don't blindly port a
> failing test. Re-run in CI for an authoritative baseline.

> The package script `pnpm test:functional` should be updated to add
> `--hostname localhost` so it works regardless of network interface.

### One pre-existing breakage already fixed
`functional/specs/Personalization/C17409728.js` imported
`createDecorateProposition.js` and `initDomActionsModules.js` from
`core/src/...`, but that whole Personalization component **moved to
`browser/src/...`**. This was a hard compile error that aborted the *entire*
TestCafe run. Imports repointed to `../../../../src/...` (constants such as
`decisionProvider`/`propositionInteractionType` legitimately remain in `core`).

---

## 2. Architecture: functional vs integration

| Concern | Functional (TestCafe) | Integration (Vitest + Playwright + MSW) |
| --- | --- | --- |
| Runner | `testcafe` | `vitest` browser mode (`@vitest/browser-playwright`) |
| Test code location | runs in **Node**, marshals into browser via `ClientFunction`/`t.eval` | runs **in the browser** directly |
| Page under test | remote `https://alloyio.com/functional-test/testPage.html` | blank Vitest page; library injected via `setupBaseCode` + `setupAlloy` |
| Alloy command call | `createAlloyProxy()` marshalling wrapper | `window.alloy("command", opts)` directly |
| Network | **live int edge** (`edge.adobedc.net`) | **MSW mocks** (`helpers/mswjs/handlers.js`) |
| Request inspection | `RequestLogger` / `networkLogger` | `networkRecorder.findCall(pattern)` |
| Response control | whatever the live edge returns | deterministic JSON fixtures in `helpers/mocks/` |
| Console assertions | `createConsoleLogger().warn.expectMessageMatching` | `vi.spyOn(console, …)` + `searchForLogMessage` |
| Setup/teardown | `createFixture` per file | auto fixtures in `helpers/testsSetup/extend.js` (`worker`, `networkRecorder`, `alloy`) |

**Key consequence:** integration tests are *hermetic* — no live edge, no VPN,
deterministic. This is the entire reason for the migration. The functional
suite remains the **behavioral source of truth**; we translate intent, not
transport.

---

## 3. Parity matrix (functional categories → existing integration coverage)

170 functional spec files. ~150 (88%) touch the edge and need MSW mocks.

| Functional category | # specs | Integration today | Gap |
| --- | ---: | --- | --- |
| Audiences | 3 | `Audiences/` (2) | small |
| BrandConcierge | 1 | — | full |
| CNAME | 1 | `CNAME/cname` (1) | likely done — verify |
| Command Logic | 10 | `Command Logic/` (7) | mostly done — verify gaps |
| Config Overrides | 4 | `Command Logic/configOverrides` (1) | partial |
| Consent | 32 | — | **full (largest gap)** |
| Context | 7 | — | full |
| Data Collector | 13 | `Advertising/` (7)* | partial — map carefully |
| ID Migration | 7 | — | full |
| Identity | 20 | `Personalization/identityMapPersistence`* | mostly full |
| Install SDK | 3 | — | full |
| LibraryInfo | 1 | — | full |
| Location Hints | 2 | — | full |
| Logging | 4 | — | full |
| MediaCollection | 3 | `StreamingMedia/mediaEvents` (1) | partial |
| Migration | 9 | — | full |
| Personalization | 43 | `Personalization/applyPropositions`, `Target/`, `AJO/` (4)* | **partial (largest category)** |
| RulesEngine | 3 | — | full |
| Visitor | 4 | — | full |

\* Integration uses topic-oriented folders (`Advertising`, `AJO`, `Target`,
`StreamingMedia`) that don't map 1:1 to functional folder names. A first task is
a **spec-level** crosswalk (by test-case ID / behavior), not folder-level.

---

## 4. Helper translation layer (build once, reuse everywhere)

Before bulk migration, port the functional helper idioms to integration
equivalents so specs translate mechanically. Most already exist; the gaps:

| Functional helper | Integration equivalent | Action |
| --- | --- | --- |
| `createAlloyProxy()` (`alloy.sendEvent(opts)`) | direct `window.alloy("sendEvent", opts)` | none — inline |
| `…Async` / `…ErrorMessage` proxy variants | `await`/`try-catch` on the real promise | document pattern |
| `createConsoleLogger().lvl.expectMessageMatching` | `vi.spyOn(console,lvl)` + `searchForLogMessage` | extend `searchForLogMessage` to cover regex + "no message" cases |
| `networkLogger.<endpoint>Logs` (RequestLogger) | `networkRecorder.findCall(regex)` | none — exists |
| `responseStatus(requests, [200,207])` assertion | assert on `call.response.status` | port `assertions/responseStatus` |
| `createCollectEndpointAsserter` | — | port if any migrated spec needs `/collect` |
| `assertions/advertising.js` | — | port for Data Collector/Advertising specs |
| `constants/configParts/*` (compose, orgMainConfigMain, debugEnabled, consent…) | `helpers/alloy/config.js` (single object) | port the `configParts` building blocks the specs actually use |
| `cookies.js`, `setLegacyIdentityCookie`, `createAdobeMC` | `helpers/utils/deleteCookies` + new | port for Identity/Migration/Visitor |
| `dom/addHtmlToBody`, `preventLinkNavigation` | DOM is real in browser mode | port small DOM utils for Personalization |
| MSW response fixtures (`helpers/mocks/*.json`) | — | **biggest new work**: capture/author a fixture per edge behavior |

**MSW fixtures are the crux.** Each edge‑dependent spec needs a handler +
response fixture that reproduces the relevant slice of the live response
(destinations, propositions, consent handles, identity, media, etc.). Strategy:
use `networkRecorder` against the *live* functional run (now that it works) to
capture real int responses, then sanitize them into `helpers/mocks/`.

---

## 5. Execution sequence

Per your direction, full plan first; then (separately) a **pilot category**
before bulk work.

1. **Baseline capture** (in progress): run the full functional suite with the
   canonical command; record pass/fail per spec as the "before" state. Re-run in
   CI for an authoritative baseline.
2. **Crosswalk**: produce a spec-level map (functional file → existing
   integration spec or "to migrate"), so we don't re-migrate already-covered
   behavior (Command Logic, CNAME, parts of Audiences/Personalization).
3. **Helper layer**: port the helpers in §4; add a fixture-capture script that
   drives the live edge via `networkRecorder` and writes sanitized mocks.
4. **Pilot**: migrate one self-contained category end-to-end for review.
   Recommend **Consent** (32 specs, zero integration coverage, well-bounded
   behavior, exercises set-consent + queueing — proves the fixture pipeline) or
   **Command Logic** (finish the last 3 — fastest win, validates the pattern).
5. **Scale** category-by-category, largest-gap first: Consent → Identity →
   Personalization → Data Collector → Migration → Context → the long tail.
6. **Decommission**: once a category reaches parity, delete the functional
   specs + now-unused functional helpers; update `pnpm test:functional` /
   `.testcaferc.json` and CI. Remove TestCafe deps when the last spec is gone.

---

## 6. Open questions / risks

- **Fixture fidelity**: live int responses vary (timestamps, ECIDs, ordering).
  Fixtures must capture only assertion-relevant fields; over-fitting causes
  brittle tests. Need a sanitization convention.
- **Behaviors that need a real edge**: some specs may assert on round-trip
  semantics hard to mock faithfully (e.g., real identity stitching, CNAME TLS).
  Flag these; a few may justifiably *stay* functional or move to a thin
  smoke-suite.
- **Already-migrated coverage**: confirm the existing integration specs truly
  cover their functional counterparts before deleting anything.
- **Topic vs ID folder naming**: agree on integration folder/naming convention
  (keep topic-oriented like `Advertising`/`AJO`, or mirror functional categories).
</content>
