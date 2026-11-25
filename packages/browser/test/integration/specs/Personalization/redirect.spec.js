/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { http, HttpResponse } from "msw";
import { server } from "vitest/browser";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  test,
  testWithoutAlloy,
  expect,
} from "../../helpers/testsSetup/extend.js";

const frameUrl = new URL(
  "/packages/browser/test/integration/specs/Personalization/redirectTarget.html",
  window.location.origin,
).href;
const redirectUrl = `${frameUrl}?redirected=true`;
const makeRedirectHandler = (url) =>
  http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async ({ request }) => {
      const body = await request.json();
      if (!body.events[0].query?.personalization?.schemas)
        return HttpResponse.json({ requestId: "display", handle: [] });
      return HttpResponse.json({
        requestId: "redirect",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "AT:redirect",
                scope: "__view__",
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "redirect" },
                  experience: { id: "0" },
                  characteristics: { eventToken: "redirect-token" },
                },
                items: [
                  {
                    id: "redirect-item",
                    schema:
                      "https://ns.adobe.com/personalization/redirect-item",
                    data: { type: "redirect", content: url },
                  },
                ],
              },
            ],
          },
        ],
      });
    },
  );

test("C205528: redirect offer is returned but not executed when rendering is disabled", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(
    makeRedirectHandler(`${window.location.href}#unexpected-redirect`),
  );
  await alloy("configure", alloyConfig);
  const before = window.location.href;
  const result = await alloy("sendEvent", {
    renderDecisions: false,
    decisionScopes: ["__view__"],
  });
  expect(result.propositions).toEqual([
    expect.objectContaining({
      renderAttempted: false,
      items: [
        expect.objectContaining({
          schema: "https://ns.adobe.com/personalization/redirect-item",
        }),
      ],
    }),
  ]);
  await networkRecorder.waitForIdle();
  const calls = await networkRecorder.findCalls(/v1\/interact/);
  expect(calls).toHaveLength(1);
  expect(calls[0].request.body.events[0].xdm.eventType).not.toBe(
    "decisioning.propositionDisplay",
  );
  expect(window.location.href).toBe(before);
});

const createFrame = async () => {
  const baseCode = await server.commands.readFile(
    `${server.config.root}/packages/browser/distTest/baseCode.min.js`,
  );
  const frame = document.createElement("iframe");
  try {
    await new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = reject;
      frame.src = frameUrl;
      document.body.appendChild(frame);
    });
    const doc = frame.contentDocument;
    const base = doc.createElement("script");
    base.textContent = baseCode;
    doc.body.appendChild(base);
    const script = doc.createElement("script");
    script.src = "/packages/browser/dist/alloy.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      doc.body.appendChild(script);
    });
    return frame;
  } catch (error) {
    frame.remove();
    throw error;
  }
};

testWithoutAlloy(
  "C205528: redirect offer navigates an isolated Alloy frame",
  async ({ worker, networkRecorder }) => {
    worker.use(makeRedirectHandler(redirectUrl));
    const frame = await createFrame();
    try {
      const frameAlloy = frame.contentWindow.alloy;
      await frameAlloy("configure", alloyConfig);
      const navigated = new Promise((resolve) => {
        frame.onload = resolve;
      });
      frameAlloy("sendEvent", { renderDecisions: true });
      await navigated;
      expect(frame.contentWindow.location.href).toBe(redirectUrl);
      expect(frame.contentDocument.body.textContent).toContain(
        "Redirect reached",
      );
      const calls = await networkRecorder.findCalls(/v1\/interact/);
      expect(
        calls[0].response.body.handle[0].payload[0].items[0].data.content,
      ).toBe(redirectUrl);
    } finally {
      frame.remove();
    }
  },
);

testWithoutAlloy(
  "C205528: redirect blocks a queued bottom-of-page event",
  async ({ worker, networkRecorder }) => {
    const frame = await createFrame();
    try {
      const frameAlloy = frame.contentWindow.alloy;
      worker.use(makeRedirectHandler(redirectUrl));
      await frameAlloy("configure", alloyConfig);
      const navigated = new Promise((resolve, reject) => {
        frame.onload = resolve;
        frame.onerror = reject;
      });
      frameAlloy("sendEvent", {
        renderDecisions: true,
        personalization: { sendDisplayEvent: false },
      });
      let bottomSettled = false;
      frameAlloy("sendEvent", {
        personalization: { includeRenderedPropositions: true },
      }).then(
        () => {
          bottomSettled = true;
        },
        () => {
          bottomSettled = true;
        },
      );
      await navigated;
      expect(frame.contentWindow.location.href).toBe(redirectUrl);
      expect(bottomSettled).toBe(false);
      await networkRecorder.waitForIdle();
      const calls = await networkRecorder.findCalls(/v1\/interact/, {
        retries: 30,
        delayMs: 100,
        minCalls: 2,
      });
      expect(calls).toHaveLength(2);
      expect(calls[1].request.body.events[0].xdm.eventType).toBe(
        "decisioning.propositionDisplay",
      );
    } finally {
      frame.remove();
    }
  },
);
