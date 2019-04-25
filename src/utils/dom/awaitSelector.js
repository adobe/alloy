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

import isFunction from "../isFunction";
import isNonEmptyArray from "../isNonEmptyArray";
import delay from "../delay";
import Promise from "../Promise";
import selectNodes from "./selectNodes";

const MUTATION_OBSERVER = "MutationObserver";
const RAF = "requestAnimationFrame";
const MO_CONFIG = { childList: true, subtree: true };
const VISIBILITY_STATE = "visibilityState";
const VISIBLE = "visible";
const DELAY = 100;
const MAX_POLLING_TIMEOUT = 5000;

function createError(selector) {
  return new Error(`Could not find: ${selector}`);
}

function createPromise(func) {
  return new Promise(func);
}

export function canUseMutationObserver(win) {
  return isFunction(win[MUTATION_OBSERVER]);
}

export function awaitUsingMutationObserver(
  win,
  doc,
  selector,
  timeout,
  selectFunc
) {
  return createPromise((res, rej) => {
    const mo = new win[MUTATION_OBSERVER](() => {
      const elems = selectFunc(selector);

      if (isNonEmptyArray(elems)) {
        mo.disconnect();
        res(elems);
      }
    });

    delay(() => {
      mo.disconnect();
      rej(createError(selector));
    }, timeout);

    mo.observe(doc, MO_CONFIG);
  });
}

export function canUseRequestAnimationFrame(doc) {
  return doc[VISIBILITY_STATE] === VISIBLE;
}

export function awaitUsingRequestAnimation(win, selector, timeout, selectFunc) {
  return createPromise((res, rej) => {
    function execute() {
      const elems = selectFunc(selector);

      if (isNonEmptyArray(elems)) {
        res(elems);
        return;
      }

      win[RAF](execute);
    }

    execute();

    delay(() => {
      rej(createError(selector));
    }, timeout);
  });
}

export function awaitUsingTimer(selector, timeout, selectFunc) {
  return createPromise((res, rej) => {
    function execute() {
      const elems = selectFunc(selector);

      if (isNonEmptyArray(elems)) {
        res(elems);
        return;
      }

      delay(execute, DELAY);
    }

    execute();

    delay(() => {
      rej(createError(selector));
    }, timeout);
  });
}

export default function awaitSelector(
  selector,
  timeout = MAX_POLLING_TIMEOUT,
  selectFunc = selectNodes,
  win = window,
  doc = document
) {
  const elems = selectFunc(selector);

  if (isNonEmptyArray(elems)) {
    return Promise.resolve(elems);
  }

  if (canUseMutationObserver(win)) {
    return awaitUsingMutationObserver(win, doc, selector, timeout, selectFunc);
  }

  if (canUseRequestAnimationFrame(doc)) {
    return awaitUsingRequestAnimation(win, selector, timeout, selectFunc);
  }

  return awaitUsingTimer(selector, timeout, selectFunc);
}
