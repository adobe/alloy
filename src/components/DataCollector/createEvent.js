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

export default () => {
  const content = {};
  let expectsResponse = false;

  return {
    set stitchId(stitchId) {
      content.stitchId = stitchId;
    },
    mergeData: createMerger(content, "data"),
    mergeMeta: createMerger(content, "meta"),
    mergeQuery: createMerger(content, "query"),
    mergeWeb: createMerger(content, "web"),
    mergeDevice: createMerger(content, "device"),
    mergeEnvironment: createMerger(content, "environment"),
    mergePlaceContext: createMerger(content, "placeContext"),
    expectResponse() {
      expectsResponse = true;
    },
    get expectsResponse() {
      return expectsResponse;
    },
    toJSON() {
      return content;
    }
  };
};
