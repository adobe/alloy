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

import createBridge from "../../integration/helpers/createBridge";
import createDriver from "../../integration/helpers/createDriver";

// Most views have been split into a bare `*View.jsx` component that
// useView() can render directly, but some haven't been extracted yet: their
// entry .jsx (the file the view's .html <script type="module"> loads) both
// defines the component *and* calls the app's own render() into a `#root`
// div as a module-level side effect. Importing that entry directly - rather
// than useView()'s own vitest-browser-react render() - is the only way to
// get real content out of those views without editing src.
//
// `importEntryModule` must be a `() => import("<relative path to the entry
// .jsx>")` thunk (not a bare import) so the module - and its render() side
// effect - only executes once #root exists and the bridge is wired up.
export default async function useEntryModule(importEntryModule) {
  if (!document.getElementById("root")) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }

  const bridge = createBridge();
  window.extensionBridge = bridge;

  await importEntryModule();

  const registration = await bridge.registration;
  const driver = createDriver(registration, bridge.ready);
  const cleanup = () => {
    delete window.extensionBridge;
  };

  return { driver, cleanup };
}
