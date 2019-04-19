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
  const handleResponse = ({ body, promise }) => {
    return new Promise(resolve => resolve(createResponse(JSON.parse(body))))
      .then(response => lifecycle.onResponse(response))
      .catch(e => logger.warn(e))
      .finally(() => {
        if (promise) {
          promise.then(handleResponse);
        }
      });
  };

  const { collectionUrl, propertyID } = config;
  return {
    /**
     *
     * @param {boolean} beacon - true to send a beacon (defaults to false).  If you send
     *   a beacon, no data will be returned.
     *
     * @returns {
     *   send: call this function when you are ready to send the payload
     *   payload: payload object that will be sent
     *   complete: promise that will resolve after data from the server is all processed
     *   response: promise that resolves with the returned raw body as { body }
     *   beacon: boolean with whether or not it was called with beacon = true
     * }
     *
     * Once send is called, the lifecycle method "onBeforeSend" will be triggered with
     * { payload, response, beacon } as the parameter.
     *
     * When the response is returned it will call the lifecycle method "onResponse"
     * with the returned response object
     */
    newRequest(beacon = false) {
      const payload = createPayload({ beacon });
      const action = beacon ? "collect" : "interact";
      const url = `${collectionUrl}/${action}?propertyID=${propertyID}`;
      const deferred = defer();
      const response = deferred.promise
        .then(() => lifecycle.onBeforeSend({ payload, response, beacon }))
        .then(() => networkStrategy(url, JSON.stringify(payload), beacon));

      const complete = beacon ? response : response.then(handleResponse);
      return { payload, complete, response, send: deferred.resolve, beacon };
    }
  };
};
