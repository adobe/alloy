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

import renderView from "./renderView";
import createBridge from "./createBridge";
import createDriver from "./createDriver";

export default async function useView(View) {
  const bridge = createBridge();
  window.extensionBridge = bridge;

  const view = await renderView(View);
  const registration = await bridge.registration;
  const driver = createDriver(registration, bridge.ready);
  const cleanup = () => {
    view.unmount();
    delete window.extensionBridge;
  };

  return { view, bridge, driver, cleanup };
}
