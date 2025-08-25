/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import crypto from "crypto";

// 2 random 63 bit numbers padded with zeros to 19 digits and concatenated
export default () => {
  const randomBytesBuffer = crypto.randomBytes(16);
  // eslint-disable-next-line no-bitwise
  randomBytesBuffer[0] &= 0x7f;
  // eslint-disable-next-line no-bitwise
  randomBytesBuffer[8] &= 0x7f;
  const high = randomBytesBuffer.readBigInt64BE(0).toString();
  const low = randomBytesBuffer.readBigInt64BE(8).toString();
  return high.padStart(19, "0") + low.padStart(19, "0");
};
