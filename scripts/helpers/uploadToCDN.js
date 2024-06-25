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
import ApplicationError from "./applicationError.js";

const uploadToCDN = async ({ exec, logger, urlExists, version }) => {
  const ensureUrlResolves = async (url) => {
    if (!(await urlExists(url))) {
      throw new ApplicationError(`File not found on CDN: ${url}`);
    }
  };

  // We don't do a check here because there is no harm in re-building and re-uploading the files.

  logger.info("Building files for CDN");
  await exec("build", "npm run build");

  const ftpCommands = `-mkdir ${version}
cd ${version}
put ./dist/alloy.js
put ./dist/alloy.min.js
bye
`;
  logger.info("Uploading files to CDN.");
  await exec(
    "sftp",
    `echo "${ftpCommands}" | sftp -oHostKeyAlgorithms=+ssh-dss -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy`,
  );

  await ensureUrlResolves(
    `https://cdn1.adoberesources.net/alloy/${version}/alloy.js`,
  );
  await ensureUrlResolves(
    `https://cdn1.adoberesources.net/alloy/${version}/alloy.min.js`,
  );
};

export default uploadToCDN;
