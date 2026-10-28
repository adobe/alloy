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

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";

const createFormStore = () => {
  let state;
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (nextState) => {
      state = nextState;
    },
    notify: () => listeners.forEach((listener) => listener()),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const FormStoreContext = createContext(null);

/**
 * Mirrors the surrounding Formik state into an external store so that
 * components can subscribe to the slices they use instead of the whole
 * Formik context.
 */
export const FormStoreProvider = ({ children }) => {
  const formik = useFormikContext();
  const [store] = useState(createFormStore);
  // Set during render so descendants rendering in this pass read the same
  // state as Formik; subscribers outside this pass are notified after commit.
  store.setState(formik);
  useLayoutEffect(() => store.notify());
  return (
    <FormStoreContext.Provider value={store}>
      {children}
    </FormStoreContext.Provider>
  );
};

FormStoreProvider.propTypes = {
  children: PropTypes.node,
};

export const useFormStore = () => useContext(FormStoreContext);

/**
 * Returns a stable function that reads the current Formik state without
 * subscribing to it; use for event handlers and effects.
 */
export const useGetFormState = () => useFormStore().getState;

/**
 * Re-renders only when the selected value changes (by Object.is), so
 * selectors should return primitives or existing references.
 */
export const useFormSelector = (selector) => {
  const store = useFormStore();
  return useSyncExternalStore(store.subscribe, () =>
    selector(store.getState()),
  );
};
