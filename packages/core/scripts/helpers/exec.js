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
import { exec as execChildProcess } from "child_process";
import ApplicationError from "./applicationError.js";

const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23", // Explicitly use 24-hour cycle
});
const formatTimestamp = (date = new Date()) => {
  return timestampFormatter.format(date);
};

/**
 * Executes a function in a child process, with log prefixing.
 * @param {string} name
 * @param {string} command
 * @param {{ outputStream?: import("stream").Writable }} [options={}]
 * @returns {Promise<void>}
 */
const exec = async (name, command, options = {}) => {
  /** @type {import("child_process").ChildProcess | null} */
  const process = execChildProcess(command);
  const outputStream = options.outputStream ?? process.stdout;
  process.stdout.on("data", (data) => {
    outputStream.write(`[${formatTimestamp()} ${name}] ${data}`);
  });
  process.stderr.on("data", (data) => {
    outputStream.write(`[${formatTimestamp()} ${name}] ${data}`);
  });
  return new Promise((resolve, reject) => {
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      }
      outputStream.write(
        `[${formatTimestamp()} ${name}] exited with code ${code}.`,
      );
      reject(
        new ApplicationError(
          "Previous command exited with non-zero exit code.",
        ),
      );
    });
  });
};

export default exec;
