# Plan for capability extraction

## Goal

To remove all web browser specific code from `@adobe/core` and into `@adobe/alloy` (`packages/browser`). This will be accomplished via dependency injection: a `platform` object that is passed into core's `createInstance` function.

## Browser API usage

- Network requests (`fetch`, `navigator.sendBeacon`): used to send Edge/service requests; uses `sendBeacon` during unload with `fetch` fallback.
- DOM rendering + script loading (`window`, `document`, `DOMContentLoaded`): used to create/append/query DOM for personalization and to register DOM/window event listeners.
- local/session storage (`localStorage`, `sessionStorage`, `indexedDB`): used to persist SDK state (consent, rules engine, logging, assurance token params) and push config (IndexedDB).
- cookies (`js-cookie` / `document.cookie`): used to read/write identity and probing cookies (e.g., apex-domain detection).
- global window state (instance queue, monitors: `window.__alloyNS`, `window.__alloyMonitors`): used for snippet-style pre-init queues and optional monitor hooks.
- context gathering (user agent, user agent client hints, viewport/screen, page location/referrer): used to populate request context sent with network calls.
- service worker + push notifications (`navigator.serviceWorker`, `Notification`, `PushManager`): used to register SW, manage subscriptions, handle push events, and track interactions.

## Implementation

These API usages need to organized into platform-agnostic "capabilities". They should not just be polyfills of browser APIs, because different platforms will have different needs. For example, an edge worker does not need to send a beacon or a push notification. A Node.js runtime may need to deal with many identities, rather than just one.

## Principles

- **Gradual migration:** Keep PRs small and reviewable. Prefer one capability domain (or one tightly related slice) per PR.
- **Browser behavior first:** During migration, preserve current browser behavior and test coverage. Do not block progress on full non-browser support.
- **No large rewrites:** Prefer adapter layers and dependency injection over broad refactors in a single change.
- **Temporary dual-paths are acceptable:** It is okay to keep browser defaults/fallbacks while capability wiring is being introduced.
- **Portability is a final milestone:** `@adobe/alloy-core` does not need to be usable in Node/worker runtimes until the migration is complete.

## Plan

This plan is intentionally incremental to reduce reviewer burden. Earlier phases may still rely on browser globals; non-browser runtime support is only expected in the final phase.

### Phase 1 - Scaffolding (no behavior change)

- Thread a `platform` object through core instance creation.
- Keep current browser defaults and exports working.
- Add types/contracts for capabilities, but do not require all capabilities yet.

### Phase 2 - Capability extraction by domain

- Migrate call sites capability-by-capability, one domain at a time.
- For each domain: add/adjust capability interface, wire browser adapter, migrate usages, keep tests green.

### Phase 3 - Component and bootstrap ownership split

- Move browser-only bootstrap responsibilities to `packages/browser`.
- Keep core focused on command execution, lifecycle orchestration, request/response handling, and shared logic.
- Define which components are core-owned vs browser-owned and update composition points accordingly.

### Phase 4 - Cleanup and portability hardening

- Remove temporary browser fallbacks/shims from core.
- Remove direct browser-global reads from core module scope/runtime paths.
- Move browser-only dependencies from core into browser package where applicable.
- Add final non-browser readiness checks (for example, Node import smoke tests).

At the end of Phase 4, core should be portable and usable outside browser environments.

## Capabilities

### State (`window.*` values)

This migration will have to happen last, after all `window.*` APIs are moved to capabilities. This will largely be niche and use-case specific.

**Bootstrap-specific APIs:** `window.__alloyNS`, `window.__alloyMonitors`, `window[instanceName].q`

**Core needs:**

- Read pre-init command queue (snippet pattern)
- Read/merge monitor hooks for logging/debugging

**Examples in the current codebase:**

- **Snippet bootstrap queue:** `window.__alloyNS` is read to discover instance names, and `window[instanceName].q` is drained/rebound to real instance execution (`packages/core/src/core/index.js`, `packages/browser/src/standalone.js`, `packages/browser/src/baseCode/index.js`).
- **Global monitors:** `window.__alloyMonitors` is read and merged with configured monitors for logging hooks (`packages/core/src/core/getMonitors.js`).
- **Legacy Visitor + opt-in bridge:** `window.Visitor` and `window.adobe.optIn` are used to fetch ECID and gate behavior by legacy opt-in (`packages/core/src/components/Identity/visitorService/getVisitor.js`, `packages/core/src/components/Identity/visitorService/awaitVisitorOptIn.js`).
- **Advertising partner globals:** `window.ID5` and `window.ats` are used as third-party SDK entry points for identity resolution (`packages/core/src/components/Advertising/identities/collectID5Id.js`, `packages/core/src/components/Advertising/identities/collectRampId.js`).

