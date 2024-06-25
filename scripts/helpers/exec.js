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
import { createRequire } from "module";
import ApplicationError from "./applicationError.js";

const require = createRequire(import.meta.url);

// Use concurrently for its great log handling and prefix capabilities
const concurrently = require("concurrently");

// even though I'm only ever running one thing at a time.

const exec = async (name, command, options = {}) => {
  try {
    const { result } = await concurrently(
      [
        {
          name,
          command,
        },
      ],
      {
        prefix: "[{time} {name}]",
        timestampFormat: "HH:mm:ss.SSS",
        ...options,
      },
    );
    await result;
  } catch (e) {
    if (!e.message) {
      // when a command fails, concurrently rejects with an array of objects.
      throw new ApplicationError(
        "Previous command exited with non-zero exit code.",
      );
    }
    throw e;
  }
};

export default exec;
