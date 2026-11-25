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
import { test, expect } from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";

const nonce = "csp-test-nonce";

const runOffer = async (worker, content, assertions) => {
  worker.use(
    http.post(/https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/, () =>
      HttpResponse.json({
        requestId: "csp-response",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "AT:csp",
                scope: "__view__",
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "1" },
                  experience: { id: "0" },
                  characteristics: { eventToken: "csp-token" },
                },
                items: [
                  {
                    id: "csp-item",
                    schema: "https://ns.adobe.com/personalization/dom-action",
                    data: {
                      type: "setHtml",
                      format: "application/vnd.adobe.target.dom-action",
                      selector: "#offer",
                      content,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
    ),
  );

  const baseCode = await server.commands.readFile(
    `${server.config.root}/packages/browser/distTest/baseCode.min.js`,
  );
  const frame = document.createElement("iframe");
  frame.srcdoc = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'"><script nonce="${nonce}">${baseCode}</script><script nonce="${nonce}" src="/packages/browser/dist/alloy.js"></script></head><body><h1>Heading</h1><div id="offer"></div></body></html>`;
  try {
    await new Promise((resolve) => {
      frame.onload = resolve;
      document.body.appendChild(frame);
    });
    const win = frame.contentWindow;
    const blockedScript = win.document.createElement("script");
    blockedScript.textContent = "window.blockedScriptExecuted = true";
    win.document.body.appendChild(blockedScript);
    const blockedStyle = win.document.createElement("style");
    blockedStyle.textContent = "h1 { opacity: 0.1 }";
    win.document.head.appendChild(blockedStyle);
    expect(win.blockedScriptExecuted).toBeUndefined();
    expect(win.getComputedStyle(win.document.querySelector("h1")).opacity).toBe(
      "1",
    );
    const scripts = [];
    const collectScripts = (records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeName === "SCRIPT") scripts.push(node);
        });
      });
    };
    const observer = new win.MutationObserver(collectScripts);
    observer.observe(win.document.body, { childList: true, subtree: true });
    await win.alloy("configure", alloyConfig);
    await win.alloy("sendEvent", { renderDecisions: true });
    collectScripts(observer.takeRecords());
    observer.disconnect();
    await assertions(win, scripts);
  } finally {
    frame.remove();
  }
};

test("C753469: injected script executes under nonce CSP", async ({
  worker,
}) => {
  await runOffer(
    worker,
    '<script id="C753469">window.offerExecuted = true</script>',
    (win, scripts) => {
      expect(win.document.getElementById("C753469")).not.toBeNull();
      expect(win.offerExecuted).toBe(true);
      expect(
        scripts.some(
          (script) =>
            script.nonce === nonce &&
            script.textContent === "window.offerExecuted = true",
        ),
      ).toBe(true);
    },
  );
});

test("C753470: injected style applies under nonce CSP", async ({ worker }) => {
  await runOffer(
    worker,
    '<style id="C753470">h1 { opacity: 0.5 }</style>',
    (win) => {
      expect(win.document.getElementById("C753470").nonce).toBe(nonce);
      expect(
        win.getComputedStyle(win.document.querySelector("h1")).opacity,
      ).toBe("0.5");
    },
  );
});
