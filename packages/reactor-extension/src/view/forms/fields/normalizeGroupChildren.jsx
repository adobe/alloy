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

import { Children, cloneElement, isValidElement } from "react";

// Views that haven't been migrated yet still render a legacy Radio/Checkbox
// element as RadioGroup/CheckboxGroup children. Those read their selection
// state from a React context that an S2 group no longer provides, so they
// crash. A Radio/Checkbox leaf is always the element carrying `value`;
// everything else (Fragments, description wrappers, etc.) is walked so a
// leaf nested a level deep is still found.
const reinterpretLeaf = (LeafComponent, node) => {
  if (!isValidElement(node)) {
    return node;
  }
  if (Object.hasOwn(node.props, "value")) {
    return <LeafComponent key={node.key} {...node.props} />;
  }
  if (node.props.children !== undefined) {
    return cloneElement(
      node,
      {},
      reinterpretChildren(LeafComponent, node.props.children),
    );
  }
  return node;
};

// Children.map always returns an array, even given a single child. Callers
// like FieldDescriptionAndError use Children.only on their children, which
// rejects an array - so a single child must stay single after reinterpreting.
const reinterpretChildren = (LeafComponent, children) => {
  if (Array.isArray(children)) {
    return Children.map(children, (child) =>
      reinterpretLeaf(LeafComponent, child),
    );
  }
  return reinterpretLeaf(LeafComponent, children);
};

export default reinterpretChildren;
