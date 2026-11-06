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
import { all, required, rule, shape } from "../forms/validation";
import ExtensionView from "../components/extensionView";
import getDefaultIdentity from "./identityMap/utils/getDefaultIdentity";
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

// Namespaces are compared case-insensitively; only the first repeat is flagged.
const findDuplicateNamespaceIndex = (identities) => {
  const codes = identities.map(({ namespaceCode }) =>
    namespaceCode ? namespaceCode.toUpperCase() : namespaceCode,
  );
  return codes.findIndex((code, index) => codes.indexOf(code) < index);
};

const findSecondPrimary = (identities) => {
  const primaries = identities.flatMap(({ identifiers = [] }, identityIndex) =>
    identifiers
      .map((identifier, identifierIndex) => [identifier, identifierIndex])
      .filter(([identifier]) => identifier.primary)
      .map(([, identifierIndex]) => [identityIndex, identifierIndex]),
  );
  return primaries[1];
};

const validationSchema = shape({
  identities: shape({
    namespaceCode: all(
      required("Please select a namespace."),
      rule(
        (value) => !value || value.toUpperCase() !== "ECID",
        "ECID is not allowed",
      ),
      rule(
        (value, ctx) =>
          findDuplicateNamespaceIndex(ctx.root.identities) !== ctx.path[1],
        "Please provide a unique namespace.",
      ),
    ),
    identifiers: shape({
      id: required("Please specify an ID."),
      primary: rule((value, ctx) => {
        const secondPrimary = findSecondPrimary(ctx.root.identities);
        return (
          !secondPrimary ||
          secondPrimary[0] !== ctx.path[1] ||
          secondPrimary[1] !== ctx.path[3]
        );
      }, "Only one identifier can be primary."),
    }).array(),
  }).array(),
});

const IdentityMapExtensionView = () => {
  const context = useRef();
  return (
    <ExtensionView
      getInitialValues={({ initInfo }) =>
        getInitialValues({ initInfo, context })
      }
      getSettings={getSettings}
      validationSchema={validationSchema}
      render={() => {
        return <Identity context={context} />;
      }}
    />
  );
};

export default IdentityMapExtensionView;
