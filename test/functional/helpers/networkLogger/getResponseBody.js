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
import zlib from "zlib";

const getResponseBody = (request) => {
  const encoding = request.response.headers["content-encoding"];
  const bodyBuffer = request.response.body;
  let decompressedBody;
  switch (encoding) {
    // case "deflate":
    //   decompressedBody = zlib.inflateRawSync(bodyBuffer);
    //   break;
    // case "gzip":
    //   console.log("AAA", encoding, bodyBuffer.toString("ascii"));
    //   decompressedBody = zlib.gunzipSync(bodyBuffer, {
    //     wbits: zlib.MAX_WBITS | 16,
    //   });
    //   console.log("BBB");
    //   break;
    default:
      decompressedBody = bodyBuffer;
  }
  return decompressedBody.toString();
};

export default getResponseBody;
