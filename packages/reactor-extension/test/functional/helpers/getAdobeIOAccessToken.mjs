/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fs from "fs";
import { auth } from "@adobe/auth-token";

export default ({ clientId, clientSecret }) => {
  const tokenPath = ".token-cache.json";

  // Check if token is cached not expired
  if (fs.existsSync(tokenPath)) {
    const cachedToken = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    if (new Date().getTime() < cachedToken.expiry) {
      return cachedToken.access_token;
    }
  }

  if (!clientSecret) {
    throw new Error("Missing client secret.");
  }

  // Fetch new token
  const options = {
    clientId,
    clientSecret,
    scope: [
      "reactor_approver",
      "reactor_publisher",
      "assurance_read_plugins",
      "reactor_developer",
      "assurance_read_annotations",
      "openid",
      "session",
      "AdobeID",
      "read_organizations",
      "reactor_extension_developer",
      "assurance_read_events",
      "additional_info.job_function",
      "assurance_manage_sessions",
      "reactor_it_admin",
      "assurance_read_session_annotations",
      "reactor_admin",
      "additional_info.roles",
      "additional_info.projectedProductContext",
      "assurance_read_clients",
    ].join(","),
  };

  return auth(options).then(
    ({ access_token: accessToken, expires_in: expiresIn }) => {
      // Calculate expiry time (current time + expires_in seconds - 2 hour buffer)
      const expiry = new Date().getTime() + (expiresIn - 7200) * 1000;
      // Cache the token
      fs.writeFileSync(
        tokenPath,
        JSON.stringify({ access_token: accessToken, expiry }),
        "utf8",
      );
      return accessToken;
    },
  );
};
