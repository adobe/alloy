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

import { createLoggingCookieJar, cookieJar } from "../../utils/index.js";
import injectProcessDestinations from "./injectProcessDestinations.js";
import injectProcessResponse from "./injectProcessResponse.js";

const createAudiences = ({ logger, fireReferrerHideableImage }) => {
  // we override the js-cookie converter to encode the cookie value similar on how it is in DIL (PDCL-10238)
  const cookieJarWithEncoding = cookieJar.withConverter({
    write: value => {
      return encodeURIComponent(value);
    }
  });
  const loggingCookieJar = createLoggingCookieJar({
    logger,
    cookieJar: cookieJarWithEncoding
  });

  const processDestinations = injectProcessDestinations({
    fireReferrerHideableImage,
    logger,
    cookieJar: loggingCookieJar,
    isPageSsl: window.location.protocol === "https:"
  });

  const processResponse = injectProcessResponse({ processDestinations });

  return {
    lifecycle: {
      onResponse: processResponse
    },
    commands: {}
  };
};

createAudiences.namespace = "Audiences";

export default createAudiences;
