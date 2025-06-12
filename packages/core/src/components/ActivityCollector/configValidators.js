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

import {
  boolean,
  callback,
  objectOf,
  string,
} from "../../utils/validation/index.js";

const DEFAULT_DOWNLOAD_QUALIFIER =
  "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$";

export const downloadLinkQualifier = string()
  .regexp()
  .default(DEFAULT_DOWNLOAD_QUALIFIER);

const validators = objectOf({
  clickCollectionEnabled: boolean().default(true),
  clickCollection: objectOf({
    internalLinkEnabled: boolean().default(true),
    externalLinkEnabled: boolean().default(true),
    downloadLinkEnabled: boolean().default(true),
    // TODO: Consider moving downloadLinkQualifier here.
    sessionStorageEnabled: boolean().default(false),
    eventGroupingEnabled: boolean().default(false),
    filterClickProperties: callback(),
  }).default({
    internalLinkEnabled: true,
    externalLinkEnabled: true,
    downloadLinkEnabled: true,
    sessionStorageEnabled: false,
    eventGroupingEnabled: false,
  }),
  downloadLinkQualifier,
  onBeforeLinkClickSend: callback().deprecated(
    'The field "onBeforeLinkClickSend" has been deprecated. Use "clickCollection.filterClickDetails" instead.',
  ),
});

// Export both the validators and the default qualifier
export { DEFAULT_DOWNLOAD_QUALIFIER };
export default validators;
