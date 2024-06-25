/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { TEST_PAGE as TEST_PAGE_URL } from "../constants/url.js";
import { getFixtureClientScripts } from "./clientScripts.js";
import destinationRequestMock from "./destinationRequestMock.js";

export default ({
  title = "",
  url = TEST_PAGE_URL,
  requestHooks = [],
  monitoringHooksScript,
  includeAlloyLibrary = true,
  includeVisitorLibrary = false,
  includeNpmLibrary = false,
}) => {
  const clientScripts = getFixtureClientScripts({
    monitoringHooksScript,
    includeAlloyLibrary,
    includeVisitorLibrary,
    includeNpmLibrary,
  });
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks, destinationRequestMock)
    .clientScripts(clientScripts);
};
