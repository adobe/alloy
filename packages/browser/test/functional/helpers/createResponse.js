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

// A copy of core's injectCreateResponse: TestCafe can't load core's
// TypeScript source.
const ADOBE_EDGE = "x-adobe-edge";

const injectCreateResponse =
  ({ extractEdgeInfo }) =>
  ({ content = {}, getHeader }) => {
    const { handle = [], errors = [], warnings = [] } = content;

    return {
      getPayloadsByType(type) {
        return handle
          .filter((fragment) => fragment.type === type)
          .flatMap((fragment) => fragment.payload);
      },
      getErrors() {
        return errors;
      },
      getWarnings() {
        return warnings;
      },
      getEdge() {
        return extractEdgeInfo(getHeader(ADOBE_EDGE));
      },
      toJSON() {
        return content;
      },
    };
  };

export default injectCreateResponse({ logger: console });
