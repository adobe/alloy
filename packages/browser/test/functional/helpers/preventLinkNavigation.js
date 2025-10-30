/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ClientFunction } from "testcafe";

/**
 * Prevents links from navigating the user. This can be particularly
 * useful in tests that are asserting requests that would typically
 * occur as a user navigates away from the page.
 */
export default ClientFunction(() => {
  document.addEventListener("click", (event) => {
    event.preventDefault();
  });
});
