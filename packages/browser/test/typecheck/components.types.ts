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

// Compile-time tests for browser component contracts. Checked by
// `pnpm --filter @adobe/alloy run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import type { CookieAttributes } from "@adobe/alloy-core/services";
import type { CookieManager } from "../../src/components/Advertising/types.js";
import type { ClickedElementOptions } from "../../src/components/ActivityCollector/types.js";
import type { ClickableElement } from "../../src/components/ActivityCollector/utils/dom/findClickableElement.js";
import { createAction } from "../../src/components/Personalization/dom-actions/action.js";
import type { DomActionData } from "../../src/components/Personalization/types.js";
import { parseAnchor } from "../../src/components/Personalization/in-app-message-actions/utils.js";

declare const cookieManager: CookieManager;

// Advertising cookie options are the shared cookie attributes.
const attributes: CookieAttributes = { expires: 30, secure: true };
cookieManager.setValue("key", "value", attributes);
cookieManager.setValue("key", "value", { expires: new Date(), path: "/" });
// @ts-expect-error `secure` is a boolean.
cookieManager.setValue("key", "value", { secure: "yes" });
// @ts-expect-error `expires` is a number of days or a Date.
cookieManager.setValue("key", "value", { expires: "tomorrow" });

// Click payloads keep known fields typed and pass other fields through.
export const clickOptions: ClickedElementOptions = {
  xdm: {
    eventType: "web.webinteraction.linkClicks",
    web: {
      webPageDetails: { name: "home" },
      webInteraction: { name: "link", linkClicks: { value: 1 } },
    },
  },
  data: {
    __adobe: { analytics: { eVar1: "value", contextData: { a: {} } } },
  },
};
// @ts-expect-error Known fields keep their types.
export const badClickOptions: ClickedElementOptions = { xdm: { eventType: 1 } };

// Each clickable alternative is a ClickableElement on its own.
expectTypeOf<HTMLAnchorElement>().toExtend<ClickableElement>();
expectTypeOf<HTMLAreaElement>().toExtend<ClickableElement>();
expectTypeOf<HTMLInputElement>().toExtend<ClickableElement>();
expectTypeOf<HTMLButtonElement>().toExtend<ClickableElement>();

// A DOM action keeps its render function's content type.
const action = createAction(
  (container: Element, content: { required: number }) => {
    container.setAttribute("data-value", String(content.required));
  },
);
expectTypeOf(action)
  .parameter(0)
  .toEqualTypeOf<DomActionData<{ required: number }>>();
// @ts-expect-error Content of the wrong shape is rejected.
action({ selector: "#a", prehidingSelector: "#a", content: "text" }, () => {}, {
  shouldRender: () => true,
  markAsRendered: () => {},
});

// Repeated query parameters are normalized to a single value.
expectTypeOf(parseAnchor(null).interaction).toEqualTypeOf<string | undefined>();
