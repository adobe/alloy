/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";

const responseStatus = async (networkLogs, status) => {
  for (let i = 0; i < networkLogs.length; i += 1) {
    const req = networkLogs[i];
    // TODO: Check why some requests don't have responses.
    // TODO: It looks like test cafe might not be handling gzip correctly.
    if (req.response) {
      // eslint-disable-next-line no-await-in-loop
      await t
        .expect(req.response.statusCode === status)
        .ok(`expected ${status} to be found in ${req.response.statusCode}`);
    }
  }
};

export default responseStatus;
