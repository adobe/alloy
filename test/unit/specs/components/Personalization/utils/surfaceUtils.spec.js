/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  buildPageSurface,
  isPageWideSurface,
  normalizeSurfaces
} from "../../../../../../src/components/Personalization/utils/surfaceUtils";

let pageLocation;
let logger;

const getPageLocation = () => pageLocation;

describe("Personalization::surfaceUtils", () => {
  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["error", "warn"]);
    pageLocation = {
      host: "domain.com",
      pathname: "/products/test/"
    };
  });

  it("builds page-wide surface from location", () => {
    expect(buildPageSurface(getPageLocation)).toEqual(
      "web://domain.com/products/test"
    );
    pageLocation = {
      host: "DOMain.com",
      pathname: undefined
    };
    expect(buildPageSurface(getPageLocation)).toEqual("web://domain.com/");
    pageLocation = {
      host: "domain.com:8080",
      pathname: "/"
    };
    expect(buildPageSurface(getPageLocation)).toEqual("web://domain.com:8080/");
    pageLocation = {
      host: "domain.com",
      pathname: "/a"
    };
    expect(buildPageSurface(getPageLocation)).toEqual("web://domain.com/a");
    pageLocation = {
      host: "domain.com",
      pathname: "/a/"
    };
    expect(buildPageSurface(getPageLocation)).toEqual("web://domain.com/a");
  });

  it("checks for a page-wide surface", () => {
    expect(isPageWideSurface("__view__")).toBeFalse();
    expect(isPageWideSurface("name")).toBeFalse();
    expect(isPageWideSurface("web://domain.com")).toBeTrue();
    expect(isPageWideSurface("web://domain.com/path/page.html")).toBeTrue();
    expect(isPageWideSurface("web://domain.com#fragment")).toBeFalse();
    expect(isPageWideSurface("webapp://domain.com")).toBeFalse();
    expect(isPageWideSurface("webapp://domain.com#view")).toBeFalse();
  });

  it("expands fragment surfaces", () => {
    let result = normalizeSurfaces([], getPageLocation, logger);
    expect(result).toEqual([]);
    result = normalizeSurfaces(
      ["web://custom.surface.com", "#fragment1", "test"],
      getPageLocation,
      logger
    );
    expect(result).toEqual([
      "web://custom.surface.com/",
      "web://domain.com/products/test#fragment1"
    ]);
    expect(logger.warn).toHaveBeenCalledOnceWith("Invalid surface: test");
  });

  it("validates & normalizes surface type", () => {
    const result = normalizeSurfaces(
      [
        "test://domain1.com/test",
        "web://domain2.com/test",
        "we b://domain3.com/test",
        "webapp://domain4.com/test",
        "webAPP://domain5.com/test",
        "://domain5.com/test",
        "web:///domain6.com/test",
        "mobileapp://domain7.com/test"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([
      "web://domain2.com/test",
      "webapp://domain4.com/test",
      "webapp://domain5.com/test"
    ]);
    expect(logger.warn).toHaveBeenCalledTimes(5);
  });

  it("validates & normalizes surface authority", () => {
    let result = normalizeSurfaces(
      [
        "web://foo.com",
        "web://www.example.com",
        "web://✪df.ws",
        "web://userid:password@example.com:8080",
        "web://userid@example.com",
        "web://userid@example.com:8080",
        "web://userid:password@example.com",
        "web://142.42.1.1",
        "web://142.42.1.1:8080",
        "web://➡.ws",
        "web://⌘.ws",
        "web://☺.damowmow.com",
        "web://مثال.إختبار",
        "web://例子.测试",
        "web://उदाहरण.परीक्षा",
        "web://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
        "web://1337.net",
        "web://a.b-c.de",
        "web://223.255.255.254",
        "web://[::1]",
        "web://[ff11:af21:::1]:3000"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([
      "web://foo.com/",
      "web://www.example.com/",
      "web://✪df.ws/",
      "web://userid:password@example.com:8080/",
      "web://userid@example.com/",
      "web://userid@example.com:8080/",
      "web://userid:password@example.com/",
      "web://142.42.1.1/",
      "web://142.42.1.1:8080/",
      "web://➡.ws/",
      "web://⌘.ws/",
      "web://☺.damowmow.com/",
      "web://مثال.إختبار/",
      "web://例子.测试/",
      "web://उदाहरण.परीक्षा/",
      "web://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com/",
      "web://1337.net/",
      "web://a.b-c.de/",
      "web://223.255.255.254/",
      "web://[::1]/",
      "web://[ff11:af21:::1]:3000/"
    ]);
    expect(logger.warn).not.toHaveBeenCalled();

    result = normalizeSurfaces(
      [
        "web://foo?.com",
        "web://d f.ws",
        "web://userid@example.com:8a080",
        "web://userid@examp&le.com",
        "web:///page",
        "web://[::1)",
        "web://[ff11:af21:12zx::1]:3000"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledTimes(7);
  });

  it("validates & normalizes surface path", () => {
    let result = normalizeSurfaces(
      [
        "web://domain1.com",
        "web://domain2.com///",
        "web://domain3.com/PROD.1/a",
        "web://domain4.com/~prod-1/bb/c/",
        "web://domain5.com/例子/☺",
        "web://domain6.com/a/%D0%B6%D0%BE%D1%80%D0%B0%D1%82%D0%B5%D1%81%D1%82"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([
      "web://domain1.com/",
      "web://domain2.com/",
      "web://domain3.com/PROD.1/a",
      "web://domain4.com/~prod-1/bb/c",
      "web://domain5.com/例子/☺",
      "web://domain6.com/a/%D0%B6%D0%BE%D1%80%D0%B0%D1%82%D0%B5%D1%81%D1%82"
    ]);
    expect(logger.warn).not.toHaveBeenCalled();

    result = normalizeSurfaces(
      [
        "web://domain1.com/pr od",
        "web://domain2.com/+/1",
        "web://domain3.com/$PROD.1/a",
        "web://domain4.com/~prod-1/bb/c/?query=aa",
        "web://domain5.com/例子/test*/1",
        "web://domain6.com/a/%D0%B6%D0%ZX",
        "web://domain7.com/a/%D0%B6%D0%%AF"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledTimes(7);
  });

  it("validates surface fragment", () => {
    let result = normalizeSurfaces(
      [
        "web://domain1.com#/home",
        "web://domain2.com#home",
        "web://domain3.com#PROD.1",
        "web://domain4.com#~prod-1/bb/c/",
        "web://domain5.com#例子/☺",
        "web://domain6.com#my-%D0%B6%D0%BE%D1%80%D0%B0%D1%82%D0%B5%D1%81%D1%82"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([
      "web://domain1.com/#/home",
      "web://domain2.com/#home",
      "web://domain3.com/#PROD.1",
      "web://domain4.com/#~prod-1/bb/c/",
      "web://domain5.com/#例子/☺",
      "web://domain6.com/#my-%D0%B6%D0%BE%D1%80%D0%B0%D1%82%D0%B5%D1%81%D1%82"
    ]);
    expect(logger.warn).not.toHaveBeenCalled();

    result = normalizeSurfaces(
      [
        "web://domain1.com/#pr od",
        "web://domain2.com/#+/1",
        "web://domain3.com/#$PROD.1/a",
        "web://domain4.com/#~prod-1/bb/c/?query=aa",
        "web://domain5.com/#例子/test*!/1",
        "web://domain6.com/#a/%D0%B6%D0%ZX",
        "web://domain7.com/#a/%D0%B6%D0%%AF"
      ],
      getPageLocation,
      logger
    );
    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledTimes(7);
  });
});
