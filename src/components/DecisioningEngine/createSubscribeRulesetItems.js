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

const validateOptions = ({ options }) => {
  const validator = objectOf({
    surface: string().required(),
    schemas: arrayOf(string()).uniqueItems(),
    callback: callbackType().required()
  }).noUnknownFields();

  return validator(options);
};

export default () => {
  let subscriptionHandler;
  let surfaceIdentifier;
  let schemasFilter;

  const run = ({ surface, schemas, callback }) => {
    subscriptionHandler = callback;
    surfaceIdentifier = surface;
    schemasFilter = schemas instanceof Array ? schemas : undefined;
  };

  const optionsValidator = options => validateOptions({ options });

  const refresh = propositions => {
    if (!subscriptionHandler || !surfaceIdentifier) {
      return;
    }

    const result = propositions
      .filter(payload => payload.scope === surfaceIdentifier)
      .reduce((allItems, payload) => {
        const { items = [] } = payload;

        return [
          ...allItems,
          ...items.filter(item =>
            schemasFilter ? schemasFilter.includes(item.schema) : true
          )
        ];
      }, [])
      .sort((a, b) => b.data.qualifiedDate - a.data.qualifiedDate);

    if (result.length === 0) {
      return;
    }

    subscriptionHandler.call(null, { items: result });
  };

  return {
    refresh,
    command: {
      optionsValidator,
      run
    }
  };
};
