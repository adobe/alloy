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
  string,
  callback,
  objectOf,
  enumOf
} from "../../utils/validation";
import { noop } from "../../utils";
import { EDGE_DOMAIN } from "../../constants/domains";
import EDGE_BASE_PATH from "../../constants/edgeBasePath";
import { IN, PENDING } from "../../constants/consentStatus";
import { GENERAL } from "../../constants/consentPurpose";

export default () => ({
  errorsEnabled: boolean().default(true),
  debugEnabled: boolean().default(false),
  defaultConsent: objectOf({
    [GENERAL]: enumOf(IN, PENDING).default(IN)
  })
    .noUnknownFields()
    .default({ [GENERAL]: IN }),
  configId: string()
    .unique()
    .required(),
  edgeDomain: string()
    .domain()
    .default(EDGE_DOMAIN),
  edgeBasePath: string()
    .nonEmpty()
    .default(EDGE_BASE_PATH),
  orgId: string()
    .unique()
    .required(),
  onBeforeEventSend: callback().default(noop)
});
