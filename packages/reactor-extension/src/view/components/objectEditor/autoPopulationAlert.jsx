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

import { InlineAlert, Content, Heading } from "@adobe/react-spectrum";
import { ALWAYS, COMMAND, CONTEXT } from "./constants/autoPopulationSource";
import { OBJECT } from "./constants/schemaType";
import { formStateNodePropTypes } from "./helpers/getInitialFormState";
/**
 * Shown on the edit form for any fields that get populated
 * automatically by Alloy.
 */
const AutoPopulationAlert = ({ formStateNode }) => {
  const { autoPopulationSource, contextKey, schema } = formStateNode;

  return (
    <InlineAlert
      data-test-id="autoPopulationAlert"
      variant="info"
      width="size-5000"
    >
      <Heading size="XXS">Auto-populated field</Heading>
      <Content>
        {autoPopulationSource === ALWAYS && (
          <p>
            The value for this field will be auto-populated when this data
            element is provided as the XDM object for a <b>Send event</b>{" "}
            action. This value cannot be overwritten.
          </p>
        )}
        {autoPopulationSource === COMMAND && (
          <p>
            The value for this field may be specified as an option to the{" "}
            <b>Send event</b> action. You can provide a value here, but it will
            be overwritten if this field is also specified in the action.
          </p>
        )}
        {autoPopulationSource === CONTEXT && schema.type !== OBJECT && (
          <p>
            The value for this field will be auto-populated when this data
            element is provided as the XDM object for a <b>Send event</b> action
            if the <b>{contextKey}</b> context is configured. If you provide a
            value here, it will overwrite the auto-populated value.
          </p>
        )}
        {autoPopulationSource === CONTEXT && schema.type === OBJECT && (
          <p>
            Some of the attributes of this field will be auto-populated when
            this data element is provided as the XDM object for a{" "}
            <b>Send event</b> action if the <b>{contextKey}</b> context is
            configured. If you provide a data element here, it will overwrite
            the auto-populated value.
          </p>
        )}
        {autoPopulationSource === CONTEXT && (
          <p>
            You can configure which contexts are enabled in the Adobe Experience
            Platform Web SDK extension configuration in the{" "}
            <b>Data collection</b> section under the options labeled{" "}
            <b>When sending event data, automatically include</b>.
          </p>
        )}
      </Content>
    </InlineAlert>
  );
};

AutoPopulationAlert.propTypes = {
  formStateNode: formStateNodePropTypes.isRequired,
};

export default AutoPopulationAlert;
