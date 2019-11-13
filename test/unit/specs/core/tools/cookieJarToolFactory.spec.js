/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import cookieJarToolFactory from "../../../../../src/core/tools/cookieJarToolFactory";
import createConfig from "../../../../../src/core/config/createConfig";

describe("cookieJarToolFactory", () => {
  let cookieProxy;
  let createCookieProxy;
  let createComponentNamespacedCookieJar;
  let getTopLevelDomain;
  let config;
  let componentAbbreviation;
  let componentNamespacedCookieJar;
  let createOrgNamespacedCookieName;

  beforeEach(() => {
    cookieProxy = { get() {}, set() {} };
    createCookieProxy = jasmine.createSpy().and.returnValue(cookieProxy);
    componentNamespacedCookieJar = { get() {}, set() {}, remove() {} };
    createComponentNamespacedCookieJar = jasmine
      .createSpy()
      .and.returnValue(componentNamespacedCookieJar);
    getTopLevelDomain = jasmine
      .createSpy()
      .and.returnValue("retrievedtopleveldomain.com");
    config = createConfig({
      orgId: "ORG123"
    });
    componentAbbreviation = "TC";
    createOrgNamespacedCookieName = () => "orgNamespacedCookieName";
  });

  it("returns cookie jar tool", () => {
    const tool = cookieJarToolFactory({
      config,
      createCookieProxy,
      createComponentNamespacedCookieJar,
      getTopLevelDomain,
      createOrgNamespacedCookieName
    })(componentAbbreviation);
    expect(createCookieProxy).toHaveBeenCalledWith(
      "orgNamespacedCookieName",
      180,
      "retrievedtopleveldomain.com"
    );
    expect(createComponentNamespacedCookieJar).toHaveBeenCalledWith(
      cookieProxy,
      "TC"
    );
    expect(tool).toBe(componentNamespacedCookieJar);
  });

  it("creates a shared cookie proxy for multiple components", () => {
    const configuredTool = cookieJarToolFactory({
      config,
      createCookieProxy,
      createComponentNamespacedCookieJar,
      getTopLevelDomain,
      createOrgNamespacedCookieName
    });
    configuredTool(componentAbbreviation);
    configuredTool("T2");
    expect(createCookieProxy).toHaveBeenCalledTimes(1);
  });

  it("uses the cookie domain provided in config", () => {
    config.cookieDomain = "example.com";
    cookieJarToolFactory({
      config,
      createCookieProxy,
      createComponentNamespacedCookieJar,
      getTopLevelDomain,
      createOrgNamespacedCookieName
    })(componentAbbreviation);
    expect(createCookieProxy).toHaveBeenCalledWith(
      "orgNamespacedCookieName",
      180,
      "example.com"
    );
  });
});
