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

// js-cookie ships no types; declare only the surface the cookie service uses.
declare module "js-cookie" {
  import type {
    CookieAttributes,
    CookieConverter,
  } from "@adobe/alloy-core/utils/types.js";

  export interface CookieJar {
    get(): Record<string, string>;
    get(name: string): string | undefined;
    set(
      name: string,
      value: string,
      options?: CookieAttributes,
    ): string | undefined;
    remove(name: string, options?: CookieAttributes): void;
    withConverter(converter: CookieConverter): CookieJar;
  }

  const Cookies: CookieJar;
  export default Cookies;
}
