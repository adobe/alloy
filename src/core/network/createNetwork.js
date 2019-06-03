/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createPayload from "./createPayload";
import createResponse from "./createResponse";
import defer from "../../utils/defer";

export default (config, logger, lifecycle, networkStrategy) => {
  const handleResponse = body => {
    return new Promise(resolve => resolve(createResponse(JSON.parse(body))))
      .then(response => lifecycle.onResponse(response))
      .catch(e => logger.warn(e));
  };

  const { collectionDomain, propertyID } = config;
  return {
    /**
     * The object returned from network.newRequest
     * @typedef {Object} Request
     * @property {function} send - call this function when you are ready to send the payload
     * @property {Object} payload - payload object that will be sent
     * @property {Promise} responsePromise - promise that will yield the raw response body
     * @property {boolean} isBeacon - whether or not this request is a beacon request
     */
    /**
     * Create a new request.  Once "send" on the returned object is called, the lifecycle
     *  method "onBeforeSend" will be triggered with { payload, responsePromise, isBeacon } as
     *  the parameter.  When the response is returned it will call the lifecycle method "onResponse"
     *  with the returned response object.
     * @param {boolean} isBeacon - true to send a beacon (defaults to false).  If you send
     *   a beacon, no data will be returned.
     *
     * @returns {Request}
     */
    newRequest(isBeacon = false) {
      const payload = createPayload();
      const action = isBeacon ? "collect" : "interact";
      const url = `https://${collectionDomain}/${action}?propertyID=${propertyID}`;
      const deferred = defer();
      const responsePromise = deferred.promise
        .then(() =>
          lifecycle.onBeforeSend({ payload, responsePromise, isBeacon })
        )
        .then(() => networkStrategy(url, JSON.stringify(payload), isBeacon));

      if (!isBeacon) {
        responsePromise.then(handleResponse);
      }
      return { payload, responsePromise, send: deferred.resolve, isBeacon };
    }
  };
};
