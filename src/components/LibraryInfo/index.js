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

import libraryVersion from "../../constants/libraryVersion";
import { CONFIGURE, SET_DEBUG } from "../../constants/coreCommands";

const prepareLibraryInfo = ({ config, componentRegistry }) => {
  const allCommands = [
    ...componentRegistry.getCommandNames(),
    CONFIGURE,
    SET_DEBUG
  ].sort();
  const resultConfig = { ...config };
  Object.keys(config).forEach(key => {
    const value = config[key];
    if (typeof value !== "function") {
      return;
    }
    resultConfig[key] = value.toString();
  });
  return {
    version: libraryVersion,
    configs: resultConfig,
    commands: allCommands,
    components: componentRegistry.getComponentNames()
    // need to add the componentsCreators.js, build type - if its custom build, change the build type, the environment is set. Build type value
    //
  };
};
const createLibraryInfo = ({ config, componentRegistry }) => {
  const libraryInfo = prepareLibraryInfo({ config, componentRegistry });
  return {
    commands: {
      getLibraryInfo: {
        run: () => {
          return {
            libraryInfo
          };
        }
      }
    }
  };
};

createLibraryInfo.namespace = "LibraryInfo";
export default createLibraryInfo;
