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

import { assign, cookie, fireDestinations } from "../../utils";

export default ({ destinations, config, logger }) => {
  const { destinationsEnabled = true } = config;

  if (destinationsEnabled) {
    const urlDestinations = destinations
      .filter(dest => dest.type === "url")
      .map(dest =>
        assign(
          {
            id: dest.id
          },
          dest.spec
        )
      );

    if (urlDestinations.length) {
      fireDestinations({
        logger,
        destinations: urlDestinations
      });
    }

    const cookieDestinations = destinations
      .filter(dest => dest.type === "cookie")
      .map(dest => dest.spec);

    cookieDestinations.forEach(dest => {
      cookie.set(dest.name, dest.value || "", {
        domain: dest.domain || "",
        expires: dest.ttl ? dest.ttl : 6 * 30 // default of 6 months
      });
    });
  }
};
