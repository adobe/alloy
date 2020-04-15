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

import { includes, values } from "../../utils";
import { PAGE_WIDE_SCOPE, hasScopes } from "./utils";
import * as SCHEMAS from "../../constants/schemas";

const ALL_SCHEMAS = values(SCHEMAS);

export const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

export const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};

export const createQueryDetails = ({ renderDecisions, decisionScopes }) => {
  const result = {};
  const scopes = [...decisionScopes];

  if (renderDecisions && !includes(scopes, PAGE_WIDE_SCOPE)) {
    scopes.push(PAGE_WIDE_SCOPE);
  }

  if (renderDecisions || hasScopes(scopes)) {
    result.accepts = ALL_SCHEMAS;
    result.decisionScopes = scopes;
  }

  return result;
};
