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

import fetchDataElements, { fetchDataElement } from "./fetchDataElements";
import buildDataElementIndex from "./buildDataElementIndex";
import fetchExtensionActionRuleComponents from "./fetchExtensionActionRuleComponents";
import updateRuleComponent from "./updateRuleComponent";

export const SKIP_REASON = {
  MISSING_NAME: "missing-name",
  NO_NAME_MATCH: "no-name-match",
  AMBIGUOUS_NAME: "ambiguous-name",
};

export const PHASE = {
  INDEXING: "indexing",
  SCANNING: "scanning",
};

const isAborted = (signal) => Boolean(signal && signal.aborted);

/**
 * @typedef {object} RepairedEntry
 * @property {string} ruleComponentId
 * @property {string|null} ruleName
 * @property {string} actionName
 * @property {string} dataElementName - The name of the matched DE on this property.
 * @property {string} oldDataElementId - The stale ID the action previously referenced.
 * @property {string} newDataElementId - The repaired ID (the matched DE's id).
 */

/**
 * @typedef {object} SkippedEntry
 * @property {string} ruleComponentId
 * @property {string|null} ruleName
 * @property {string} actionName
 * @property {string} [dataElementName] - The name that was attempted (absent for MISSING_NAME).
 * @property {string} reason - One of the {@link SKIP_REASON} values.
 * @property {string[]} [candidates] - Candidate DE IDs for the ambiguous case.
 */

/**
 * @typedef {object} FailedEntry
 * @property {string} ruleComponentId
 * @property {string|null} ruleName
 * @property {string} actionName
 * @property {string} error - Surfaced from the PATCH error.
 */

/**
 * @typedef {object} RepairResult
 * @property {number} scanned - Total in-scope actions iterated.
 * @property {RepairedEntry[]} repaired
 * @property {SkippedEntry[]} skipped
 * @property {FailedEntry[]} failed
 * @property {number|null} totalCount - Property's total rules (the pagination
 *   denominator); the per-action `scanned` count is the meaningful one.
 * @property {boolean} cancelled - True if the run was aborted via signal.
 * @property {string|React.ReactNode|null} fatalError - Orchestrator-level
 *   failure message (initial DE fetch, rule-components page fetch, etc.).
 *   May be a React node when surfacing a wrapped `UserReportableError`.
 */

/**
 * @typedef {object} ProgressEvent
 * @property {"indexing"|"scanning"} phase
 * @property {number} scanned
 * @property {number} repaired
 * @property {number} skipped
 * @property {number} failed
 * @property {number|null} totalCount
 */

/**
 * Orchestrates the property-wide repair: fetches every variable-type data
 * element on the property, indexes them, then pages through every action
 * rule_component on the property that belongs to this extension. For each
 * action with a stale `dataElementId`, attempts a conservative repair by
 * resolving the source DE's name (preferring the action's saved name and
 * falling back to a global ID lookup) and matching that name against the
 * property's index. The orchestrator catches all non-AbortError exceptions
 * and surfaces them via `result.fatalError`, so the returned promise always
 * resolves with a {@link RepairResult}.
 *
 * @param {object} options
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {string} options.propertyId
 * @param {AbortSignal} [options.signal]
 * @param {(event: ProgressEvent) => void} [options.onProgress] - Called once
 *   when the indexing phase begins and again after every per-action update
 *   during the scan phase. Receives count-only summaries; consult the
 *   returned result for the per-entry detail arrays.
 * @returns {Promise<RepairResult>}
 */
