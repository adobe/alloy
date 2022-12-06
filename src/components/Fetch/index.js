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

import { defer } from "../../utils";
import validateFetchOptions from "./validateFetchOptions";

const createFetch = ({ eventManager }) => {
  let fetchCallsDone = Promise.resolve();
  return {
    commands: {
      fetch: {
        optionsValidator: validateFetchOptions,
        run: options => {
          const {
            xdm,
            data,
            renderDecisions = false,
            personalization = [],
            edgeConfigOverrides
          } = options;

          const event = eventManager.createEvent();

          event.setUserXdm(xdm);
          event.setUserData(data);

          return eventManager.fetch(event, {
            renderDecisions,
            personalization,
            edgeConfigOverrides
          });
        }
      }
    },
    lifecycle: {
      onBeforeEvent() {
        return fetchCallsDone;
      },
      onBeforeFetch({ onComplete, onRequestFailure }) {
        const deferred = defer();
        fetchCallsDone = fetchCallsDone.then(() => {
          return deferred.promise;
        });
        onComplete(() => deferred.resolve());
        onRequestFailure(() => deferred.resolve());
      }
    }
  };
};

createFetch.namespace = "Fetch";
createFetch.configValidators = {};

export default createFetch;
