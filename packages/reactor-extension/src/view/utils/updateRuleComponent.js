/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import makeReactorRequest from "./makeReactorRequest";
import UserReportableError from "../errors/userReportableError";

/**
 * PATCHes a rule_component in Reactor with new settings. Other attributes
 * of the rule_component are left untouched.
 *
 * @param {object} options
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {string} options.ruleComponentId - Reactor ID of the rule_component.
 * @param {object} options.settings - Settings object to persist. Will be
 *   JSON-stringified before being sent, matching how Reactor stores it.
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{id: string, settings: object}>} The updated rule_component
 *   id and parsed settings as Reactor returned them.
 */
const updateRuleComponent = async ({
  orgId,
  imsAccess,
  ruleComponentId,
  settings,
  signal,
}) => {
  let parsedResponse;
  try {
    parsedResponse = await makeReactorRequest({
      orgId,
      imsAccess,
      method: "PATCH",
      path: `/rule_components/${ruleComponentId}`,
      body: {
        data: {
          id: ruleComponentId,
          type: "rule_components",
          attributes: {
            settings: JSON.stringify(settings),
          },
        },
      },
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError("Failed to update rule component.", {
      originatingError: e,
    });
  }

  const data = parsedResponse.parsedBody?.data;
  return {
    id: data?.id ?? ruleComponentId,
    settings: data?.attributes?.settings
      ? JSON.parse(data.attributes.settings)
      : settings,
  };
};

export default updateRuleComponent;
