/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { Tree } from "antd";
import { useFormikContext } from "formik";
import generateTreeStructure from "./helpers/generateTreeStructure";
import getNodeIdsToExpandForValidation from "./helpers/getNodeIdsToExpandForValidation";
import XdmTreeNodeTitle from "./xdmTreeNodeTitle";
import useNewlyValidatedFormSubmission from "../../utils/useNewlyValidatedFormSubmission";
// Importing Ant's tree styles in other ways can bring in global styles
// that affect all elements which, at the time this is written, negatively affects things
// like positioning of error icons within react-spectrum textfields when the field
// is marked invalid. Check https://github.com/ant-design/ant-design/issues/9363
// before attempting to change this import.
// By default, Ant's Tree animates while expanding or collapsing a node. This animation
// requires additional CSS that would bring some of these global styles in.
// To avoid the issue (and speed up the Tree experience), we disable animation
// by setting Tree's motion prop to null. This isn't currently a documented prop:
// https://github.com/ant-design/ant-design/blob/832aa81c821b7b5750673b5aacafa39c9978b09c/components/tree/Tree.tsx#L200-L203
import "antd/lib/tree/style/index";
import "./xdmTree.css";

export const scrollNodeIntoView = (nodeId) => {
  if (nodeId) {
    setTimeout(() => {
      const elementToScrollIntoView = document.querySelector(
        `.XdmTree [data-node-id="${nodeId}"]`,
      );

      if (elementToScrollIntoView) {
        elementToScrollIntoView.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  }
};

/**
 * Displays the XDM object as a tree.
 */
const XdmTree = ({
  selectedNodeId,
  expandedNodeIds,
  setExpandedNodeIds,
  onSelect = () => {},
  showDisplayNames = false,
}) => {
  const { values: formState, errors, touched } = useFormikContext();

  const treeStructure = generateTreeStructure({
    treeNodeComponent: XdmTreeNodeTitle,
    formState,
    errors,
    touched,
    showDisplayNames,
  });

  // Expand invalid items when the user attempts to submit the form by hitting
  // the save button in Launch. We purposefully don't expand invalid items when
  // validation occurs as a result of a user changing the value of a field because
  // it's a jarring experience.
  useNewlyValidatedFormSubmission(() => {
    const nodeIdsContainingError =
      getNodeIdsToExpandForValidation(treeStructure);

    if (nodeIdsContainingError.length) {
      setExpandedNodeIds(nodeIdsContainingError);
    }
  });

  const onTreeSelect = (newSelectedNodeIds) => {
    onSelect(newSelectedNodeIds[0]);
  };

  const onTreeExpand = (newExpandedNodeIds) => {
    setExpandedNodeIds(newExpandedNodeIds);
  };

  return (
    <Tree
      data-test-id="xdmTree"
      className="XdmTree"
      treeData={treeStructure.children}
      onSelect={onTreeSelect}
      onExpand={onTreeExpand}
      selectedKeys={selectedNodeId ? [selectedNodeId] : []}
      expandedKeys={expandedNodeIds}
      showLine
      motion={null}
    />
  );
};

XdmTree.propTypes = {
  selectedNodeId: PropTypes.string,
  expandedNodeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setExpandedNodeIds: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  showDisplayNames: PropTypes.bool,
};

export default XdmTree;
