/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Children, isValidElement } from "react";
import { Text } from "@react-spectrum/s2";

const toS2Item = (ItemComponent, element) => {
  if (!isValidElement(element)) {
    return element;
  }
  const { children, ...props } = element.props;
  const id = props.id ?? element.key;

  // A v3 item's secondary `<Text slot="description">` isn't recognized by
  // S2's slot context, so instead of being routed to aria-describedby it
  // renders as plain text and gets folded into the option's accessible
  // name. S2 also requires the primary label to be explicitly
  // `slot="label"` when a description is present (v3 left it unslotted).
  // Re-wrap both as S2's own Text with the right slot so routing works.
  const childArray = Children.toArray(children);
  const hasDescriptionSlot = childArray.some(
    (child) => isValidElement(child) && child.props.slot === "description",
  );

  if (!hasDescriptionSlot) {
    // The common case: plain text (or a single non-slotted element)
    // children. S2 needs that exact shape (not an array) to infer an
    // accessible name/textValue, so leave it untouched.
    return (
      <ItemComponent key={id} id={id} {...props}>
        {children}
      </ItemComponent>
    );
  }

  const normalizedChildren = childArray.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }
    if ("slot" in child.props) {
      return <Text key={child.key} {...child.props} />;
    }
    if (typeof child.props.children === "string") {
      return <Text key={child.key} {...child.props} slot="label" />;
    }
    return child;
  });

  return (
    <ItemComponent key={id} id={id} {...props}>
      {normalizedChildren}
    </ItemComponent>
  );
};

// Views that haven't been migrated yet still render `Item` (from
// @adobe/react-spectrum) as Picker/ComboBox children. S2 collection
// components require their own item type (PickerItem/ComboBoxItem/etc), so
// this re-wraps whatever element a not-yet-migrated caller renders, keeping
// those views working against the now-S2 field until their own PR flips them.
const normalizeCollectionChildren = (ItemComponent, children) => {
  if (typeof children === "function") {
    return (item) => toS2Item(ItemComponent, children(item));
  }
  return Children.map(children, (child) => toS2Item(ItemComponent, child));
};

export default normalizeCollectionChildren;
