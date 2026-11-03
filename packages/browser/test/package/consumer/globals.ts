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

// A consumer that types the vendor globals Alloy reads in its own way. Alloy's
// declarations must not merge their own shapes into the consumer's `Window`.
// eslint-disable-next-line import/extensions -- the package export is named `./baseCode.js`
import "@adobe/alloy/baseCode.js";
import { createInstance } from "@adobe/alloy";

declare global {
  interface Window {
    Visitor: { version: string };
    adobe: { target: unknown };
    ID5: string;
    ats: number;
    __alloyNS: string;
    __alloyMonitors: Map<string, unknown>;
  }
}

export const instance = createInstance();
export const visitorVersion: string = window.Visitor.version;
