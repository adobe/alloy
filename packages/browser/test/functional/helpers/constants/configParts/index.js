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
import configOverridesMain from "./configOverridesMain.js";
import configOverridesAlt from "./configOverridesAlt.js";
import orgMainConfigMain from "./orgMainConfigMain.js";
import orgAltConfigAlt from "./orgAltConfigAlt.js";
import debugEnabled from "./debugEnabled.js";
import debugDisabled from "./debugDisabled.js";
import edgeDomainFirstParty from "./edgeDomainFirstParty.js";
import edgeDomainThirdParty from "./edgeDomainThirdParty.js";
import clickCollectionEnabled from "./clickCollectionEnabled.js";
import clickCollectionDisabled from "./clickCollectionDisabled.js";
import clickCollectionSessionStorageDisabled from "./clickCollectionSessionStorageDisabled.js";
import clickCollectionEventGroupingDisabled from "./clickCollectionEventGroupingDisabled.js";
import migrationEnabled from "./migrationEnabled.js";
import targetMigrationEnabled from "./targetMigrationEnabled.js";
import migrationDisabled from "./migrationDisabled.js";
import consentIn from "./consentIn.js";
import consentPending from "./consentPending.js";
import thirdPartyCookiesEnabled from "./thirdPartyCookiesEnabled.js";
import thirdPartyCookiesDisabled from "./thirdPartyCookiesDisabled.js";
import ajoConfigForStage from "./ajoConfigForStage.js";

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
  clickCollectionSessionStorageDisabled,
  clickCollectionEventGroupingDisabled,
  migrationEnabled,
  migrationDisabled,
  consentIn,
  consentPending,
  thirdPartyCookiesEnabled,
  thirdPartyCookiesDisabled,
  targetMigrationEnabled,
  ajoConfigForStage,
};
