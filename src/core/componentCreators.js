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
// This is the only place where core is allowed to import from components.
// This makes sure that each component could be removed without breaking the library
/* eslint-disable import/no-restricted-paths */
// import // createDataCollector from "../components/DataCollector";
// // // import // createActivityCollector from "../components/ActivityCollector";
// import // createIdentity from "../components/Identity";
import createAudiences from "../components/Audiences";
// // // import // createPersonalization from "../components/Personalization";
import createContext from "../components/Context";
// // // import // createPrivacy from "../components/Privacy";
// import // createEventMerge from "../components/EventMerge";
// // // import // createLibraryInfo from "../components/LibraryInfo";
// // // import // createMachineLearning from "../components/MachineLearning";

// TODO: Register the Components here statically for now. They might be registered differently.
// TODO: Figure out how sub-components will be made available/registered
export default [
  // createDataCollector,
  // createActivityCollector,
  // createIdentity,
  createAudiences,
  // createPersonalization,
  createContext
  // createPrivacy,
  // createEventMerge,
  // createLibraryInfo,
  // createMachineLearning
];