const repairStaleDataElementReferences = async ({
  orgId,
  imsAccess,
  propertyId,
  signal,
  onProgress = () => {},
}) => {
  const result = {
    scanned: 0,
    repaired: [],
    skipped: [],
    failed: [],
    totalCount: null,
    cancelled: false,
    fatalError: null,
  };

  const emit = (phase) => {
    onProgress({
      phase,
      scanned: result.scanned,
      repaired: result.repaired.length,
      skipped: result.skipped.length,
      failed: result.failed.length,
      totalCount: result.totalCount,
    });
  };

  try {
    emit(PHASE.INDEXING);

    const { results: dataElements } = await fetchDataElements({
      orgId,
      imsAccess,
      propertyId,
      fetchAllPages: true,
      signal,
    });

    if (isAborted(signal)) {
      result.cancelled = true;
      return result;
    }

    const index = buildDataElementIndex(dataElements);

    // Cache for the recovery path: when an action is missing `dataElementName`
    // in its settings, we look up the stale `dataElementId` via the global
    // `/data_elements/{id}` endpoint to learn the source DE's name. Multiple
    // copied actions can share the same stale ID; cache successes (the name)
    // and failures (null) so we hit Reactor at most once per stale ID.
    const staleIdNameCache = new Map();

    let nextPage = 1;
    let firstPage = true;

    while (nextPage !== null) {
      if (isAborted(signal)) {
        result.cancelled = true;
        break;
      }

      // eslint-disable-next-line no-await-in-loop
      const page = await fetchExtensionActionRuleComponents({
        orgId,
        imsAccess,
        propertyId,
        page: nextPage,
        signal,
      });

      if (firstPage) {
        result.totalCount = page.totalCount;
        firstPage = false;
        emit(PHASE.SCANNING);
      }

      for (const ruleComponent of page.results) {
        if (isAborted(signal)) {
          result.cancelled = true;
          break;
        }

        result.scanned += 1;
        // eslint-disable-next-line no-await-in-loop
        await processRuleComponent({
          ruleComponent,
          index,
          orgId,
          imsAccess,
          signal,
          result,
          staleIdNameCache,
        });
        emit(PHASE.SCANNING);
      }

      if (result.cancelled) break;
      nextPage = page.nextPage;
    }
  } catch (e) {
    if (e.name === "AbortError") {
      result.cancelled = true;
      return result;
    }
    // A failure at the orchestrator level (e.g. the initial data-element fetch
    // or a rule-components page fetch) means we can't continue. Per-action
    // PATCH failures are isolated separately in `result.failed`.
    result.fatalError = e?.message || String(e);
    return result;
  }

  return result;
};

/**
 * Resolves a stale `dataElementId` to a name via Reactor's global
 * `/data_elements/{id}` endpoint. Caches each lookup per run (including
 * failures, which cache `null`) so multiple actions referencing the same
 * stale ID trigger at most one network call per run.
 *
 * @param {object} options
 * @param {string} options.dataElementId
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {AbortSignal} [options.signal]
 * @param {Map<string, string|null>} options.staleIdNameCache - Per-run cache.
 * @returns {Promise<string|null>} The resolved name, or `null` if the DE
 *   could not be fetched (deleted, network error, etc.).
 * @throws {Error} Rethrows AbortError so the orchestrator can mark the run
 *   as cancelled.
 */
const resolveStaleIdName = async ({
  dataElementId,
  orgId,
  imsAccess,
  signal,
  staleIdNameCache,
}) => {
  if (staleIdNameCache.has(dataElementId)) {
    return staleIdNameCache.get(dataElementId);
  }
  let name = null;
  try {
    const sourceDataElement = await fetchDataElement({
      orgId,
      imsAccess,
      dataElementId,
      signal,
    });
    name = sourceDataElement?.name ?? null;
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    // Source DE may have been deleted (404) or otherwise unfetchable. Cache
    // the null so we don't retry this ID for subsequent actions.
  }
  staleIdNameCache.set(dataElementId, name);
  return name;
};

/**
 * Classifies a single in-scope action and either repairs it (PATCH),
 * records a skip with a reason, or records a failure with the error. Side-
 * effects the orchestrator's `result` arrays directly. Stops at the first
 * await whose AbortError indicates a cancellation, rethrowing so the
 * outer loop terminates cleanly.
 *
 * @param {object} options
 * @param {object} options.ruleComponent - One entry from
 *   `fetchExtensionActionRuleComponents`'s `results` array.
 * @param {{byId: Map<string, object>, byName: Map<string, object[]>}} options.index
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {AbortSignal} [options.signal]
 * @param {RepairResult} options.result - Mutated in place.
 * @param {Map<string, string|null>} options.staleIdNameCache - Per-run
 *   cache shared with the recovery path.
 * @returns {Promise<void>}
 */
