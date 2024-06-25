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
import ApplicationError from "../helpers/applicationError.js";
import uploadToCDN from "../helpers/uploadToCDN.js";

describe("uploadToCDN", () => {
  let exec;
  let logger;
  let urlExists;
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    exec.and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["info"]);
    urlExists = jasmine.createSpy("urlExists");
    container = { exec, logger, urlExists, version };
  });

  it("uploads to CDN", async () => {
    urlExists.and.returnValue(Promise.resolve(true));
    await uploadToCDN(container);
    expect(logger.info).toHaveBeenCalledWith("Building files for CDN");
    expect(exec).toHaveBeenCalledWith("build", "npm run build");
    expect(logger.info).toHaveBeenCalledWith("Uploading files to CDN.");
    expect(exec).toHaveBeenCalledWith(
      "sftp",
      'echo "-mkdir 1.2.3\ncd 1.2.3\nput ./dist/alloy.js\nput ./dist/alloy.min.js\nbye\n" | sftp -oHostKeyAlgorithms=+ssh-dss -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy',
    );
    expect(urlExists).toHaveBeenCalledWith(
      "https://cdn1.adoberesources.net/alloy/1.2.3/alloy.js",
    );
    expect(urlExists).toHaveBeenCalledWith(
      "https://cdn1.adoberesources.net/alloy/1.2.3/alloy.min.js",
    );
  });
  it("fails to upload min file to CDN", async () => {
    urlExists.and.returnValues([Promise.resolve(false), Promise.resolve(true)]);
    await expectAsync(uploadToCDN(container)).toBeRejectedWithError(
      ApplicationError,
    );
  });
  it("fails to upload regular file to CDN", async () => {
    urlExists.and.returnValues([Promise.resolve(true), Promise.resolve(false)]);
    await expectAsync(uploadToCDN(container)).toBeRejectedWithError(
      ApplicationError,
    );
  });
});