These are not just browser APIs; they are ambient global-state contracts with snippets and third-party libraries. They likely need a dedicated capability (or browser-only adapters) rather than direct `window.*` access from core.

Browser-specific bootstrapping should likely stay in `packages/browser`, with core accepting normalized inputs (for example, `monitors[]` and drained queued commands) rather than reading globals directly.

### Network

**APIs:** `fetch`, `navigator.sendBeacon`, `Blob`

**Core needs:**

- Send HTTP POST requests (with credentials: include for cookies)
- Optional "fire and forget" requests during unload (beacon semantics)
- Parse response body/headers/status

**Interface idea:**

```typescript
interface NetworkCapability {
  sendRequest(
    url: string,
    body: string,
    options: { useSendBeacon?: boolean },
  ): Promise<NetworkResponse>;
}
```

The beacon-vs-fetch decision could live here; platforms without beacon just ignore the flag.

### Storage

**APIs:** `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`

**Core needs:**

- Namespaced key-value persistence (consent hashes, rules engine state, debug flag)
- Session-scoped storage (logging state, assurance params)
- Structured DB for push notification config (IndexedDB)
- Sending identity, cluster information with requests to the Edge Netwwork

**Interface idea:**

```typescript
interface StorageCapability {
  session: KeyValueStorage;
  persistent: KeyValueStorage;
  structuredStore?: StructuredStorage; // optional for push
}
```

Node.js could back this with in-memory/files; edge workers may skip persistent entirely.

#### Open Questions:

- should cookies be included in this storage capability, or in a separate one?

### DOM / Rendering

**APIs:** `document`, `window`, `DOMContentLoaded`, `MutationObserver`, selector APIs

**Core needs:**

- Personalization: create/append/insert/remove nodes, await selectors, hide/show elements
- Script loading: append `<script>` to `<head>`/`<body>`
- Click tracking: query elements, add event listeners
- In-app messages: create iframes, overlay divs

**Interface idea:**

```typescript
interface DOMCapability {
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): Element[];
  createElement(tag: string, attrs?: object): Element;
  appendToHead(element: Element): void;
  appendToBody(element: Element): void;
  awaitSelector(selector: string, timeout?: number): Promise<Element[]>;
  onReady(callback: () => void): void;
  // etc.
}
```

Non-browser platforms would stub this out or throw if personalization components are included.

### Context / Environment

**APIs:** `window.location`, `document.referrer`, `navigator.userAgent`, `navigator.userAgentData`, `screen`, `matchMedia`

**Core needs:**

- Page URL, referrer, protocol (for request context XDM)
- User agent string, high-entropy client hints
- Viewport/screen dimensions, orientation
- Browser detection (for rules engine, third-party cookie defaults)

**Interface idea:**

```typescript
interface ContextCapability {
  getLocation(): {
    href: string;
    hostname: string;
    protocol: string;
    search: string;
    pathname: string;
  };
  getReferrer(): string;
  getUserAgent(): string;
  getHighEntropyHints?(): Promise<Record<string, unknown>>;
  getViewport(): { width: number; height: number };
  getScreenOrientation?(): "portrait" | "landscape" | undefined;
}
```

#### Open Questions:

Context will differ greatly by platform. This could be a use-case that argue that capabilities _and components_ should be able to be injected into core.

### Service Worker / Push (optional, browser-only)

**APIs:** `navigator.serviceWorker`, `PushManager`, `Notification`, `indexedDB` (in SW context), `sw.clients`

**Core needs:**

- Register service worker
- Subscribe to push, retrieve subscription details
- Listen for push/notification events
- Track notification interactions

This is a fairly self-contained feature. Could be:

- A separate optional capability injected only when push is configured
- Or kept entirely in `packages/browser` with just the request-building logic in core

### Identity & Crypto

**APIs:** `crypto.subtle`, `crypto.randomUUID`

**Core needs:**

- Generate random UUIDs
- Generate SHA-256 hashes

The browser uses the `uuid` package, but other environments could use built-in `crypto.randomUUID()`.

### General Open Questions

- **Push notifications:** Keep entirely in browser package, or split (config/request building in core, SW lifecycle in browser)?
- **Context:** Could be "read-only" data passed in at init rather than a capability object with methods. Simpler for non-browser runtimes.
