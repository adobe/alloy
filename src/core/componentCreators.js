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

import createDataCollector from "../components/DataCollector/index";
import createActivityCollector from "../components/ActivityCollector/index";
import createIdentity from "../components/Identity/index";
import createAudiences from "../components/Audiences/index";
import createPersonalization from "../components/Personalization/index";
import createContext from "../components/Context/index";
import createPrivacy from "../components/Privacy/index";
import createEventMerge from "../components/EventMerge/index";
import createLibraryInfo from "../components/LibraryInfo/index";

// TODO: Register the Components here statically for now. They might be registered differently.
// TODO: Figure out how sub-components will be made available/registered
export default [
  createDataCollector,
  createActivityCollector,
  createIdentity,
  createAudiences,
  createPersonalization,
  createContext,
  createPrivacy,
  createEventMerge,
  createLibraryInfo
];
