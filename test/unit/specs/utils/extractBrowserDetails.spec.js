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
import { extractBrowserDetails } from "../../../../src/utils/extractBrowserDetails";

describe("extractBrowserDetails", () => {
  it("should return correct browser name and version for Chrome", () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);
    const browserDetails = extractBrowserDetails();

    expect(browserDetails.browserName).toEqual("Google Chrome");
    expect(browserDetails.browserVersion).toEqual("90.0");
  });

  it("should return correct browser name and version for Firefox", () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);

    const browserDetails = extractBrowserDetails();

    expect(browserDetails.browserName).toEqual("Firefox");
    expect(browserDetails.browserVersion).toEqual("87.0");
  });

  it("should return correct browser name and version for Safari", () => {
    const userAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);

    const browserDetails = extractBrowserDetails();

    expect(browserDetails.browserName).toEqual("Safari");
    expect(browserDetails.browserVersion).toEqual("14.1");
  });

  it("should return correct browser name and version for Microsoft Edge", () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edge/91.0.864.37";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);

    const browserDetails = extractBrowserDetails();
    expect(browserDetails.browserName).toEqual("Microsoft Edge");
    expect(browserDetails.browserVersion).toEqual("91.0");
  });

  it("should return correct browser name and version for Internet Explorer", () => {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);

    const browserDetails = extractBrowserDetails();

    expect(browserDetails.browserName).toEqual("Internet Explorer");
    expect(browserDetails.browserVersion).toEqual("11.0");
  });

  it("should return correct browser name and version for unknown browser", () => {
    const userAgent = "Unknown user agent";
    spyOnProperty(navigator, "userAgent").and.returnValue(userAgent);

    const browserDetails = extractBrowserDetails();

    expect(browserDetails.browserName).toEqual("Unknown");
    expect(browserDetails.browserVersion).toEqual("Unknown");
  });
});
