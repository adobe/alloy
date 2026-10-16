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

import { style } from "@react-spectrum/s2/style" with { type: "macro" };

// The style() macro must be called with a statically analyzable object, so a
// runtime `width` string (still passed in as a v3 "size-*" token by views not
// yet migrated to S2) can't be interpolated into it directly. Instead we
// precompute one style per token seen in the codebase and select among them
// at runtime. Pixel values come from the Spectrum 1 -> 2 dimension token
// migration table: https://react-spectrum.adobe.com/migrating
const WIDTH_STYLES = {
  "size-0": style({ width: 0 }),
  "size-2000": style({ width: 160 }),
  "size-3000": style({ width: 240 }),
  "size-4000": style({ width: 320 }),
  "size-4600": style({ width: 368 }),
  "size-5000": style({ width: 400 }),
  "size-6000": style({ width: 480 }),
};

const widthStyle = (width) => WIDTH_STYLES[width];

export default widthStyle;
