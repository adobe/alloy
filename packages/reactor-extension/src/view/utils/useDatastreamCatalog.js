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

import { useEffect, useState } from "react";
import fetchSandboxes from "./fetchSandboxes";
import fetchConfigs from "../configuration/utils/fetchConfigs";
import getPartsFromEnvironmentCompositeId from "../configuration/utils/getPartsFromEnvironmentCompositeId";

/**
 * @typedef {Object} DatastreamGroup
 * @property {{ name: string, title: string, isDefault?: boolean }} sandbox
 * @property {Object[]} datastreams
 * @property {boolean} isLoading
 * @property {Error|null} error
 *
 * @typedef {Object} DatastreamCatalog
 * @property {DatastreamGroup[]} groups
 * @property {boolean} isLoading
 * @property {Error|null} error Set when no sandboxes could be loaded.
 * @property {() => void} reload
 */

const PAGE_SIZE = 1000;

const fetchAllConfigs = async ({ orgId, imsAccess, sandbox, signal }) => {
  const datastreams = [];
  let start;
  do {
    // eslint-disable-next-line no-await-in-loop
    const { results, nextPage } = await fetchConfigs({
      orgId,
      imsAccess,
      sandbox,
      signal,
      start,
      limit: PAGE_SIZE,
    });
    datastreams.push(...results);
    start = nextPage
      ? new URL(nextPage, "https://edge.adobe.io").searchParams.get("start")
      : null;
  } while (start);
  return datastreams;
};

const compareSandboxes = (a, b) =>
  Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)) ||
  a.title.localeCompare(b.title);

/**
 * Loads the datastreams of every sandbox the user can see, one request per
 * sandbox, publishing each sandbox's datastreams as soon as they arrive.
 *
 * @param {{ orgId: string, imsAccess: string, isEnabled?: boolean }} options
 * @returns {DatastreamCatalog}
 */
export const useDatastreamCatalog = ({
  orgId,
  imsAccess,
  isEnabled = true,
}) => {
  const [state, setState] = useState({
    groups: [],
    isLoading: isEnabled,
    error: null,
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      setState({ groups: [], isLoading: false, error: null });
      return undefined;
    }
    const controller = new AbortController();
    const { signal } = controller;
    const updateGroup = (sandboxName, changes) => {
      setState((previous) => ({
        ...previous,
        groups: previous.groups.map((group) =>
          group.sandbox.name === sandboxName ? { ...group, ...changes } : group,
        ),
      }));
    };

    const load = async () => {
      setState((previous) => ({ ...previous, isLoading: true, error: null }));
      let sandboxes;
      try {
        ({ results: sandboxes } = await fetchSandboxes({
          orgId,
          imsAccess,
          signal,
        }));
      } catch (error) {
        if (error.name !== "AbortError") {
          setState({ groups: [], isLoading: false, error });
        }
        return;
      }
      if (!sandboxes?.length) {
        setState({
          groups: [],
          isLoading: false,
          error: new Error("No sandboxes are available."),
        });
        return;
      }

      setState((previous) => ({
        ...previous,
        groups: [...sandboxes].sort(compareSandboxes).map((sandbox) => ({
          sandbox,
          // Keep the previous datastreams while reloading so labels don't flicker.
          datastreams:
            previous.groups.find((group) => group.sandbox.name === sandbox.name)
              ?.datastreams ?? [],
          isLoading: true,
          error: null,
        })),
      }));

      await Promise.all(
        sandboxes.map(async ({ name }) => {
          try {
            const datastreams = await fetchAllConfigs({
              orgId,
              imsAccess,
              sandbox: name,
              signal,
            });
            updateGroup(name, { datastreams, isLoading: false });
          } catch (error) {
            if (error.name !== "AbortError") {
              updateGroup(name, { datastreams: [], isLoading: false, error });
            }
          }
        }),
      );
      if (!signal.aborted) {
        setState((previous) => ({ ...previous, isLoading: false }));
      }
    };

    load();
    return () => controller.abort();
  }, [orgId, imsAccess, isEnabled, reloadCount]);

  return {
    ...state,
    reload: () => setReloadCount((count) => count + 1),
  };
};

/**
 * Finds the datastream a saved value refers to. Legacy composite IDs
 * ("<id>:<environment>") resolve to their datastream, but are reported as
 * inexact so they are displayed and saved as entered.
 *
 * @param {DatastreamGroup[]} groups
 * @param {string} value
 * @returns {{ datastream: Object, sandbox: Object, isExact: boolean } | undefined}
 */
export const findDatastream = (groups, value) => {
  if (!value) {
    return undefined;
  }
  const findById = (id) => {
    for (const { sandbox, datastreams } of groups) {
      const datastream = datastreams.find(({ _system }) => _system.id === id);
      if (datastream) {
        return { datastream, sandbox };
      }
    }
    return undefined;
  };
  const exactMatch = findById(value);
  if (exactMatch) {
    return { ...exactMatch, isExact: true };
  }
  const { edgeConfigId } = getPartsFromEnvironmentCompositeId(value);
  const baseMatch = edgeConfigId !== value && findById(edgeConfigId);
  return baseMatch ? { ...baseMatch, isExact: false } : undefined;
};
