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
import { RELOAD_PAGE as RELOAD_PAGE_URL } from "./constants/url.js";

const getLocalStorageEntries = ClientFunction(() => {
  const entries = Object.keys(window.localStorage)
    // It seems that TestCafe modifies localStorage in such a way that
    // Object.keys() returns not just the entry names, but also some methods,
    // so we have to filter down to only those keys that are actual
    // storage entries.
    .filter((key) => localStorage.getItem(key) !== null)
    .reduce((memo, entryName) => {
      memo[entryName] = localStorage[entryName];
      return memo;
    }, {});
  return entries;
});

const setLocalStorageEntries = ClientFunction((entries) => {
  Object.keys(entries).forEach((entryName) => {
    localStorage.setItem(entryName, entries[entryName]);
  });
});

const getCurrentUrl = ClientFunction(() => document.location.href);

export default async (newQueryString = "") => {
  const currentUrl = new URL(await getCurrentUrl());
  currentUrl.search = newQueryString;
  // navigateTo waits for the server to respond after a redirect occurs,
  // which is why we use it instead of just calling document.location.reload()
  // in our client function.
  // TestCafe + Safari have an issue where local storage is cleared when using
  // t.navigateTo(), which is why we have to retrieve local storage entries
  // and then restore them after navigation.
  // https://github.com/DevExpress/testcafe/issues/5992
  // Also, we have to navigate to a different page and then back to the current page,
  // because if we just tried to navigate to the same page we're on, TestCafe
  // would hang in Safari (at least).
  const localStorageEntries = await getLocalStorageEntries();
  // We could navigate to any other page and then back again.
  await t.navigateTo(RELOAD_PAGE_URL);
  await t.navigateTo(currentUrl.toString());
  await setLocalStorageEntries(localStorageEntries);
};
