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

// TODO move this dependency to utils
import { createMerger } from "../../utils";
import isEmptyObject from "../../utils/isEmptyObject";

export default () => {
  const content = {};
  let expectsResponse = false;
  let documentUnloading = false;

  return {
    set data(data) {
      content.data = data;
    },
    mergeXdm: createMerger(content, "xdm"),
    mergeMeta: createMerger(content, "meta"),
    mergeQuery: createMerger(content, "query"),
    documentUnloading() {
      documentUnloading = true;
    },
    isDocumentUnloading() {
      return documentUnloading;
    },
    expectResponse() {
      expectsResponse = true;
    },
    get expectsResponse() {
      return expectsResponse;
    },
    isEmpty() {
      return isEmptyObject(content);
    },
    toJSON() {
      return content;
    }
  };
};
