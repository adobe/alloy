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

import type { Config, Event, Logger } from "@adobe/alloy-core/core/types.js";

/** Link details collected for a clicked element. */
export interface ClickedElementProps {
  pageName?: string;
  linkName?: string;
  linkRegion?: string;
  linkType?: string;
  linkUrl?: string;
  pageIDType?: number;
  clickedElement?: Node | null;
  filteredXdm?: ClickedElementXdm;
  filteredData?: ClickedElementData;
}

/**
 * Fields the click collector doesn't read. `any` rather than `unknown` so
 * named interfaces without an index signature are assignable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
type PassThrough = Record<string, any>;

/**
 * The parts of the XDM the click collector reads. Other fields pass through at
 * every level, such as `web.webPageDetails`.
 */
export type ClickedElementXdm = PassThrough & {
  eventType?: string;
  web?: PassThrough & {
    webInteraction?: PassThrough & {
      name?: string;
      region?: string;
      type?: string;
      URL?: string;
      linkClicks?: PassThrough & { value: number };
    };
  };
};

/**
 * The parts of the data object the click collector reads. Other fields pass
 * through at every level, such as `__adobe.analytics.eVar1`.
 */
export type ClickedElementData = PassThrough & {
  __adobe?: PassThrough & {
    analytics?: PassThrough & {
      contextData?: PassThrough & {
        a?: PassThrough & {
          activitymap?: PassThrough & {
            page?: string;
            link?: string;
            region?: string;
            pageIDType?: number;
          };
        };
      };
    };
  };
};

/** What `onBeforeLinkClickSend` receives and may modify. */
export interface ClickedElementOptions {
  xdm?: ClickedElementXdm;
  data?: ClickedElementData;
  clickedElement?: Node | null;
}

export interface ClickCollectionConfig {
  internalLinkEnabled: boolean;
  externalLinkEnabled: boolean;
  downloadLinkEnabled: boolean;
  sessionStorageEnabled: boolean;
  eventGroupingEnabled: boolean;
  filterClickDetails?: (props: ClickedElementProps) => unknown;
}

/** The computed configuration, with the options `configValidators` adds. */
export interface ActivityCollectorConfig extends Config {
  clickCollectionEnabled: boolean;
  clickCollection: ClickCollectionConfig;
  downloadLinkQualifier?: string;
  onBeforeLinkClickSend?: (options: ClickedElementOptions) => unknown;
}

/** The synchronous storage the click data is persisted in. */
export interface ClickStorage {
  getItem: (key: string) => string | null | undefined;
  setItem: (key: string, value: string) => unknown;
  removeItem: (key: string) => unknown;
}

export interface ClickActivityStorage {
  save: (data: ClickedElementProps) => void;
  load: () => ClickedElementProps | null;
  remove: () => void;
}

export type { Event, Logger };
