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

/**
 * Whether a semver string carries a prerelease tag (e.g. "2.34.0-beta.0").
 * @param {string} version
 * @returns {boolean}
 */
export const isPrerelease = (version) => version.includes("-");

/**
 * Composes the CDN URL where a built artifact lives for a given version.
 * @param {string} version
 * @param {string} filename
 * @returns {string}
 */
export const cdnUrlFor = (version, filename) =>
  `https://cdn1.adoberesources.net/alloy/${version}/${filename}`;
