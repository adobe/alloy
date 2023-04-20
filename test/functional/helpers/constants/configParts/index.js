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
import configOverridesMain from "./configOverridesMain";
import configOverridesAlt from "./configOverridesAlt";
import orgMainConfigMain from "./orgMainConfigMain";
import orgAltConfigAlt from "./orgAltConfigAlt";
import debugEnabled from "./debugEnabled";
import debugDisabled from "./debugDisabled";
import edgeDomainFirstParty from "./edgeDomainFirstParty";
import edgeDomainThirdParty from "./edgeDomainThirdParty";
import clickCollectionEnabled from "./clickCollectionEnabled";
import clickCollectionDisabled from "./clickCollectionDisabled";
import migrationEnabled from "./migrationEnabled";
import targetMigrationEnabled from "./targetMigrationEnabled";
import migrationDisabled from "./migrationDisabled";
import consentIn from "./consentIn";
import consentPending from "./consentPending";
import thirdPartyCookiesEnabled from "./thirdPartyCookiesEnabled";
import thirdPartyCookiesDisabled from "./thirdPartyCookiesDisabled";

const compose = (...objects) => Object.assign({}, ...objects);

export {
  compose,
  configOverridesMain,
  configOverridesAlt,
  orgMainConfigMain,
  orgAltConfigAlt,
  debugEnabled,
  debugDisabled,
  edgeDomainFirstParty,
  edgeDomainThirdParty,
  clickCollectionEnabled,
  clickCollectionDisabled,
  migrationEnabled,
  migrationDisabled,
  consentIn,
  consentPending,
  thirdPartyCookiesEnabled,
  thirdPartyCookiesDisabled,
  targetMigrationEnabled
};