const processRuleComponent = async ({
  ruleComponent,
  index,
  orgId,
  imsAccess,
  signal,
  result,
  staleIdNameCache,
}) => {
  const { id, settings, ruleName, name: actionName } = ruleComponent;

  const dataElementId = settings?.dataElementId;
  if (!dataElementId) {
    // Action doesn't store a data element reference — nothing to do.
    return;
  }

  if (index.byId.has(dataElementId)) {
    // Reference still resolves on this property — leave it alone.
    return;
  }

  // Stale reference. Prefer the name the action saved alongside the ID
  // (added in #1503). For actions saved before that, fall back to looking
  // up the original DE by its global ID to learn its name — Reactor IDs
  // are not property-scoped, so a stale ID still resolves on the source
  // property as long as that DE hasn't been deleted there.
  let nameToMatch = settings.dataElementName;
  let nameCameFromLookup = false;
  if (!nameToMatch) {
    nameToMatch = await resolveStaleIdName({
      dataElementId,
      orgId,
      imsAccess,
      signal,
      staleIdNameCache,
    });
    nameCameFromLookup = true;
  }

  if (!nameToMatch) {
    result.skipped.push({
      ruleComponentId: id,
      ruleName,
      actionName,
      reason: SKIP_REASON.MISSING_NAME,
    });
    return;
  }

  let candidates = index.byName.get(nameToMatch) || [];

  // The saved `dataElementName` can be out of date — a user can rename a
  // DE without re-opening every action that references it (the action's
  // runtime behavior is unaffected as long as the ID still resolves). When
  // the property is then copied, the saved name no longer matches anything
  // on the destination. Try the global ID lookup once to learn the source
  // DE's current name and retry the local search. The lookup is cached, so
  // many copied actions sharing the same stale ID hit Reactor only once.
  if (candidates.length === 0 && !nameCameFromLookup) {
    const freshName = await resolveStaleIdName({
      dataElementId,
      orgId,
      imsAccess,
      signal,
      staleIdNameCache,
    });
    if (freshName && freshName !== nameToMatch) {
      nameToMatch = freshName;
      candidates = index.byName.get(nameToMatch) || [];
    }
  }

  if (candidates.length === 0) {
    result.skipped.push({
      ruleComponentId: id,
      ruleName,
      actionName,
      dataElementName: nameToMatch,
      reason: SKIP_REASON.NO_NAME_MATCH,
    });
    return;
  }
  if (candidates.length > 1) {
    result.skipped.push({
      ruleComponentId: id,
      ruleName,
      actionName,
      dataElementName: nameToMatch,
      reason: SKIP_REASON.AMBIGUOUS_NAME,
      candidates: candidates.map((c) => c.id),
    });
    return;
  }

  const [match] = candidates;
  try {
    await updateRuleComponent({
      orgId,
      imsAccess,
      ruleComponentId: id,
      // Always write `dataElementName` alongside the repaired ID — even if
      // the original settings were missing it. This makes future repairs
      // (#1503's per-action path, and this orchestrator's primary path)
      // work without needing the global ID-lookup fallback.
      settings: {
        ...settings,
        dataElementId: match.id,
        dataElementName: match.name,
      },
      signal,
    });
    result.repaired.push({
      ruleComponentId: id,
      ruleName,
      actionName,
      dataElementName: match.name,
      oldDataElementId: dataElementId,
      newDataElementId: match.id,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    result.failed.push({
      ruleComponentId: id,
      ruleName,
      actionName,
      error: e?.message || String(e),
    });
  }
};

export default repairStaleDataElementReferences;
