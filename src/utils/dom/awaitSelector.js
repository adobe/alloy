/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isFunction from "../isFunction.js";
import isNonEmptyArray from "../isNonEmptyArray.js";
import selectNodes from "./selectNodes.js";

const MUTATION_OBSERVER = "MutationObserver";
const RAF = "requestAnimationFrame";
const MUTATION_OBSERVER_CONFIG = { childList: true, subtree: true };
const VISIBILITY_STATE = "visibilityState";
const VISIBLE = "visible";
const DELAY = 100;
const MAX_POLLING_TIMEOUT = 5000;

const createError = (selector) => {
  return new Error(`Could not find: ${selector}`);
};

const createPromise = (executor) => {
  return new Promise(executor);
};

export const canUseMutationObserver = (win) => {
  return isFunction(win[MUTATION_OBSERVER]);
};

export const awaitUsingMutationObserver = (
  win,
  doc,
  selector,
  timeout,
  selectFunc,
) => {
  return createPromise((resolve, reject) => {
    const mutationObserver = new win[MUTATION_OBSERVER](() => {
      const nodes = selectFunc(selector);

      if (isNonEmptyArray(nodes)) {
        mutationObserver.disconnect();
        resolve(nodes);
      }
    });

    setTimeout(() => {
      mutationObserver.disconnect();
      reject(createError(selector));
    }, timeout);

    mutationObserver.observe(doc, MUTATION_OBSERVER_CONFIG);
  });
};

export const canUseRequestAnimationFrame = (doc) => {
  return doc[VISIBILITY_STATE] === VISIBLE;
};

export const awaitUsingRequestAnimation = (
  win,
  selector,
  timeout,
  selectFunc,
) => {
  return createPromise((resolve, reject) => {
    const execute = () => {
      const nodes = selectFunc(selector);

      if (isNonEmptyArray(nodes)) {
        resolve(nodes);
        return;
      }

      win[RAF](execute);
    };

    execute();

    setTimeout(() => {
      reject(createError(selector));
    }, timeout);
  });
};

export const awaitUsingTimer = (selector, timeout, selectFunc) => {
  return createPromise((resolve, reject) => {
    const execute = () => {
      const nodes = selectFunc(selector);

      if (isNonEmptyArray(nodes)) {
        resolve(nodes);
        return;
      }

      setTimeout(execute, DELAY);
    };

    execute();

    setTimeout(() => {
      reject(createError(selector));
    }, timeout);
  });
};

export default (
  selector,
  selectFunc = selectNodes,
  timeout = MAX_POLLING_TIMEOUT,
  win = window,
  doc = document,
) => {
  const nodes = selectFunc(selector);

  if (isNonEmptyArray(nodes)) {
    return Promise.resolve(nodes);
  }

  if (canUseMutationObserver(win)) {
    return awaitUsingMutationObserver(win, doc, selector, timeout, selectFunc);
  }

  if (canUseRequestAnimationFrame(doc)) {
    return awaitUsingRequestAnimation(win, selector, timeout, selectFunc);
  }

  return awaitUsingTimer(selector, timeout, selectFunc);
};
