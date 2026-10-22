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

import defaultLibraryVersion from "../../constants/libraryVersion.js";
import { CONFIGURE, SET_DEBUG } from "../../constants/coreCommands.js";
import redactEdgeCredentials from "../../utils/redactEdgeCredentials.js";
import type {
  ComponentCreator,
  ComponentRegistry,
  Config,
} from "../../core/types.js";
import type { PlatformServices } from "../../services/types.js";

export interface LibraryInfo {
  version: string;
  configs: Record<string, unknown>;
  commands: string[];
  components: string[];
}

export interface LibraryInfoOptions {
  config: Config;
  componentRegistry: ComponentRegistry;
  /** Node's platform services add `libraryVersionOverride`. */
  platformServices?: PlatformServices & { libraryVersionOverride?: string };
}

const prepareLibraryInfo = ({
  config,
  componentRegistry,
  libraryVersion,
}: {
  config: Config;
  componentRegistry: ComponentRegistry;
  libraryVersion: string;
}): LibraryInfo => {
  const allCommands = [
    ...componentRegistry.getCommandNames(),
    CONFIGURE,
    SET_DEBUG,
  ].sort();
  const resultConfig: Record<string, unknown> = {
    ...redactEdgeCredentials(config),
  };
  Object.keys(config).forEach((key) => {
    const value = config[key];
    if (typeof value !== "function") {
      return;
    }
    resultConfig[key] = value.toString();
  });
  const components = componentRegistry.getComponentNames();
  return {
    version: libraryVersion,
    configs: resultConfig,
    commands: allCommands,
    components,
  };
};

const createLibraryInfo = ({
  config,
  componentRegistry,
  platformServices,
}: LibraryInfoOptions) => {
  // defaultLibraryVersion is a build-time placeholder the browser bundler
  // replaces; other runtimes (e.g. Node) override it via platformServices.
  const libraryVersion =
    platformServices?.libraryVersionOverride ?? defaultLibraryVersion;
  return {
    commands: {
      getLibraryInfo: {
        run: () => {
          return {
            libraryInfo: prepareLibraryInfo({
              config,
              componentRegistry,
              libraryVersion,
            }),
          };
        },
      },
    },
  };
};

createLibraryInfo.namespace = "LibraryInfo";
export default createLibraryInfo satisfies ComponentCreator<LibraryInfoOptions>;
