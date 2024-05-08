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
import {
  arrayOf,
  callback as callbackType,
  objectOf,
  string
} from "../../utils/validation";
import createSubscription from "../../utils/createSubscription.js";
import { includes } from "../../utils/index.js";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    surfaces: arrayOf(string()).uniqueItems(),
    schemas: arrayOf(string()).uniqueItems(),
    callback: callbackType().required()
  }).noUnknownFields();

  return validator(options);
};

const emissionPreprocessor = (params, propositions) => {
  const { surfacesFilter, schemasFilter } = params;

  const result = {
    propositions: propositions
      .filter(payload =>
        surfacesFilter ? includes(surfacesFilter, payload.scope) : true
      )
      .map(payload => {
        const { items = [] } = payload;
        return {
          ...payload,
          items: items.filter(item =>
            schemasFilter ? includes(schemasFilter, item.schema) : true
          )
        };
      })
      .filter(payload => payload.items.length > 0)
  };

  return [result];
};

const emissionCondition = (params, result) => {
  return result.propositions.length > 0;
};

export default () => {
  const subscription = createSubscription();
  subscription.setEmissionPreprocessor(emissionPreprocessor);
  subscription.setEmissionCondition(emissionCondition);

  const run = ({ surfaces, schemas, callback }) => {
    const unsubscribe = subscription.add(callback, {
      surfacesFilter: surfaces instanceof Array ? surfaces : undefined,
      schemasFilter: schemas instanceof Array ? schemas : undefined
    });

    return Promise.resolve({ unsubscribe });
  };

  const optionsValidator = options => validateOptions({ options });

  const refresh = propositions => {
    if (!subscription.hasSubscriptions()) {
      return;
    }

    subscription.emit(propositions);
  };

  return {
    refresh,
    command: {
      optionsValidator,
      run
    }
  };
};
