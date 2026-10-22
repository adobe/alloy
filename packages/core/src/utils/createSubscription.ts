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

type Callback = (...args: unknown[]) => unknown;
type Preprocessor = (params: unknown, ...args: unknown[]) => unknown[];
type EmissionCondition = (params: unknown, ...args: unknown[]) => boolean;

const defaultPreprocessor: Preprocessor = (params, ...args) => {
  return args;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultEmissionCondition: EmissionCondition = (params, ...args) => true;

const createSubscription = () => {
  let preprocessor = defaultPreprocessor;
  let emissionCondition = defaultEmissionCondition;
  let counter = 0;
  const subscriptions: Record<number, { callback: Callback; params: unknown }> =
    {};

  const createUnsubscribe = (id: number) => {
    return () => {
      delete subscriptions[id];
    };
  };

  const add = (callback: Callback, params: unknown = undefined) => {
    if (typeof callback !== "function") {
      return () => undefined;
    }

    counter += 1;

    subscriptions[counter] = { callback, params };
    return { id: counter, unsubscribe: createUnsubscribe(counter) };
  };

  const setEmissionPreprocessor = (value: Preprocessor) => {
    if (typeof value === "function") {
      preprocessor = value;
    }
  };

  const setEmissionCondition = (value: EmissionCondition) => {
    if (typeof value === "function") {
      emissionCondition = value;
    }
  };

  const emit = (...args: unknown[]) => {
    Object.values(subscriptions).forEach(({ callback, params }) => {
      const result = preprocessor(params, ...args);
      if (emissionCondition(params, ...result)) {
        callback(...result);
      }
    });
  };

  const emitOne = (subscriptionId: number, ...args: unknown[]) => {
    if (!subscriptionId || !subscriptions[subscriptionId]) {
      return;
    }

    const { callback, params } = subscriptions[subscriptionId];

    const result = preprocessor(params, ...args);
    if (emissionCondition(params, ...result)) {
      callback(...result);
    }
  };

  const hasSubscriptions = () => Object.keys(subscriptions).length > 0;

  return {
    add,
    emit,
    emitOne,
    hasSubscriptions,
    setEmissionPreprocessor,
    setEmissionCondition,
  };
};

export default createSubscription;
