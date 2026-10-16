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
import { useFormikContext } from "formik";
import { Breadcrumb, Breadcrumbs, Checkbox } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import getNodeEditData from "./helpers/getNodeEditData";
import AutoPopulationAlert from "./autoPopulationAlert";
import { ALWAYS, NONE } from "./constants/autoPopulationSource";
import FormikCheckbox from "../../forms/fields/Checkbox";
import FieldDescriptionAndError from "../fieldDescriptionAndError";
import getTypeSpecificView from "./helpers/getTypeSpecificView";
import NodeDescription from "./nodeDescriptionPopover";

/**
 * The form for editing a node in the XDM object. The form fields
 * that are shown depend on the node's type.
 */
const NodeEdit = (props) => {
  const { values: formState } = useFormikContext();
  const { onNodeSelect, selectedNodeId, verticalLayout = false } = props;

  const {
    formStateNode,
    fieldName,
    breadcrumb,
    displayName,
    description,
    hasClearedAncestor,
  } = getNodeEditData({
    formState,
    nodeId: selectedNodeId,
  });

  const TypeSpecificNodeEdit = getTypeSpecificView(formStateNode.schema);

  const nodeDescription = (
    <NodeDescription
      title={displayName || fieldName}
      description={description}
    />
  );

  const typeSpecificNodeEditProps = {
    displayName: displayName || fieldName,
    fieldName,
    nodeDescription,
    onNodeSelect,
    verticalLayout,
  };

  if (formStateNode.schema["meta:enum"]) {
    typeSpecificNodeEditProps.possibleValues = Object.entries(
      formStateNode.schema["meta:enum"] || {},
    ).map(([key, value]) => ({ value: key, label: value }));
  }

  return (
    <div
      data-test-id="nodeEdit"
      className={style({
        display: "flex",
        gap: 16,
        marginBottom: 16,
        flexDirection: "column",
      })}
    >
      {!verticalLayout && (
        <div data-test-id="breadcrumb" className={style({ marginStart: -8 })}>
          {breadcrumb.length > 1 && (
            <nav aria-label="Breadcrumb">
              <Breadcrumbs onAction={(nodeId) => onNodeSelect(nodeId)}>
                {breadcrumb.map((item) => (
                  <Breadcrumb id={item.nodeId} key={item.nodeId}>
                    {item.label}
                  </Breadcrumb>
                ))}
              </Breadcrumbs>
            </nav>
          )}
        </div>
      )}
      {formStateNode.autoPopulationSource !== NONE && (
        <AutoPopulationAlert formStateNode={formStateNode} />
      )}
      {formStateNode.autoPopulationSource !== ALWAYS && (
        <>
          <TypeSpecificNodeEdit {...typeSpecificNodeEditProps} />
          {formStateNode.updateMode && hasClearedAncestor && (
            <FieldDescriptionAndError
              description="Checking this box will cause this field to be deleted before setting any values. A field further up in the object is already cleared. Fields that are cleared appear with a delete icon in the tree."
              messagePaddingTop="size-0"
              messagePaddingStart="size-300"
            >
              <Checkbox
                data-test-id="clearField"
                isSelected
                isDisabled
                styles={style({
                  width: 400,
                })}
              >
                Clear existing value
              </Checkbox>
            </FieldDescriptionAndError>
          )}
          {formStateNode.updateMode && !hasClearedAncestor && (
            <FormikCheckbox
              data-test-id="clearField"
              name={`${fieldName}.transform.clear`}
              description="Checking this box will cause this field to be deleted before setting any values. Fields that are cleared appear with a delete icon in the tree."
              width="size-5000"
              isDisabled={hasClearedAncestor}
            >
              Clear existing value
            </FormikCheckbox>
          )}
        </>
      )}
    </div>
  );
};

NodeEdit.propTypes = {
  onNodeSelect: PropTypes.func.isRequired,
  selectedNodeId: PropTypes.string.isRequired,
  verticalLayout: PropTypes.bool,
};

export default NodeEdit;
