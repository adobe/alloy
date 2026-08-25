/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import {
  getInlineScripts,
  getRemoteScripts,
  executeInlineScripts,
  executeRemoteScripts,
} from "../../../../../../src/components/Personalization/dom-actions/scripts.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";
import { createFragment } from "../../../../../../src/components/Personalization/dom-actions/dom/index.js";
import { testResetCachedNonce } from "../../../../../../src/components/Personalization/dom-actions/dom/getNonce.js";
import { DIV } from "@adobe/alloy-core/constants/tagName.js";
import { createNode } from "@adobe/alloy-core/utils/dom";

// A data: URL that loads successfully (fires onload) without hitting the network.
const LOADABLE_SRC = "data:text/javascript,void 0";
// An unreachable URL so the load fails fast (connection refused -> onerror).
const FAILING_SRC = "http://127.0.0.1:1/nonexistent.js";
// A data: URL whose body uses module-only syntax (`export`) and has a side
// effect. Loaded as an ES module it evaluates successfully; loaded as a classic
// script the `export` is a SyntaxError, so onload never fires. It therefore
// proves `type="module"` was honored end-to-end, not just copied as a string.
const MODULE_SRC = `data:text/javascript,${encodeURIComponent(
  "window.__alloyModuleExecuted = true; export default 1;",
)}`;

// The re-created head scripts only carry type/src/nonce/the functional
// allowlist (no test marker attribute), so snapshot the <head> scripts before
// each test and remove anything added during it.
let preExistingHeadScripts;

const removeInjectedScripts = () => {
  document.head.querySelectorAll("script").forEach((node) => {
    if (!preExistingHeadScripts.has(node)) {
      node.remove();
    }
  });
};

// Inline module scripts execute asynchronously and emit no load event, so poll
// for a side effect rather than awaiting a promise.
const waitFor = async (predicate, timeout = 2000) => {
  const start = Date.now();
  while (!predicate() && Date.now() - start < timeout) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return predicate();
};

