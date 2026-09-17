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
import { InlineAlert, Heading, Content } from "@react-spectrum/s2";
import {
  style,
  iconStyle,
} from "@react-spectrum/s2/style" with { type: "macro" };
import InfoIcon from "@react-spectrum/s2/icons/InfoCircle";
import Delete from "@react-spectrum/s2/icons/Delete";
import PopulationAmountIndicator from "./populationAmountIndicator";
import { EMPTY, PARTIAL, FULL } from "./constants/populationAmount";
import IndicatorDescription from "./indicatorDescription";

/**
 * Shown when no node is selected within the XDM tree.
 */
const NoSelectedNodeView = ({
  schema,
  previouslySavedSchemaInfo,
  componentName,
  verticalLayout,
  updateMode,
}) => {
  // The schema used when the data element was last saved is different
  // from the latest configured schema. Either the customer has since
  // changed which dataset is configured in the edge configuration
  // or they have made changes to the schema itself.
  const isSchemaMismatched =
    previouslySavedSchemaInfo &&
    (previouslySavedSchemaInfo.id !== schema.$id ||
      previouslySavedSchemaInfo.version !== schema.version);

  return (
    <div>
      {isSchemaMismatched && (
        <div
          className={style({
            marginBottom: 8,
          })}
        >
          <InlineAlert
            variant="notice"
            data-test-id="schemaChangedNotice"
            styles={style({
              width: 400,
            })}
          >
            <Heading size="XXS">Schema changed</Heading>
            <Content>
              The XDM schema has changed since this {componentName} was last
              saved. After the next save, any fields that no longer exist on the
              XDM schema will also no longer be included on this {componentName}
              .
            </Content>
          </InlineAlert>
        </div>
      )}
      <div>
        <p>
          Build an object that complies with your configured schema by selecting
          attributes {verticalLayout ? "above" : "on the left"} and providing
          their values.
        </p>
        <div
          className={style({
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 40,
          })}
        >
          <IndicatorDescription
            indicator={<PopulationAmountIndicator populationAmount={EMPTY} />}
          >
            An empty circle indicates no attributes have been populated.
          </IndicatorDescription>
          <IndicatorDescription
            indicator={<PopulationAmountIndicator populationAmount={PARTIAL} />}
          >
            A partially filled in circle indicates some of the attributes have
            been populated.
          </IndicatorDescription>
          <IndicatorDescription
            indicator={<PopulationAmountIndicator populationAmount={FULL} />}
          >
            A full circle indicates all of the attributes have been populated.
          </IndicatorDescription>
          <IndicatorDescription
            indicator={<InfoIcon styles={iconStyle({ size: "XS" })} />}
          >
            Fields that may be auto-populated when this data element is passed
            to the XDM option of the <b>Send event</b> action have this icon.
            Hovering over the icon shows a popup explaining when the field will
            be auto-populated.
          </IndicatorDescription>
          {updateMode && (
            <IndicatorDescription
              indicator={<Delete styles={iconStyle({ size: "XS" })} />}
            >
              A delete icon indicates that the field will be cleared before
              setting any values. A field further up in the object is already
              cleared. This is controlled by the &quot;Clear exisiting
              values&quot; checkbox when editing a field.
            </IndicatorDescription>
          )}
        </div>
      </div>
    </div>
  );
};

NoSelectedNodeView.propTypes = {
  schema: PropTypes.object.isRequired,
  previouslySavedSchemaInfo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
  }),
  componentName: PropTypes.string.isRequired,
  verticalLayout: PropTypes.bool,
  updateMode: PropTypes.bool,
};

export default NoSelectedNodeView;
