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

import { isNonEmptyArray } from "../../utils";

const AUTHORING_MODE_ENABLED =
  document.location.href.indexOf("mboxEdit") !== -1;

export const PAGE_WIDE_SCOPE = "__view__";
export const hasScopes = scopes => isNonEmptyArray(scopes);
export const isAuthoringModeEnabled = () => AUTHORING_MODE_ENABLED;

export const isPersonalizationDisabled = ({
  renderDecisions,
  decisionScopes
}) => {
  if (renderDecisions) {
    return false;
  }

  return !hasScopes(decisionScopes);
};
