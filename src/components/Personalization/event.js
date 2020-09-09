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
  DOM_ACTION,
  JSON_CONTENT_ITEM,
  HTML_CONTENT_ITEM,
  REDIRECT_ITEM,
  PAGE_WIDE_SCOPE
} from "./constants/personalizationConstants";
import { includes } from "../../utils";

export const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

export const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};

export const createQueryDetails = decisionScopes => {
  const schemas = [HTML_CONTENT_ITEM, JSON_CONTENT_ITEM, REDIRECT_ITEM];

  if (includes(decisionScopes, PAGE_WIDE_SCOPE)) {
    schemas.push(DOM_ACTION);
  }
  return {
    schemas,
    decisionScopes
  };
};
