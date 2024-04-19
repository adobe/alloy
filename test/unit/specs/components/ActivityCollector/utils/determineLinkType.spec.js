/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import determineLinkType from "../../../../../../src/components/ActivityCollector/utils/determineLinkType";

describe("ActivityCollector::determineLinkType", () => {
  let window;
  let config;
  let linkUrl;
  let clickedObj;

  beforeEach(() => {
    window = {};
    config = {};
    linkUrl = "";
    clickedObj = {};
  });

  it("returns 'other' if linkUrl is an empty string", () => {
    const result = determineLinkType(window, config, linkUrl, clickedObj);
    expect(result).toBe("other");
  });

  it("returns 'download' if linkUrl qualify as download link", () => {
    linkUrl = "https://example.com/download.pdf";
    config.downloadLinkQualifier = /\.pdf$/;
    const result = determineLinkType(window, config, linkUrl, clickedObj);
    expect(result).toBe("download");
  });

  it("returns 'exit' if linkUrl is an exit link", () => {
    linkUrl = "https://adobe.com";
    window.location = {
      hostname: "example.com"
    };
    const result = determineLinkType(window, config, linkUrl, clickedObj);
    expect(result).toBe("exit");
  });

  it("returns 'other' if linkUrl is not a download or exit link", () => {
    linkUrl = "https://example.com";
    window.location = {
      hostname: "example.com"
    };
    const result = determineLinkType(window, config, linkUrl, clickedObj);
    expect(result).toBe("other");
  });
});
