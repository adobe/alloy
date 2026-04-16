/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Item } from "@adobe/react-spectrum";

/**
 * Map a sandbox item to a JSX element to be used inside a Picker.
 *
 * I would create a SandboxItem component, but react-spectrum doesn't let you
 * wrap Items. See https://github.com/adobe/react-spectrum/issues/2746.
 * Instead, this is a function you can use as the inside of a Picker.
 * @param {Object} item A sandbox item
 * @param {string} item.name
 * @param {string} item.title
 * @param {string?} item.region
 * @param {string} item.type
 * @returns {JSX.Element}
 */
const sandboxItems = (item) => {
  const region = item.region ? ` (${item.region.toUpperCase()})` : "";
  const label = `${item.type.toUpperCase()} ${item.title}${region}`;

  return <Item key={item.name}>{label}</Item>;
};

export default sandboxItems;
