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

// View entry modules (e.g. actions/applyPropositions.jsx) call render() when
// imported. Spec files mock src/view/render with captureRender so the view
// component can be mounted with renderView instead:
//
//   vi.mock("../../../src/view/render", async () => ({
//     default: (await import("../helpers/entryView")).captureRender,
//   }));
//   const View = await loadEntryView(
//     () => import("../../../src/view/actions/applyPropositions"),
//   );

let capturedView;

export const captureRender = (View) => {
  capturedView = View;
};

export default async function loadEntryView(importEntry) {
  await importEntry();
  if (!capturedView) {
    throw new Error("The entry module did not call render().");
  }
  return capturedView;
}
