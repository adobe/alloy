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

const baseUrl = `https://alloyio.com/functional-test`;

export const TEST_PAGE = `${baseUrl}/testPage.html`;
export const TEST_PAGE_AT_JS_TWO = `${baseUrl}/testPageWithAtjs2.html`;
export const TEST_PAGE_AT_JS_ONE = `${baseUrl}/testPageWithAtjs1.html`;
export const TEST_PAGE_WITH_CSP = `${baseUrl}/testPageWithCsp.html`;
// This page is only used by reloadPage.js as an interim workaround for
// https://github.com/DevExpress/testcafe/issues/5992
export const RELOAD_PAGE = `${baseUrl}/reloadPage.html`;

const secondaryBaseUrl = `https://alloyio2.com/functional-test`;
export const SECONDARY_TEST_PAGE = `${secondaryBaseUrl}/testPage.html`;
