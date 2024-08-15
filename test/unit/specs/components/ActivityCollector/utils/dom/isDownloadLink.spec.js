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

import isDownloadLink from "../../../../../../../src/components/ActivityCollector/utils/dom/isDownloadLink.js";
import { downloadLinkQualifier } from "../../../../../../../src/components/ActivityCollector/configValidators.js";

describe("ActivityCollector::isDownloadLink", () => {
  it("Returns true if the clicked element has a download attribute", () => {
    const clickedElement = {
      download: "filename",
    };
    expect(isDownloadLink(null, "https://example.com/", clickedElement)).toBe(
      true,
    );
  });
  it("Returns true if the link matches the download link qualifying regular expression", () => {
    const downloadLinks = [
      "download.pdf",
      "http://example.com/download.zip",
      "https://example.com/download.docx",
    ];
    // this runs the validator with undefined input which returns the default regex
    downloadLinks.forEach((downloadLink) => {
      expect(isDownloadLink(downloadLinkQualifier(), downloadLink, {})).toBe(
        true,
      );
    });
  });
  it("Returns false if the link does not match the download link qualifying regular expression", () => {
    const downloadLinks = ["download.mod", "http://example.com/download.png"];
    downloadLinks.forEach((downloadLink) => {
      expect(isDownloadLink(downloadLinkQualifier(), downloadLink, {})).toBe(
        false,
      );
    });
  });
});
