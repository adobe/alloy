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
import chalk from "chalk";
import fs from "fs";

export const IMS_URL = process.env.IMS_URL || "https://ims-na1.adobelogin.com";
// default to Unified JS QE Only org
export const ASSURANCE_ORG_ID =
  process.env.ASSURANCE_ORG_ID || "5BFE274A5F6980A50A495C08@AdobeOrg";
// default to "Alloy end to end testing" project
export const ASSURANCE_CLIENT_ID =
  process.env.ASSURANCE_CLIENT_ID || "0c1c7478c4994c69866b64c8341578ed";
export const ASSURANCE_TECHNICAL_ACCOUNT_ID =
  process.env.ASSURANCE_TECHNICAL_ACCOUNT_ID ||
  "52202EB9602F004D0A495F8C@techacct.adobe.com";
// Use the Adobe developer console to get the client secret for the client ID above.
export const ASSURANCE_CLIENT_SECRET = process.env.ASSURANCE_CLIENT_SECRET;
// Use the Adobe developer console to generate a private key
export const ASSURANCE_PRIVATE_KEY_FILE =
  process.env.ASSURANCE_PRIVATE_KEY_FILE;
export const ASSURANCE_PRIVATE_KEY_CONTENTS =
  process.env.ASSURANCE_PRIVATE_KEY_CONTENTS;

if (!ASSURANCE_CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.redBright(
      `Failed to read client secret. Please ensure the ASSURANCE_CLIENT_SECRET environment variable is set.`
    )
  );
}

if (!ASSURANCE_PRIVATE_KEY_FILE && !ASSURANCE_PRIVATE_KEY_CONTENTS) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.redBright(
      `Failed to read private key. Please ensure the ASSURANCE_PRIVATE_KEY_FILE or ASSURANCE_PRIVATE_KEY_CONTENTS environment variable is set.`
    )
  );
}

const privateKey =
  ASSURANCE_PRIVATE_KEY_CONTENTS ||
  fs.readFileSync(ASSURANCE_PRIVATE_KEY_FILE, "utf8");

if (!privateKey) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.redBright(
      `Failed to read private key. Please ensure ASSURANCE_PRIVATE_KEY_FILE exists and is readable.`
    )
  );
}

export default () => ({
  clientId: ASSURANCE_CLIENT_ID,
  technicalAccountId: ASSURANCE_TECHNICAL_ACCOUNT_ID,
  orgId: ASSURANCE_ORG_ID,
  clientSecret: ASSURANCE_CLIENT_SECRET,
  privateKey,
  metaScopes: ["https://ims-na1.adobelogin.com/s/assurance_automation"],
  ims: IMS_URL
});
