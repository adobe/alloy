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

import xhrRequestFactory from "./xhrRequest";
import fetchFactory from "./fetch";
import sendBeaconFactory from "./sendBeacon";
import isFunction from "../../utils/isFunction";

export default (window, logger) => {
  const fetch = isFunction(window.fetch)
    ? fetchFactory(window.fetch)
    : xhrRequestFactory(window.XMLHttpRequest);
  const sendBeacon =
    window.navigator && isFunction(window.navigator.sendBeacon)
      ? sendBeaconFactory(window.navigator, fetch, logger)
      : fetch;

  return (url, body, documentUnloading) => {
    const method = !documentUnloading ? fetch : sendBeacon;
    return method(url, body);
  };
};
