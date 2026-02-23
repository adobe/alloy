/*
Copyright 2022 Adobe. All rights reserved.
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
import { validateSurface } from "../utils/surfaceUtils";

const CONSTANT = "constant";
const DATA_ELEMENT = "dataElement";

export const bridge = {
  getInitialValues({ initInfo }) {
    const { personalization = {} } = initInfo.settings || {};
    const { surfaces } = personalization;

    if (Array.isArray(surfaces)) {
      return {
        surfacesInputMethod: CONSTANT,
        surfacesDataElement: "",
        surfacesArray: surfaces,
      };
    }
    if (typeof surfaces === "string") {
      return {
        surfacesInputMethod: DATA_ELEMENT,
        surfacesDataElement: surfaces,
        surfacesArray: [""],
      };
    }
    return {
      surfacesInputMethod: CONSTANT,
      surfacesDataElement: "",
      surfacesArray: [""],
    };
  },
  getSettings({ values }) {
    if (
      values.surfacesInputMethod === DATA_ELEMENT &&
      values.surfacesDataElement
    ) {
      return { surfaces: values.surfacesDataElement };
    }

    if (
      values.surfacesInputMethod === CONSTANT &&
      values.surfacesArray.length > 0
    ) {
      const surfaces = values.surfacesArray.filter((surface) => surface !== "");
      if (surfaces.length) {
        return { surfaces };
      }
    }
    return undefined;
  },
  formikStateValidationSchema: object().shape({
    surfacesDataElement: string().when("surfacesInputMethod", {
      is: DATA_ELEMENT,
      then: (schema) =>
        schema.matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED),
    }),
  }),
};

const Surfaces = () => {
  const [{ value: surfacesInputMethod }] = useField("surfacesInputMethod");
  const [{ value: surfacesArray }] = useField("surfacesArray");

  return (
    <div>
      <FormikRadioGroup
        name="surfacesInputMethod"
        orientation="horizontal"
        label="Surfaces"
      >
        <Radio data-test-id="surfaceConstantOptionField" value={CONSTANT}>
          Manually enter surfaces
        </Radio>
        <Radio
          data-test-id="surfaceDataElementOptionField"
          value={DATA_ELEMENT}
        >
          Provide a data element
        </Radio>
      </FormikRadioGroup>
      {surfacesInputMethod === DATA_ELEMENT && (
        <FieldSubset>
          <DataElementSelector>
            <FormikTextField
              data-test-id="surfaceDataElementField"
              label="Data element"
              name="surfacesDataElement"
              description="This data element should resolve to an array of surfaces."
              width="size-5000"
            />
          </DataElementSelector>
        </FieldSubset>
      )}
      {surfacesInputMethod === CONSTANT && (
        <FieldSubset>
          <Flex direction="column" gap="size-100" alignItems="start">
            <FieldArray
              name="surfacesArray"
              render={(arrayHelpers) => {
                return (
                  <div>
                    {surfacesArray.map((surface, index) => {
                      return (
                        <Flex key={index} alignItems="end">
                          <FormikTextField
                            data-test-id={`surface${index}Field`}
                            label="Surface"
                            name={`surfacesArray.${index}`}
                            width="size-5000"
                            aria-label="Surface"
                            marginTop="size-0"
                            validate={validateSurface}
                          />
                          <ActionButton
                            data-test-id={`deleteSurface${index}Button`}
                            isQuiet
                            isDisabled={surfacesArray.length === 1}
                            variant="secondary"
                            onPress={() => {
                              arrayHelpers.remove(index);
                            }}
                            aria-label="Remove surface"
                          >
                            <Delete />
                          </ActionButton>
                        </Flex>
                      );
                    })}
                    <Button
                      variant="secondary"
                      data-test-id="addSurfaceButton"
                      marginTop="size-100"
                      onPress={() => {
                        arrayHelpers.push("");
                      }}
                    >
                      Add surface
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

export default Surfaces;
