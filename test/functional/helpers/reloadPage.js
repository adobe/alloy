/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t, ClientFunction } from "testcafe";

const getCurrentUrl = ClientFunction(() => {
  return document.location.href;
});

export default async () => {
  const currentUrl = await getCurrentUrl();
  // navigateTo waits for the server to respond after a redirect occurs,
  // which is why we use it instead of just calling document.location.reload()
  // in our client function.
  // We have to navigate to a different page and then back to the current page,
  // because if we just tried to navigate to the same page we're on, TestCafe
  // would hang.
  await t.navigateTo("blank.html");
  await t.navigateTo(currentUrl);
};
