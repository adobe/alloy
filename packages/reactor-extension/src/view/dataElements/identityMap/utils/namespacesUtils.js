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

import fetchSandboxes from "../../../utils/fetchSandboxes";
import fetchNamespaces from "./fetchNamespaces";

const isNotECID = (namespace) => {
  return namespace.code !== "ECID";
};

const getNamespaces = async (initInfo, sandbox) => {
  const namespaces = await fetchNamespaces({
    orgId: initInfo.company.orgId,
    imsAccess: initInfo.tokens.imsAccess,
    sandbox,
  });

  return namespaces || [];
};

const getDefaultSandbox = (sandboxes) => {
  return sandboxes.find((sandbox) => sandbox.isDefault);
};

const getNamespacesForDefaultSandbox = (initInfo) => {
  return fetchSandboxes({
    orgId: initInfo.company.orgId,
    imsAccess: initInfo.tokens.imsAccess,
  })
    .then((result) => {
      return getDefaultSandbox(result.results);
    })
    .then((sandbox) => getNamespaces(initInfo, sandbox.name));
};

const dedupeBy = (arr, keyFunc) => {
  const set = new Set();

  return arr.filter((e) => {
    const key = keyFunc(e);

    if (set.has(key)) {
      return false;
    }

    set.add(key);

    return true;
  });
};
const getExtensionSandboxes = (initInfo) => {
  const extensionSandboxes = new Set();

  const sandbox = initInfo?.extensionSettings?.instances[0]?.sandbox;
  const stagingSandbox =
    initInfo?.extensionSettings?.instances[0]?.stagingSandbox;
  const developmentSandbox =
    initInfo?.extensionSettings?.instances[0]?.developmentSandbox;

  if (sandbox) {
    extensionSandboxes.add(sandbox);
  }
  if (stagingSandbox) {
    extensionSandboxes.add(stagingSandbox);
  }
  if (developmentSandbox) {
    extensionSandboxes.add(developmentSandbox);
  }

  return [...extensionSandboxes];
};

const filterAndSortNamespaces = (namespaces) => {
  return namespaces
    .filter(isNotECID)
    .sort((first, second) => first.code.localeCompare(second.code));
};

export const getNamespacesOptions = (initInfo) => {
  const extensionSandboxes = getExtensionSandboxes(initInfo);

  if (extensionSandboxes.length > 0) {
    return Promise.all(
      extensionSandboxes.map((sandbox) => getNamespaces(initInfo, sandbox)),
    )
      .then((results) => {
        const allNamespaces = results.flatMap((arr) => arr);

        return dedupeBy(allNamespaces, (e) => e.code);
      })
      .then((namespaces) => {
        return filterAndSortNamespaces(namespaces);
      })
      .catch(() => []);
  }

  return getNamespacesForDefaultSandbox(initInfo, extensionSandboxes)
    .then((namespaces) => {
      return filterAndSortNamespaces(namespaces);
    })
    .catch(() => []);
};

export const findNamespace = (namespaces, namespaceCode) => {
  return namespaces.find(
    (namespace) => namespace.code.toUpperCase() === namespaceCode.toUpperCase(),
  );
};
