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

import { noop } from "../../utils";

const createResultLogMessage = (urlDestination, success) => {
  return `URL destination ${success ? "succeeded" : "failed"}: ${
    urlDestination.spec.url
  }`;
};

const processUrls = (fireReferrerHideableImage, logger, destinations) => {
  const urlDestinations = destinations.filter(dest => dest.type === "url");

  return Promise.all(
    urlDestinations.map(urlDestination => {
      return fireReferrerHideableImage(urlDestination.spec)
        .then(() => {
          logger.info(createResultLogMessage(urlDestination, true));
        })
        .catch(() => {
          // We intentionally do not throw an error if destinations fail. We
          // consider it a non-critical failure and therefore do not want it to
          // reject the promise handed back to the customer.
          logger.error(createResultLogMessage(urlDestination, false));
        });
    })
  ).then(noop);
};

const processCookies = (destinations, cookieJar) => {
  const cookieDestinations = destinations.filter(
    dest => dest.type === "cookie"
  );

  cookieDestinations.forEach(dest => {
    const { name, value, domain, ttlDays } = dest.spec;
    cookieJar.set(name, value || "", {
      domain: domain || "",
      expires: ttlDays || 10 // days
    });
  });
};

export default ({ fireReferrerHideableImage, logger, cookieJar }) => destinations => {
  processCookies(destinations, cookieJar);
  return processUrls(fireReferrerHideableImage, logger, destinations);
};
