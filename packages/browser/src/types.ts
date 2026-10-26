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

import type { AlloyMonitor } from "@adobe/alloy-core/core/types.js";

/** [resolve, reject, [commandName, options]] */
export type AlloyQueueItem = [
  (value: unknown) => unknown,
  (reason: unknown) => unknown,
  [string, object?],
];

/**
 * A function that executes Alloy commands and returns a Promise, with a queue
 * property for pre-initialization commands.
 */
export interface AlloyInstance {
  (commandName: string, options?: object): Promise<unknown>;
  q: AlloyQueueItem[];
}

/** Alloy instance names, keyed by the global name each instance lives under. */
export type AlloyGlobalNamespace = Record<string, AlloyInstance>;

export interface LegacyVisitor {
  getMarketingCloudVisitorID: (
    callback: (ecid: string) => void,
    forceSync?: boolean,
  ) => void;
}

export interface LegacyVisitorApi {
  getInstance: (orgId: string, config: object) => LegacyVisitor;
}

export interface LegacyOptIn {
  Categories: { ECID: string };
  fetchPermissions: (callback: () => void, forceSync?: boolean) => void;
  isApproved: (categories: string[]) => boolean;
}

declare global {
  interface Window {
    /** Names of the global Alloy instances created by the base code. */
    __alloyNS?: string[];
    /** Monitors registered by tooling such as the Alloy debugger. */
    __alloyMonitors?: AlloyMonitor[];
    /** Legacy Visitor API, present only on pages that load it. */
    Visitor?: LegacyVisitorApi;
    /** Legacy Adobe global, present only on pages that load it. */
    adobe?: { optIn?: LegacyOptIn };
  }
}
