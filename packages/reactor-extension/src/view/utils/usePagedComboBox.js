/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useRef } from "react";
import createPagedLoader, { IDLE } from "./createPagedLoader";
import useForceRender from "./useForceRender";

const usePagedComboBox = ({
  defaultSelectedItem,
  loadItems,
  getKey,
  getLabel,
  firstPage,
  firstPageCursor,
}) => {
  // This state management has been attempted using useState and
  // useReducer, but it ended up complicating the implementation because
  // we have a decent amount of logic that relies on the most recent state.
  // Because useState sets state asynchronously and useReducer calls the
  // reducer asynchronously, being able to reference the latest state when
  // we need it becomes becomes unwieldy. Note that using useState and useReducer
  // would typically cause the component using our hook to re-render whenever
  // state is updated, so one caveat to using useRef for managing state instead
  // is that we have/get to control when re-renders occur.
  const forceRender = useForceRender();

  const itemsRef = useRef(firstPage || []);
  const selectedItemRef = useRef(defaultSelectedItem || null);
  const inputValueRef = useRef(
    defaultSelectedItem ? getLabel(defaultSelectedItem) : "",
  );
  const loadingStateRef = useRef(IDLE);
  const filteredRef = useRef(false);

  const unfilteredLoaderRef = useRef(null);
  if (unfilteredLoaderRef.current === null) {
    const unfilteredSetData = ({ items, state }) => {
      if (!filteredRef.current) {
        itemsRef.current = items;
        loadingStateRef.current = state;
        forceRender();
      }
    };
    unfilteredLoaderRef.current = createPagedLoader({
      firstPage,
      firstPageCursor,
      loadItems,
      setData: unfilteredSetData,
    });
    // if firstPage wasn't already loaded, go ahead and load it.
    if (!firstPage) {
      unfilteredLoaderRef.current.reload();
    }
  } else {
    // We need to update the loadItems function because there may be
    // changed dependencies.
    unfilteredLoaderRef.current.setLoadItems(loadItems);
  }
  const filteredLoaderRef = useRef(null);
  if (filteredLoaderRef.current === null) {
    const filteredSetData = ({ items, state }) => {
      if (filteredRef.current) {
        itemsRef.current = items;
        loadingStateRef.current = state;
        forceRender();
      }
    };
    filteredLoaderRef.current = createPagedLoader({
      loadItems,
      setData: filteredSetData,
    });
  } else {
    // We need to update the loadItems function because there may be
    // changed dependencies.
    filteredLoaderRef.current.setLoadItems(loadItems);
  }

  const getItem = (key) => {
    // Sometimes getItem is called with a key that doesn't match an item in
    // itemsRef, but instead matches the currently selected item.
    // For example, if a user changes the filter text and then blurs off the ComboBox
    // without selecting a new item, onSelectionChange will be called with the key
    // of the item that was already selected. However, our list of items (itemsRef)
    // may not contain the item that's selected. This would occur for example,
    // if the user typed "X" and our currently selected item didn't have an
    // X in its label, then the user blurred off the ComboBox. In this case,
    // our list of items would only contain items that have an X in their label.
    // For this reason, we _also_ need to check our currently selected item.
    if (selectedItemRef.current && getKey(selectedItemRef.current) === key) {
      return selectedItemRef.current;
    }
    return itemsRef.current.find((item) => key === getKey(item));
  };

  return {
    clear: () => {
      selectedItemRef.current = null;
      inputValueRef.current = "";
      filteredRef.current = false;
      unfilteredLoaderRef.current.reload();
    },
    onInputChange: (inputText) => {
      inputValueRef.current = inputText;
      if (inputText === "") {
        // if the whole input text is blanked out, show the saved unfiltered results.
        filteredRef.current = false;
        unfilteredLoaderRef.current.activate();
      } else {
        filteredRef.current = true;
        filteredLoaderRef.current.filter(inputText, itemsRef.current);
      }
    },
    onSelectionChange: (key) => {
      const newlySelectedItem = getItem(key);
      selectedItemRef.current = newlySelectedItem;
      inputValueRef.current = getLabel(newlySelectedItem);
      filteredRef.current = false;
      unfilteredLoaderRef.current.activate();
    },
    onOpenChange: (isOpen) => {
      // When the menu opens there is nothing to change because we already have the
      // unfiltered items as the current state. However, when the menu closes and
      // we were in filtered mode, we need to reset back to unfiltered mode.
      if (!isOpen && filteredRef.current) {
        inputValueRef.current = getLabel(selectedItemRef.current);
        filteredRef.current = false;
        unfilteredLoaderRef.current.activate();
      }
    },
    onLoadMore: () => {
      if (filteredRef.current) {
        filteredLoaderRef.current.loadMore();
      } else {
        unfilteredLoaderRef.current.loadMore();
      }
    },
    items: itemsRef.current,
    selectedItem: selectedItemRef.current,
    inputValue: inputValueRef.current,
    loadingState: loadingStateRef.current,
  };
};

export default usePagedComboBox;