describe("Personalization::helper::scripts", () => {
  beforeEach(() => {
    cleanUpDomChanges("fooDiv");
    preExistingHeadScripts = new Set(document.head.querySelectorAll("script"));
  });
  afterEach(() => {
    cleanUpDomChanges("fooDiv");
    removeInjectedScripts();
    testResetCachedNonce();
  });
  it("should get an inline script", () => {
    const fragmentHTML =
      "<script>console.log('test');</script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);
    const inlineScripts = getInlineScripts(fragment);
    expect(inlineScripts.length).toEqual(1);
  });
  it("should return null if inlineScript doesn't have text code", () => {
    const fragmentHTML =
      "<script></script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);
    const inlineScripts = getInlineScripts(fragment);
    expect(inlineScripts.length).toEqual(0);
  });
  it("should get a remote script element", () => {
    const fragmentHTML =
      "<div id='fooDiv'><script src='http://foo.com' ></script><script>console.log('test');</script></div>";
    const fragment = createFragment(fragmentHTML);
    const remoteScripts = getRemoteScripts(fragment);
    expect(remoteScripts.length).toEqual(1);
    expect(remoteScripts[0].tagName).toEqual("SCRIPT");
    expect(remoteScripts[0].getAttribute("src")).toEqual("http://foo.com");
  });
  it("should get a empty array if remote script doesn't have url attr", () => {
    const fragmentHTML =
      "<div id='fooDiv'><script src='' ></script><script>console.log('test');</script></div>";
    const fragment = createFragment(fragmentHTML);
    const remoteScripts = getRemoteScripts(fragment);
    expect(remoteScripts.length).toEqual(0);
  });
  it("should execute inline script", () => {
    const fragmentHTML =
      "<script>console.log('test');</script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);
    const inlineScripts = getInlineScripts(fragment);
    const container = createNode(DIV);
    vi.spyOn(container, "appendChild");
    vi.spyOn(container, "removeChild");
    executeInlineScripts(container, inlineScripts);
    expect(container.appendChild).toHaveBeenCalledWith(inlineScripts[0]);
    expect(container.removeChild).toHaveBeenCalledWith(inlineScripts[0]);
  });
  it("should route an inline module to the head-script path, not the inline path", () => {
    const fragment = createFragment(
      `<script type="module">export default 1;</script><script>console.log('classic');</script>`,
    );
    // The classic inline script stays on the synchronous inline path.
    const inlineScripts = getInlineScripts(fragment);
    expect(inlineScripts.length).toEqual(1);
    expect(inlineScripts[0].getAttribute("type")).toBeNull();
    // The module is picked up as a head script instead.
    const remoteScripts = getRemoteScripts(fragment);
    expect(remoteScripts.length).toEqual(1);
    expect(remoteScripts[0].getAttribute("type")).toEqual("module");
  });
  it("should ignore an inline module that has no code", () => {
    const fragment = createFragment(`<script type="module"></script>`);
    expect(getInlineScripts(fragment).length).toEqual(0);
    expect(getRemoteScripts(fragment).length).toEqual(0);
  });
  it("should execute an inline module in the head as an ES module (fire-and-forget)", async () => {
    delete window.__alloyInlineModuleRan;
    const fragment = createFragment(
      `<script type="module" class="mfx" data-x="y">window.__alloyInlineModuleRan = true; export default 1;</script>`,
    );
    const remoteScripts = getRemoteScripts(fragment);
    expect(remoteScripts.length).toEqual(1);

    // Resolves without waiting — inline modules emit no load event, so
    // completion is intentionally not tracked.
    const [injected] = await executeRemoteScripts(remoteScripts);

    // The head element carries type + code, but not author class/data-*.
    expect(injected.parentNode).toBe(document.head);
    expect(injected.getAttribute("type")).toEqual("module");
    expect(injected.getAttribute("class")).toBeNull();
    expect(injected.getAttribute("data-x")).toBeNull();
    expect(injected.textContent).toContain("__alloyInlineModuleRan");
    // Executes only if parsed as a module; the `export` would be a SyntaxError
    // in a classic script, so the assignment before it would never run.
    const ran = await waitFor(() => window.__alloyInlineModuleRan === true);
    expect(ran).toBe(true);
    delete window.__alloyInlineModuleRan;
  });
  it("should remove classic inline scripts from the DOM after executing them", () => {
    const fragment = createFragment(
      `<script data-alloy-test="classic">window.__alloyClassicRan = true;</script>`,
    );
    const inlineScripts = getInlineScripts(fragment);
    const container = createNode(DIV);
    document.body.appendChild(container);
    try {
      executeInlineScripts(container, inlineScripts);
      expect(window.__alloyClassicRan).toBe(true);
      expect(container.querySelector("script")).toBeNull();
    } finally {
      container.remove();
      delete window.__alloyClassicRan;
    }
  });
  it("should copy only type, src, nonce, and the functional allowlist to the executed head script", () => {
    const fragment = createFragment(
      `<script class="mfx-targetOffer" type="text/javascript" id="offerScript" data-foo="bar" crossorigin="anonymous" integrity="sha384-abc" referrerpolicy="no-referrer" fetchpriority="high" nomodule src="${LOADABLE_SRC}"></script>`,
    );
    const remoteScripts = getRemoteScripts(fragment);
    // The script element is appended to <head> synchronously; the returned
    // promise only tracks the (separate) load outcome, which is irrelevant to
    // attribute copying and can be unpredictable for a data: URL combined with
    // crossorigin/integrity. Swallow it so it doesn't surface as unhandled.
    executeRemoteScripts(remoteScripts).catch(() => {});

    const injected = document.head.querySelector(
      `script[src="${LOADABLE_SRC}"]`,
    );
    expect(injected).not.toBeNull();
    // Functional attributes are carried over.
    expect(injected.getAttribute("src")).toEqual(LOADABLE_SRC);
    expect(injected.getAttribute("type")).toEqual("text/javascript");
    expect(injected.getAttribute("crossorigin")).toEqual("anonymous");
    expect(injected.getAttribute("integrity")).toEqual("sha384-abc");
    expect(injected.getAttribute("referrerpolicy")).toEqual("no-referrer");
    expect(injected.getAttribute("fetchpriority")).toEqual("high");
    expect(injected.getAttribute("nomodule")).toEqual("");
    // Author identity/data attributes are intentionally NOT copied, so they
    // can't create duplicate matches with the original offer script.
    expect(injected.getAttribute("class")).toBeNull();
    expect(injected.getAttribute("id")).toBeNull();
    expect(injected.getAttribute("data-foo")).toBeNull();
    // async is always enforced.
    expect(injected.async).toBe(true);
  });
  it("should omit the functional allowlist attributes when the source doesn't have them", async () => {
    const fragment = createFragment(`<script src="${LOADABLE_SRC}"></script>`);
    await executeRemoteScripts(getRemoteScripts(fragment));

    const injected = document.head.querySelector(
      `script[src="${LOADABLE_SRC}"]`,
    );
    expect(injected.getAttribute("crossorigin")).toBeNull();
    expect(injected.getAttribute("integrity")).toBeNull();
    expect(injected.getAttribute("referrerpolicy")).toBeNull();
    expect(injected.getAttribute("fetchpriority")).toBeNull();
    expect(injected.getAttribute("nomodule")).toBeNull();
  });
  it("should preserve type=module so a remote ES module offer executes as a module", async () => {
    delete window.__alloyModuleExecuted;
    const fragment = createFragment(
      `<script type="module" src="${MODULE_SRC}"></script>`,
    );
    // Resolves only if the browser parsed the injected script as a module;
    // as a classic script the `export` syntax would throw and reject.
    await expect(
      executeRemoteScripts(getRemoteScripts(fragment)),
    ).resolves.toBeDefined();

    const injected = document.head.querySelector(`script[src="${MODULE_SRC}"]`);
    expect(injected).not.toBeNull();
    // type="module" must survive re-creation for ES module support to work.
    expect(injected.getAttribute("type")).toEqual("module");
    // The module actually loaded and executed with ES module semantics.
    expect(window.__alloyModuleExecuted).toBe(true);
    delete window.__alloyModuleExecuted;
  });
  it("should enforce async even when the source omits or differs on it", async () => {
    const fragment = createFragment(
      `<script async="false" src="${LOADABLE_SRC}"></script>`,
    );
    await executeRemoteScripts(getRemoteScripts(fragment));

    const injected = document.head.querySelector(
      `script[src="${LOADABLE_SRC}"]`,
    );
    expect(injected.async).toBe(true);
  });
  it("should apply the nonce to the executed head script when available", async () => {
    testResetCachedNonce();
    const nonceHolder = document.createElement("meta");
    nonceHolder.setAttribute("nonce", "test-nonce-123");
    document.head.appendChild(nonceHolder);

    try {
      const fragment = createFragment(
        `<script src="${LOADABLE_SRC}"></script>`,
      );
      await executeRemoteScripts(getRemoteScripts(fragment));

      const injected = document.head.querySelector(
        `script[src="${LOADABLE_SRC}"]`,
      );
      expect(injected.getAttribute("nonce")).toEqual("test-nonce-123");
    } finally {
      nonceHolder.remove();
    }
  });
  it("should fall back to the source's nonce when no page nonce is found", async () => {
    testResetCachedNonce();
    const fragment = createFragment(
      `<script nonce="source-nonce-456" src="${LOADABLE_SRC}"></script>`,
    );
    await executeRemoteScripts(getRemoteScripts(fragment));

    const injected = document.head.querySelector(
      `script[src="${LOADABLE_SRC}"]`,
    );
    expect(injected.getAttribute("nonce")).toEqual("source-nonce-456");
  });
  it("should override the source's nonce with the page's nonce when both are present", async () => {
    testResetCachedNonce();
    const nonceHolder = document.createElement("meta");
    nonceHolder.setAttribute("nonce", "page-nonce-789");
    document.head.appendChild(nonceHolder);

    try {
      const fragment = createFragment(
        `<script nonce="source-nonce-456" src="${LOADABLE_SRC}"></script>`,
      );
      await executeRemoteScripts(getRemoteScripts(fragment));

      const injected = document.head.querySelector(
        `script[src="${LOADABLE_SRC}"]`,
      );
      expect(injected.getAttribute("nonce")).toEqual("page-nonce-789");
    } finally {
      nonceHolder.remove();
    }
  });
  it("should reject when a remote script fails to load", async () => {
    const fragment = createFragment(`<script src="${FAILING_SRC}"></script>`);
    await expect(
      executeRemoteScripts(getRemoteScripts(fragment)),
    ).rejects.toThrow(/Failed to load script/);
  });
});
