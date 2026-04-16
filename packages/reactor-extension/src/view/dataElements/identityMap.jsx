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

import { useRef } from "react";
import { array, boolean, object, string } from "yup";
import render from "../render";
import ExtensionView from "../components/extensionView";
import getDefaultIdentity from "./identityMap/utils/getDefaultIdentity";
import * as AUTHENTICATED_STATE from "./identityMap/constants/authenticatedState";
import Identity from "./identityMap/components/Identity";
import { getNamespacesOptions } from "./identityMap/utils/namespacesUtils";

const identitiesMapToArray = (identityMap) => {
  return Object.keys(identityMap)
    .sort((firstNamespaceCode, secondNamespaceCode) =>
      firstNamespaceCode.localeCompare(secondNamespaceCode),
    )
    .map((namespaceCode) => {
      return {
        namespaceCode,
        identifiers: identityMap[namespaceCode],
      };
    });
};

const identitiesArrayToMap = (identitiesArray) => {
  return identitiesArray.reduce((identityMap, identity) => {
    const { namespaceCode, identifiers } = identity;
    identityMap[namespaceCode] = identifiers;
    return identityMap;
  }, {});
};

const getInitialValues = async ({ initInfo, context }) => {
  const identities = initInfo.settings
    ? identitiesMapToArray(initInfo.settings)
    : [getDefaultIdentity()];

  context.current = {};
  context.current.namespaces = await getNamespacesOptions(initInfo);

  return {
    identities,
  };
};

const getSettings = ({ values }) => {
  return identitiesArrayToMap(values.identities);
};

const validateDuplicateValue = (
  createError,
  identities,
  key,
  message,
  validateBooleanTrue,
) => {
  const values = identities.map((identity) =>
    // If the user didn't enter a value for the property
    // we're checking duplicates for, then the property will have
    // an undefined value (not an empty string).
    identity[key] ? identity[key].toUpperCase() : identity[key],
  );
  const duplicateIndex = values.findIndex(
    (value, index) =>
      values.indexOf(value) < index && (!validateBooleanTrue || value === true),
  );

  return (
    duplicateIndex === -1 ||
    createError({
      path: `identities[${duplicateIndex}].${key}`,
      message,
    })
  );
};

const hasPrimary = (identifier) => identifier.primary;

const validateOnePrimary = (createError, identities, message) => {
  let primaries = 0;

  for (let i = 0; i < identities.length; i += 1) {
    const { identifiers = [] } = identities[i];

    for (let j = 0; j < identifiers.length; j += 1) {
      if (hasPrimary(identifiers[j])) {
        primaries += 1;
      }

      if (primaries > 1) {
        return createError({
          path: `identities[${i}].identifiers[${j}].primary`,
          message,
        });
      }
    }
  }
  return true;
};

const validationSchema = object()
  .shape({
    identities: array().of(
      object().shape({
        namespaceCode: string()
          .required("Please select a namespace.")
          .test({
            name: "notECID",
            message: "ECID is not allowed",
            test(value) {
              return !value || value.toUpperCase() !== "ECID";
            },
          }),
        identifiers: array().of(
          object().shape({
            id: string().required("Please specify an ID."),
            authenticatedState: string().default(AUTHENTICATED_STATE.AMBIGUOUS),
            primary: boolean().default(false),
          }),
        ),
      }),
    ),
  })
  .test("uniqueNamespace", function uniqueNamespace(settings) {
    return validateDuplicateValue(
      this.createError.bind(this),
      settings.identities,
      "namespaceCode",
      "Please provide a unique namespace.",
    );
  })
  .test("uniquePrimary", function uniquePrimary(settings) {
    return validateOnePrimary(
      this.createError.bind(this),
      settings.identities,
      "Only one identifier can be primary.",
    );
  });

const IdentityMapExtensionView = () => {
  const context = useRef();
  return (
    <ExtensionView
      getInitialValues={({ initInfo }) =>
        getInitialValues({ initInfo, context })
      }
      getSettings={getSettings}
      formikStateValidationSchema={validationSchema}
      render={() => {
        return <Identity context={context} />;
      }}
    />
  );
};

render(IdentityMapExtensionView);
