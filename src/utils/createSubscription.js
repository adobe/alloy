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

const defaultPreprocessor = (params, ...args) => {
  return args;
};

// eslint-disable-next-line no-unused-vars
const defaultEmissionCondition = (params, ...args) => true;

const createSubscription = () => {
  let preprocessor = defaultPreprocessor;
  let emissionCondition = defaultEmissionCondition;
  let counter = 0;
  const subscriptions = {};

  const createUnsubscribe = (id) => {
    return () => {
      delete subscriptions[id];
    };
  };

  const add = (callback, params = undefined) => {
    if (typeof callback !== "function") {
      return () => undefined;
    }

    counter += 1;

    subscriptions[counter] = { callback, params };
    return createUnsubscribe(counter);
  };

  const setEmissionPreprocessor = (value) => {
    if (typeof value === "function") {
      preprocessor = value;
    }
  };

  const setEmissionCondition = (value) => {
    if (typeof value === "function") {
      emissionCondition = value;
    }
  };

  const emit = (...args) => {
    Object.values(subscriptions).forEach(({ callback, params }) => {
      const result = preprocessor(params, ...args);
      if (emissionCondition(params, ...result)) {
        callback(...result);
      }
    });
  };

  const hasSubscriptions = () => Object.keys(subscriptions).length > 0;

  return {
    add,
    emit,
    hasSubscriptions,
    setEmissionPreprocessor,
    setEmissionCondition,
  };
};

export default createSubscription;
