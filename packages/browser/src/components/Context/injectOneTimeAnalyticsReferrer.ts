/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import type { Event } from "@adobe/alloy-core/core/types.js";

// Because these events are originated by the SDK rather than user actions, don't change the referrer
const IGNORED_EVENT_TYPES = new Set([
  "decisioning.propositionFetch",
  "decisioning.propositionDisplay",
  "decisioning.propositionInteract",
]);

/** The event content paths read here; other fields pass through. */
interface ReferrerContent {
  xdm?: { eventType?: string };
  data?: { __adobe?: { analytics?: { referrer?: string } } };
}

export default (window: Window) => {
  let lastReferrerSent: string | null = null;

  return (event: Event) => {
    // getContent() is loosely typed; only the paths in ReferrerContent are read.
    const content = event.getContent() as ReferrerContent;
    const eventType = content.xdm?.eventType;

    if (eventType !== undefined && IGNORED_EVENT_TYPES.has(eventType)) {
      return;
    }

    // Allow customers to explicitly set the referrer (for SPA view changes)
    // Otherwise, use document.referrer

    const explicitReferrer = content.data?.__adobe?.analytics?.referrer;
    const currentReferrer =
      explicitReferrer !== undefined
        ? explicitReferrer
        : window.document.referrer;

    if (currentReferrer === lastReferrerSent) {
      event.mergeData({
        __adobe: {
          analytics: {
            referrer: "",
          },
        },
      });
      return;
    }

    event.mergeData({
      __adobe: {
        analytics: {
          referrer: currentReferrer,
        },
      },
    });

    lastReferrerSent = currentReferrer;
  };
};
