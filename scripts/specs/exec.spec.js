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
import { Writable } from "stream";
import exec from "../helpers/exec.js";
import ApplicationError from "../helpers/applicationError.js";

const createStringBackedWritableStream = () => {
  let result = "";
  class WritableStream extends Writable {
    // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
    _write(chunk, encoding, next) {
      result += chunk.toString();
      next();
    }
  }

  return [new WritableStream(), () => result];
};

describe("exec", () => {
  it("throws an ApplicationError on a non-zero exit code.", async () => {
    const [outputStream] = createStringBackedWritableStream();
    await expectAsync(
      exec("bad exit", "exit 42", { outputStream }),
    ).toBeRejectedWithError(ApplicationError);
  });
  it("logs the exit code", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    try {
      await exec("bad exit", "exit 42", { outputStream });
      fail();
    } catch (e) {
      const result = getResult();
      expect(result).toMatch(/exited with code 42/);
    }
  });
  it("logs the process name", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    try {
      await exec("bad exit", "exit 42", { outputStream });
      fail();
    } catch (e) {
      const result = getResult();
      expect(result).toMatch(/bad exit/);
    }
  });
  it("handles multi-line echo statements", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    const input = "Hello\nWorld\n";
    await exec("passthrough", `echo "${input}" | cat -`, { outputStream });
    const result = getResult();
    expect(result).toMatch(/Hello/);
    expect(result).toMatch(/World/);
  });
});
