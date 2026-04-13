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
const createResultLogMessage = (urlDestination, success) => {
  return `URL destination ${success ? "succeeded" : "failed"}: ${
    urlDestination.spec.url
  }`;
};

export default ({
  fireReferrerHideableImage,
  logger,
  cookieJar,
  isPageSsl,
}) => {
  const extraCookieOptions = isPageSsl
    ? { sameSite: "none", secure: true }
    : {};
  const processCookies = (destinations) => {
    const cookieDestinations = destinations.filter(
      (dest) => dest.type === "cookie",
    );

    cookieDestinations.forEach((dest) => {
      const { name, value, domain, ttlDays } = dest.spec;
      cookieJar.set(name, value || "", {
        domain: domain || "",
        expires: ttlDays || 10, // days
        ...extraCookieOptions,
      });
    });
  };

  const processUrls = async (destinations) => {
    const urlDestinations = destinations.filter((dest) => dest.type === "url");

    await Promise.allSettled(
      urlDestinations.map(async (urlDestination) => {
        try {
          await fireReferrerHideableImage(urlDestination.spec);
          logger.info(createResultLogMessage(urlDestination, true));
        } catch {
          logger.warn(createResultLogMessage(urlDestination, false));
        }
      }),
    );
  };

  return (destinations) => {
    processCookies(destinations);
    return processUrls(destinations);
  };
};
