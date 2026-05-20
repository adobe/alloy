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

import fetchDataElements from "./fetchDataElements";
import fetchDataElement from "./fetchDataElement";
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
