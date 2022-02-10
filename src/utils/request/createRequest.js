/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { uuid } from "..";

// This provides the base functionality that all types of requests share.
export default options => {
  const { payload, getAction, getUseSendBeacon } = options;
  const id = uuid();
  let shouldUseThirdPartyDomain = false;
  let isIdentityEstablished = false;

  return {
    getId() {
      return id;
    },
    getPayload() {
      return payload;
    },
    getAction() {
      return getAction({ isIdentityEstablished });
    },
    getUseSendBeacon() {
      return getUseSendBeacon({ isIdentityEstablished });
    },
    getUseIdThirdPartyDomain() {
      return shouldUseThirdPartyDomain;
    },
    setUseIdThirdPartyDomain() {
      shouldUseThirdPartyDomain = true;
    },
    setIsIdentityEstablished() {
      isIdentityEstablished = true;
    }
  };
};
