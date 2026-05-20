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

import fetchFromReactor from "./fetchFromReactor";
import UserReportableError from "../errors/userReportableError";

// EXTENSION_NAME will be replaced with this extension's name at build time.
const ACTION_DELEGATE_ID_PREFIX = "__EXTENSION_NAME__::actions::";

const PAGE_SIZE = "100";

const isExtensionAction = (delegateDescriptorId) =>
  typeof delegateDescriptorId === "string" &&
  delegateDescriptorId.startsWith(ACTION_DELEGATE_ID_PREFIX);

const parseSettings = (settings) => {
  if (typeof settings !== "string" || settings === "") return {};
  try {
    return JSON.parse(settings);
  } catch {
    return {};
  }
};

/**
 * Fetches every rule_component on a single rule, paging through Reactor's
 * `/rules/{ruleId}/rule_components` endpoint, and returns the ones that
 * belong to this extension's actions.
 */
const fetchActionsForRule = async ({ orgId, imsAccess, ruleId, signal }) => {
  const components = [];
  let pageNumber = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = new URLSearchParams({
      "page[size]": PAGE_SIZE,
      "page[number]": `${pageNumber}`,
    });

    // eslint-disable-next-line no-await-in-loop
    const response = await fetchFromReactor({
      orgId,
      imsAccess,
      path: `/rules/${ruleId}/rule_components`,
      params,
      signal,
    });

    const data = response.parsedBody?.data ?? [];
    data.forEach((entry) => {
      const ddi = entry.attributes?.delegate_descriptor_id;
      if (!isExtensionAction(ddi)) return;
      components.push({
        id: entry.id,
        name: entry.attributes.name ?? "",
        delegateDescriptorId: ddi,
        settings: parseSettings(entry.attributes.settings),
      });
    });

    const nextPage = response.parsedBody?.meta?.pagination?.next_page ?? null;
    if (nextPage === null) break;
    pageNumber = nextPage;
  }
  return components;
};

/**
 * Fetches one page of rules for a property and then, for each rule on that
 * page, fetches the rule's components in parallel. Returns the flattened
 * list of action rule_components on those rules that belong to this
 * extension, each annotated with its containing rule's name.
 *
 * Why N+1 (one rules page + one fetch per rule):
 *
 *   Reactor does not expose `GET /properties/{id}/rule_components` (that
 *   path returns 405). The rules endpoint accepts `include=rule_components`
 *   in JSON:API syntax, but Reactor does not appear to honor it for that
 *   relationship — the `included` array comes back empty, so a single-
 *   request approach silently reports zero components.
 *
 *   The canonical Reactor endpoint for listing components is nested under
 *   a rule (`/rules/{rule_id}/rule_components`). Fetching one page of
 *   rules and parallelizing the per-rule component fetches within that
 *   page is correct and bounded — Reactor's HTTP/2 connection multiplexes
 *   the requests, and the page size caps the parallel fanout at 100.
 *
 * Pagination iterates rules: callers drive the loop by calling again with
 * `page: nextPage` until `nextPage` is `null`. Each page's `results` is a
 * flattened list of action components from the rules on that page.
 * `totalCount` reports the total number of rules in the property (pre-
 * filter); the running-UI surfaces this as "across N rules".
 *
 * @param {object} options
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {string} options.propertyId
 * @param {number} [options.page=1]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{
 *   results: Array<{
 *     id: string,
 *     name: string,
 *     delegateDescriptorId: string,
 *     settings: object,
 *     ruleId: string|null,
 *     ruleName: string|null
 *   }>,
 *   nextPage: number|null,
 *   totalCount: number|null
 * }>}
 */
const fetchExtensionActionRuleComponents = async ({
  orgId,
  imsAccess,
  propertyId,
  page = 1,
  signal,
}) => {
  const params = new URLSearchParams({
    "page[size]": PAGE_SIZE,
    "page[number]": `${page}`,
  });

  let rulesResponse;
  try {
    rulesResponse = await fetchFromReactor({
      orgId,
      imsAccess,
      path: `/properties/${propertyId}/rules`,
      params,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError("Failed to load rules.", {
      originatingError: e,
    });
  }

  const body = rulesResponse.parsedBody || {};
  const rules = Array.isArray(body.data) ? body.data : [];

  let componentsByRule;
  try {
    componentsByRule = await Promise.all(
      rules.map((rule) =>
        fetchActionsForRule({
          orgId,
          imsAccess,
          ruleId: rule.id,
          signal,
        }),
      ),
    );
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError("Failed to load rule components.", {
      originatingError: e,
    });
  }

  const results = [];
  rules.forEach((rule, idx) => {
    const ruleName = rule.attributes?.name ?? null;
    componentsByRule[idx].forEach((component) => {
      results.push({ ...component, ruleId: rule.id, ruleName });
    });
  });

  const nextPage = body.meta?.pagination?.next_page ?? null;
  const totalCount = body.meta?.pagination?.total_count ?? null;

  return { results, nextPage, totalCount };
};

export default fetchExtensionActionRuleComponents;
