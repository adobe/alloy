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

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import XdmTree, { scrollNodeIntoView } from "./xdmTree";
import NodeEdit from "./nodeEdit";
import NoSelectedNodeView from "./noSelectedNodeView";
import getNodeEditData from "./helpers/getNodeEditData";
import { ARRAY, OBJECT } from "./constants/schemaType";

// The style() macro must be statically evaluable, so the verticalLayout
// boolean can't be interpolated directly; precompute one variant per value
// (see forms/fields/widthStyle.js for the same pattern).
const CONTAINER_STYLES = {
  true: style({
    display: "flex",
    flexDirection: "column",
    marginTop: 8,
    minHeight: 0,
    gap: 32,
  }),
  false: style({
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
    minHeight: 0,
    gap: 32,
  }),
};

// Tree pane: minimum 300px wide, but can grow if there's extra room (long
// node names, several expanded nodes). Edit pane: takes the rest of the
// row and shrinks first, so the tree's 300px minimum always wins.
const TREE_PANE_STYLES = {
  true: style({}),
  false: style({ flexGrow: 1, flexShrink: 0, flexBasis: 300 }),
};

const EDIT_PANE_STYLES = {
  true: style({ alignSelf: "start", position: "sticky", top: 0 }),
  false: style({
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "full",
    alignSelf: "start",
    position: "sticky",
    top: 0,
  }),
};

const fetchNodeIdsForDepth = (formStateNode, depth) => {
  if (depth === 0) {
    return [];
  }
  const {
    schema: { type },
    properties,
    items,
    id,
  } = formStateNode;
  if (type === OBJECT && properties) {
    return Object.keys(properties).reduce(
      (nodeIds, key) => {
        return nodeIds.concat(fetchNodeIdsForDepth(properties[key], depth - 1));
      },
      [id],
    );
  }
  if (type === ARRAY && items) {
    return items.reduce(
      (nodeIds, item) => {
        return nodeIds.concat(fetchNodeIdsForDepth(item, depth - 1));
      },
      [id],
    );
  }
  return [];
};

const Editor = ({
  selectedNodeId,
  setSelectedNodeId,
  schema,
  previouslySavedSchemaInfo,
  initialExpandedDepth = 0,
  componentName,
  verticalLayout = false,
  showDisplayNames = false,
}) => {
  const { values: formState } = useFormikContext();
  const [expandedNodeIdsInTree, setExpandedNodeIdsInTree] = useState(() => {
    // There is a root node with the id node-1. We don't want that.
    return fetchNodeIdsForDepth(formState, initialExpandedDepth + 1).slice(1);
  });
  const [nodeIdToScrollIntoViewInTree, setNodeIdToScrollIntoViewInTree] =
    useState();

  const expandNodeAndAncestorsInTree = (nodeId) => {
    if (!nodeId) {
      return;
    }
    const {
      breadcrumb,
      formStateNode: {
        schema: { type },
      },
    } = getNodeEditData({
      formState,
      nodeId,
    });
    if (type !== OBJECT && type !== ARRAY) {
      // don't add the nodeId of the last item in the breadcrumbs if it is a leaf node
      breadcrumb.pop();
    }
    const newExpandedNodeIds = breadcrumb.reduce((memo, breadcrumbItem) => {
      const { nodeId: breadcrumbItemNodeId } = breadcrumbItem;
      if (!memo.includes(breadcrumbItemNodeId)) {
        memo.push(breadcrumbItemNodeId);
      }
      return memo;
    }, expandedNodeIdsInTree.slice());
    setExpandedNodeIdsInTree(newExpandedNodeIds);
  };

  useEffect(() => {
    if (nodeIdToScrollIntoViewInTree) {
      scrollNodeIntoView(nodeIdToScrollIntoViewInTree);
      setNodeIdToScrollIntoViewInTree(undefined);
    }
  }, [nodeIdToScrollIntoViewInTree]);

  return (
    <div data-test-id="editor" className={CONTAINER_STYLES[verticalLayout]}>
      {
        // Minimum of 300px wide, but can expand. This is for when the user
        // has nodes with really long text or they expand several nodes, making
        // the tree very wide. Another option is to limit the width, but show a
        // horizontal scrollbar. Be aware that limiting the width has an interesting
        // side effect in Safari, because Safari doesn't allow you to scroll the page by
        // scrolling the scroll wheel or swiping when the cursor is over an element
        // that has a scrollbar (vertical or horizontal).
      }
      <div className={TREE_PANE_STYLES[verticalLayout]}>
        <XdmTree
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIdsInTree}
          setExpandedNodeIds={setExpandedNodeIdsInTree}
          onSelect={(nodeId) => {
            setSelectedNodeId(nodeId);
            expandNodeAndAncestorsInTree(nodeId);
          }}
          showDisplayNames={showDisplayNames}
        />
      </div>
      {
        // We want the first column to be at least 300px wide, but it can
        // grow the tree gets bigger. Then the second column will take the
        // rest of the space.
      }
      <div className={EDIT_PANE_STYLES[verticalLayout]}>
        {selectedNodeId ? (
          <NodeEdit
            onNodeSelect={(nodeId) => {
              setSelectedNodeId(nodeId);
              expandNodeAndAncestorsInTree(nodeId);
              setNodeIdToScrollIntoViewInTree(nodeId);
            }}
            selectedNodeId={selectedNodeId}
            verticalLayout={verticalLayout}
          />
        ) : (
          <NoSelectedNodeView
            schema={schema}
            previouslySavedSchemaInfo={previouslySavedSchemaInfo}
            componentName={componentName}
            verticalLayout={verticalLayout}
            updateMode={formState.updateMode}
          />
        )}
      </div>
    </div>
  );
};

Editor.propTypes = {
  selectedNodeId: PropTypes.string,
  setSelectedNodeId: PropTypes.func.isRequired,
  schema: PropTypes.object,
  previouslySavedSchemaInfo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
  }),
  initialExpandedDepth: PropTypes.number,
  componentName: PropTypes.string.isRequired,
  verticalLayout: PropTypes.bool,
  showDisplayNames: PropTypes.bool,
};

export default Editor;
