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

const zlib = require("zlib");

const getResponseBody = (request) => {
  const encoding = request.response.headers["content-encoding"];
  const bodyBuffer = request.response.body;
  let decompressedBody = bodyBuffer;

  // Chrome responses are getting here already decompressed.
  // For Firefox, we need to decompress the body.
  try {
    // eslint-disable-next-line default-case
    switch (encoding) {
      case "deflate":
        decompressedBody = zlib.inflateRawSync(bodyBuffer);
        break;
      case "gzip":
        decompressedBody = zlib.gunzipSync(bodyBuffer);
        break;
    }
    // eslint-disable-next-line no-empty
  } catch {}

  return decompressedBody.toString();
};

export default getResponseBody;
