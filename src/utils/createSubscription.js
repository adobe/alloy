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
const createSubscription = () => {
  let counter = 0;
  const subscriptions = {};

  const createUnsubscribe = id => {
    return () => {
      delete subscriptions[id];
    };
  };

  const add = callback => {
    if (typeof callback !== "function") {
      return () => undefined;
    }

    counter += 1;
    subscriptions[counter] = callback;
    return createUnsubscribe(counter);
  };

  const emit = (...args) => {
    Object.values(subscriptions).forEach(callback => {
      callback(...args);
    });
  };

  const hasSubscriptions = () => Object.keys(subscriptions).length > 0;

  return {
    add,
    emit,
    hasSubscriptions
  };
};

export default createSubscription;
