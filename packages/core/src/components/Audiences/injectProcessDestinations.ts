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
import type { Logger } from "../../core/types.js";
import type { CookieService, GlobalsService } from "../../services/types.js";

export interface CookieDestination {
  type: "cookie";
  spec: { name: string; value?: string; domain?: string; ttlDays?: number };
}

export interface UrlDestination {
  type: "url";
  spec: { url: string; hideReferrer: boolean };
}

export type Destination = CookieDestination | UrlDestination;

export interface ProcessDestinationsOptions {
  fireReferrerHideableImage: GlobalsService["fireReferrerHideableImage"];
  logger: Logger;
  cookieJar: Pick<CookieService, "set">;
  isPageSsl: boolean;
}

export type ProcessDestinations = (
  destinations: Destination[],
) => Promise<unknown>;

const createResultLogMessage = (
  urlDestination: UrlDestination,
  success: boolean,
) => {
  return `URL destination ${success ? "succeeded" : "failed"}: ${
    urlDestination.spec.url
  }`;
};

export default ({
  fireReferrerHideableImage,
  logger,
  cookieJar,
  isPageSsl,
}: ProcessDestinationsOptions): ProcessDestinations => {
  const extraCookieOptions = isPageSsl
    ? { sameSite: "none" as const, secure: true }
    : {};
  const processCookies = (destinations: Destination[]) => {
    const cookieDestinations = destinations.filter(
      (dest): dest is CookieDestination => dest.type === "cookie",
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

  const processUrls = async (destinations: Destination[]) => {
    const urlDestinations = destinations.filter(
      (dest): dest is UrlDestination => dest.type === "url",
    );

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

  return (destinations: Destination[]) => {
    processCookies(destinations);
    return processUrls(destinations);
  };
};
