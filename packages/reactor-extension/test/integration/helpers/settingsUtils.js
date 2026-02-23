/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const buildSettings = (o = {}) => {
  const defaultInstances = [
    {
      name: "alloy",
      edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
      sandbox: "prod",
    },
  ];

  const incomingInstances = o.instances || [];

  const instancesMap = new Map();

  defaultInstances.forEach((instance) => {
    instancesMap.set(instance.name, { ...instance });
  });

  incomingInstances.forEach((instance) => {
    if (instancesMap.has(instance.name)) {
      instancesMap.set(instance.name, {
        ...instancesMap.get(instance.name),
        ...instance,
      });
    } else {
      instancesMap.set(instance.name, { ...instance });
    }
  });

  return {
    settings: {
      components: {
        eventMerge: false,
        ...(o.components || {}),
      },
      instances: Array.from(instancesMap.values()),
    },
  };
};
