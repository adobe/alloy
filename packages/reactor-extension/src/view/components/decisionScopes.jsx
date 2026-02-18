/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Radio, Button, ActionButton, Flex } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import { FieldArray, useField } from "formik";
import { object, string } from "yup";
import FormikRadioGroup from "./formikReactSpectrum3/formikRadioGroup";
import FormikTextField from "./formikReactSpectrum3/formikTextField";
import DataElementSelector from "./dataElementSelector";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FieldSubset from "./fieldSubset";

const CONSTANT = "constant";
const DATA_ELEMENT = "dataElement";

export const bridge = {
  getInitialValues({ initInfo }) {
    const { decisionScopes: legacyScopes, personalization = {} } =
      initInfo.settings || {};
    const { decisionScopes } = personalization;
    const scopes =
      legacyScopes && legacyScopes.length ? legacyScopes : decisionScopes;

    if (Array.isArray(scopes)) {
      return {
        decisionsInputMethod: CONSTANT,
        decisionScopesDataElement: "",
        decisionScopesArray: scopes,
      };
    }
    if (typeof scopes === "string") {
      return {
        decisionsInputMethod: DATA_ELEMENT,
        decisionScopesDataElement: scopes,
        decisionScopesArray: [""],
      };
    }
    return {
      decisionsInputMethod: CONSTANT,
      decisionScopesDataElement: "",
      decisionScopesArray: [""],
    };
  },
  getSettings({ values }) {
    if (
      values.decisionsInputMethod === DATA_ELEMENT &&
      values.decisionScopesDataElement
    ) {
      return { decisionScopes: values.decisionScopesDataElement };
    }

    if (
      values.decisionsInputMethod === CONSTANT &&
      values.decisionScopesArray.length > 0
    ) {
      const decisionScopes = values.decisionScopesArray.filter(
        (scope) => scope !== "",
      );
      if (decisionScopes.length) {
        return { decisionScopes };
      }
    }
    return undefined;
  },
  formikStateValidationSchema: object().shape({
    decisionScopesDataElement: string().when("decisionsInputMethod", {
      is: DATA_ELEMENT,
      then: (schema) =>
        schema.matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
    }),
  }),
};

const DecisionScopes = () => {
  const [{ value: decisionsInputMethod }] = useField("decisionsInputMethod");
  const [{ value: decisionScopesArray }] = useField("decisionScopesArray");

  return (
    <div>
      <FormikRadioGroup
        name="decisionsInputMethod"
        orientation="horizontal"
        label="Decision scopes"
      >
        <Radio data-test-id="scopeConstantOptionField" value={CONSTANT}>
          Manually enter scopes
        </Radio>
        <Radio data-test-id="scopeDataElementOptionField" value={DATA_ELEMENT}>
          Provide a data element
        </Radio>
      </FormikRadioGroup>
      {decisionsInputMethod === DATA_ELEMENT && (
        <FieldSubset>
          <DataElementSelector>
            <FormikTextField
              data-test-id="scopeDataElementField"
              label="Data element"
              name="decisionScopesDataElement"
              description="This data element should resolve to an array of scopes."
              width="size-5000"
            />
          </DataElementSelector>
        </FieldSubset>
      )}
      {decisionsInputMethod === CONSTANT && (
        <FieldSubset>
          <Flex direction="column" gap="size-100" alignItems="start">
            <FieldArray
              name="decisionScopesArray"
              render={(arrayHelpers) => {
                return (
                  <div>
                    {decisionScopesArray.map((scope, index) => {
                      return (
                        <Flex key={index} alignItems="end">
                          <FormikTextField
                            data-test-id={`scope${index}Field`}
                            label="Scope"
                            name={`decisionScopesArray.${index}`}
                            width="size-5000"
                            aria-label="Decision scope"
                            marginTop="size-0"
                          />
                          <ActionButton
                            data-test-id={`deleteScope${index}Button`}
                            isQuiet
                            isDisabled={decisionScopesArray.length === 1}
                            variant="secondary"
                            onPress={() => {
                              arrayHelpers.remove(index);
                            }}
                            aria-label="Remove decision scope"
                          >
                            <Delete />
                          </ActionButton>
                        </Flex>
                      );
                    })}
                    <Button
                      variant="secondary"
                      data-test-id="addDecisionScopeButton"
                      onPress={() => {
                        arrayHelpers.push("");
                      }}
                    >
                      Add scope
                    </Button>
                  </div>
                );
              }}
            />
          </Flex>
        </FieldSubset>
      )}
    </div>
  );
};

export default DecisionScopes;
