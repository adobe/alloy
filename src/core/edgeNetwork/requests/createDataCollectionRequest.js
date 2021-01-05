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

import createRequest from "./createRequest";

export default dataCollectionRequestPayload => {
  const getUseSendBeacon = ({ isIdentityEstablished }) => {
    // When the document may be unloading, we still hit the interact endpoint
    // using fetch if an identity has not been established. If we were instead
    // to hit the collect endpoint using sendBeacon in this case, one of three
    // things would occur:
    //
    // 1. The document ultimately isn't unloaded and Alloy receives an empty
    // response back from the collect endpoint, resulting in an error being
    // thrown by Alloy because we weren't able to establish an identity.
    // This is bad.
    // 2. The document is unloaded, but Alloy receives the empty
    // response back from the collect endpoint before navigation is completed,
    // resulting in an error being thrown by Alloy because we weren't able to
    // establish an identity. This is bad.
    // 3. The document is unloaded and Alloy does not receive the empty response
    // back from the collect endpoint before navigation is completed. No error
    // will be thrown, but no identity was established either. This is okay,
    // though no identity was established.
    //
    // By hitting the interact endpoint using fetch, one of the three things
    // would occur:
    //
    // 1. The document ultimately isn't unloaded and Alloy receives a
    // response with an identity back from the interact endpoint. No
    // error will be thrown and an identity is established. This is good.
    // 2. The document is unloaded and Alloy receives a response with an
    // identity back from the interact endpoint before navigation is completed.
    // No error will be thrown and an identity is established. This is good.
    // 3. The document is unloaded and Alloy does not receive the empty response
    // back from the collect endpoint before navigation is completed. In this
    // case, no error is thrown, but no identity was established and it's
    // more likely that the request never makes it to the server because we're
    // using fetch instead of sendBeacon.
    //
    // The second approach seemed preferable.
    return (
      dataCollectionRequestPayload.getDocumentMayUnload() &&
      isIdentityEstablished
    );
  };

  return createRequest({
    payload: dataCollectionRequestPayload,
    getAction({ isIdentityEstablished }) {
      return getUseSendBeacon({ isIdentityEstablished })
        ? "collect"
        : "interact";
    },
    getUseSendBeacon
  });
};
