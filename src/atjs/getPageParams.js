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
import { includes } from "../utils";

const SUPPORTED_PARAMS = ["profile"];

const supportedParamsOnly = params => {
  return Object.keys(params).reduce((tot, key) => {
    if (includes(SUPPORTED_PARAMS, key)) {
      tot[key] = params[key];
    }
    return tot;
  }, {});
};

export default (win = window) => {
  const { targetPageParamsAll = () => {}, targetPageParams = () => {} } = win;

  return {
    all: supportedParamsOnly(targetPageParamsAll()),
    pageLoad: supportedParamsOnly(targetPageParams())
  };
};
