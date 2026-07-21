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

const removeInjectedScripts = () => {
  document.head
    .querySelectorAll("script[data-alloy-test]")
    .forEach((node) => node.remove());
};

describe("Personalization::helper::scripts", () => {
  beforeEach(() => {
    cleanUpDomChanges("fooDiv");
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
  it("should preserve all author attributes on the executed head script", async () => {
    const fragment = createFragment(
      `<script class="mfx-targetOffer" type="text/javascript" data-alloy-test="attrs" data-foo="bar" src="${LOADABLE_SRC}"></script>`,
    );
    const remoteScripts = getRemoteScripts(fragment);
    await executeRemoteScripts(remoteScripts);

    const injected = document.head.querySelector(
      'script[data-alloy-test="attrs"]',
    );
    expect(injected).not.toBeNull();
    expect(injected.getAttribute("class")).toEqual("mfx-targetOffer");
    expect(injected.getAttribute("type")).toEqual("text/javascript");
    expect(injected.getAttribute("data-foo")).toEqual("bar");
    expect(injected.getAttribute("src")).toEqual(LOADABLE_SRC);
    // async is always enforced
    expect(injected.async).toBe(true);
  });
  it("should enforce async even when the source omits or differs on it", async () => {
    const fragment = createFragment(
      `<script data-alloy-test="async" async="false" src="${LOADABLE_SRC}"></script>`,
    );
    await executeRemoteScripts(getRemoteScripts(fragment));

    const injected = document.head.querySelector(
      'script[data-alloy-test="async"]',
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
        `<script data-alloy-test="nonce" src="${LOADABLE_SRC}"></script>`,
      );
      await executeRemoteScripts(getRemoteScripts(fragment));

      const injected = document.head.querySelector(
        'script[data-alloy-test="nonce"]',
      );
      expect(injected.getAttribute("nonce")).toEqual("test-nonce-123");
    } finally {
      nonceHolder.remove();
    }
  });
  it("should resolve even when the source has an inline onload/onerror attribute", async () => {
    const fragment = createFragment(
      `<script data-alloy-test="handlers" onload="window.__alloyBadHandler=true" onerror="window.__alloyBadHandler=true" src="${LOADABLE_SRC}"></script>`,
    );
    await expect(
      executeRemoteScripts(getRemoteScripts(fragment)),
    ).resolves.toBeDefined();
  });
  it("should reject when a remote script fails to load", async () => {
    const fragment = createFragment(
      `<script data-alloy-test="fail" src="${FAILING_SRC}"></script>`,
    );
    await expect(
      executeRemoteScripts(getRemoteScripts(fragment)),
    ).rejects.toThrow(/Failed to load script/);
  });
});
