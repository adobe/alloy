/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const IDLE = "idle";
export const LOADING = "loading";
export const LOADING_MORE = "loadingMore";
export const FILTERING = "filtering";

export default ({
  firstPage = [],
  firstPageCursor = null,
  setData,
  loadItems,
}) => {
  let items = firstPage;
  let cursor = firstPageCursor;
  let state = IDLE;
  let filterText = "";
  let abortController;
  let currentLoadItems = loadItems;

  const load = async (loadingState) => {
    state = loadingState;
    setData({ items, state });
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    const currentAbortController = abortController;
    let newItems;
    let newCursor;
    try {
      ({ items: newItems, cursor: newCursor } = await currentLoadItems({
        filterText,
        cursor,
        signal: currentAbortController.signal,
      }));
    } catch (e) {
      // Most of the times this is an AbortError, but for everything
      // else the loadItems function should handle the error itself.
      if (e.name !== "AbortError") {
        return;
      }
    }

    if (currentAbortController.signal.aborted) {
      return;
    }

    items = cursor ? items.concat(newItems) : newItems;
    cursor = newCursor;
    state = IDLE;
    setData({ items, state });
  };

  return {
    activate() {
      setData({ items, state });
    },
    reload() {
      items = [];
      cursor = null;
      load(LOADING);
    },
    loadMore() {
      if (state === IDLE && cursor) {
        load(LOADING_MORE);
      }
    },
    filter(text, previousItems) {
      // If we blank out the items when filtering, the combobox shows "No Results" even before
      // the async call returns. By setting it to the previous items, the combobox shows the items
      // that were available before with a spinner. When the async call returns the items are filtered.
      items = previousItems;
      cursor = null;
      filterText = text;
      load(FILTERING);
    },
    setLoadItems(newLoadItems) {
      currentLoadItems = newLoadItems;
    },
  };
};
