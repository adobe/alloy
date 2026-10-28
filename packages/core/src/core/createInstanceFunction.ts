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

import type { ExecuteCommand } from "./injectExecuteCommand.js";

/** A queued `alloy(...)` call: the promise callbacks and the call arguments. */
export type InstanceCall = [
  resolve: (result: Record<string, unknown>) => void,
  reject: (error: unknown) => void,
  args: [commandName: string, options?: unknown],
];

export default (executeCommand: ExecuteCommand) => {
  return ([resolve, reject, [commandName, options]]: InstanceCall) => {
    executeCommand(commandName, options).then(resolve, reject);
  };
};
