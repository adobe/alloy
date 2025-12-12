/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const COPYRIGHT_LINE_REGEX =
  /Copyright\s+\d{4}\s+Adobe\. All rights reserved\./;
const REQUIRED_SUBSTRINGS = [
  'Apache License, Version 2.0 (the "License")',
  "http://www.apache.org/licenses/LICENSE-2.0",
  "governing permissions and limitations under the License.",
];

const dirname = path.dirname(fileURLToPath(import.meta.url));
const LICENSE_BANNER_PATH = path.resolve(dirname, "../../LICENSE_BANNER");

let licenseBannerBodyCache;
const getLicenseBannerBody = () => {
  if (licenseBannerBodyCache) {
    return licenseBannerBodyCache;
  }

  // LICENSE_BANNER is used for bundles, so we reuse it as the single source of truth
  // for the license text and keep only the *year* file-specific.
  const bannerText = fs.readFileSync(LICENSE_BANNER_PATH, "utf-8").trimEnd();
  const lines = bannerText.split(/\r?\n/);
  licenseBannerBodyCache = lines.slice(1).join("\n");
  return licenseBannerBodyCache;
};

const renderHeader = (year) => {
  return `/*
Copyright ${String(year)} Adobe. All rights reserved.
${getLicenseBannerBody()}
*/`.trimEnd();
};

const startsWithBom = (text) => text.startsWith("\uFEFF");

const getShebangEndIndex = (text) => {
  if (!text.startsWith("#!")) {
    return 0;
  }
  const newlineIndex = text.indexOf("\n");
  return newlineIndex === -1 ? text.length : newlineIndex + 1;
};

const getLeadingWhitespaceLength = (text) => {
  const match = text.match(/^[\t \r\n]*/);
  return match ? match[0].length : 0;
};

const hasLicenseHeaderAtStart = (text) => {
  if (!text.startsWith("/*")) {
    return false;
  }
  const endIndex = text.indexOf("*/");
  if (endIndex === -1) {
    return false;
  }
  const comment = text.slice(0, endIndex + 2);
  if (!COPYRIGHT_LINE_REGEX.test(comment)) {
    return false;
  }
  return REQUIRED_SUBSTRINGS.every((s) => comment.includes(s));
};

const licenseHeaderRule = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Require the Apache license header at the top of source files.",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          year: {
            type: "integer",
          },
        },
      },
    ],
    messages: {
      missing: "Missing Apache license header.",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      Program(node) {
        const originalText = sourceCode.getText();
        const bomOffset = startsWithBom(originalText) ? 1 : 0;
        const text = originalText.slice(bomOffset);

        const shebangEnd = getShebangEndIndex(text);
        const afterShebang = text.slice(shebangEnd);
        const leadingWhitespaceLength =
          getLeadingWhitespaceLength(afterShebang);
        const checkStart = shebangEnd + leadingWhitespaceLength;

        if (hasLicenseHeaderAtStart(text.slice(checkStart))) {
          return;
        }

        context.report({
          node,
          loc: { line: 1, column: 0 },
          messageId: "missing",
          fix(fixer) {
            const year = context.options?.[0]?.year ?? new Date().getFullYear();
            const headerBlock = renderHeader(year);

            const replacement =
              shebangEnd > 0 ? `\n${headerBlock}\n\n` : `${headerBlock}\n\n`;

            const replaceStart = bomOffset + shebangEnd;
            const replaceEnd = replaceStart + leadingWhitespaceLength;
            return fixer.replaceTextRange(
              [replaceStart, replaceEnd],
              replacement,
            );
          },
        });
      },
    };
  },
};

export default {
  meta: {
    name: "alloy",
    version: "local",
  },
  rules: {
    "license-header": licenseHeaderRule,
  },
};
