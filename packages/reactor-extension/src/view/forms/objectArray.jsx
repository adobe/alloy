/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useFormField } from "./formContext";
import { useFieldValue } from "../utils/useFieldValue";
import { Radio, Button, ActionButton } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";
import Delete from "@react-spectrum/s2/icons/Delete";
import FormRadioGroup from "./fields/RadioGroup";
import FormTextField from "./fields/TextField";
import DataElementSelector from "../components/dataElementSelector";
import form from "./form";
import numberAwareCompareFunction from "../utils/numberAwareCompareFunction";
import FormElementContainer from "../components/formElementContainer";
import FormEditGroup from "../components/formEditGroup";
import {
  all,
  dataElementRequired,
  parentOf,
  previousItems,
  required,
  rule,
  shape,
  when,
} from "./validation";

const FORM = "form";
const DATA_ELEMENT = "dataElement";

const lowerInitialLetters = (s) => {
  return s
    .split(" ")
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
    .join(" ");
};

const WELL_CONTENT_STYLE = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});
const REMOVE_ROW_STYLE = style({ display: "flex" });
const REMOVE_BUTTON_STYLE = style({ marginStart: "auto" });
// Nudges the first row's remove button down to align with a field that has a
// label above it. The style() macro needs a literal per call, so the
// index === 0 comparison can't be interpolated directly; precompute both
// variants. size-300 = 24px per the S1->S2 dimension token table.
const HORIZONTAL_REMOVE_BUTTON_STYLES = {
  true: style({ marginTop: 24 }),
  false: style({ marginTop: 0 }),
};

const ObjectArrayContainer = ({ horizontal, label, children }) => {
  if (horizontal) {
    return (
      <FormEditGroup label={label}>
        <FormElementContainer>{children}</FormElementContainer>
      </FormEditGroup>
    );
  }
  return children;
};

ObjectArrayContainer.propTypes = {
  horizontal: PropTypes.bool,
  label: PropTypes.string,
  children: PropTypes.node,
};

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form element that allows the user to create an array of
 * objects, or an object with string keys and object values. Any items with no
 * values filled in will be removed from the final settings.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The form key to use for this field.
 *  - `${key}` will be used to store the array of objects.
 *  - `${key}InputMethod` will be used to determine whether or not to use a data
 *    element.
 *  - `${key}DataElement` will be used to store the data element value.
 * @param {string} options.label - The label to use for the field.
 * @param {string} options.singularLabel - The singular label to use for the add
 * button.
 * @param {string} [options.dataElementDescription] - The description to use for
 * the data element field. Usually you would use this to describe the type the
 * data element should be.
 * @param {string} [options.objectKey] - If you want to create an object, use
 * this to specify the form key to use for the keys of the object. If you want
 * to create an array of objects, omit this.
 * @param {string} [options.objectLabelPlural] - If you have set `objectKey`,
 * this will be used to describe the object keys in the validation error message
 * to make sure they are unique.
 * @param {Form[]} children - The Form parts to use for the object. These will
 * be used to create the form for each object in the array. When rendering the
 * components, the `prefixName` prop will be set to `${name}.${index}.`
 * @returns {Form} A form element that allows the user to create an array of
 * objects, or an object with string keys and object values.
 */
export default function objectArray(
  {
    name,
    label,
    ariaLabel,
    singularLabel,
    dataElementDescription,
    objectKey,
    objectLabelPlural,
    dataElementSupported = true,
    horizontal = false,
    compareFunction = numberAwareCompareFunction,
    isRowEmpty = () => true,
  },
  children = [],
) {
  const {
    getInitialValues: getItemInitialValues,
    getSettings: getItemSettings,
    getValidationShape: getItemValidationShape,
    Component: ItemComponent,
  } = form({}, children);

  const buildDefaultItem = () =>
    getItemInitialValues({ initInfo: { settings: null } });

  const formPart = {
    getInitialValues({ initInfo }) {
      const { [name]: value } = initInfo.settings || {};

      let transformedValue = value;
      if (transformedValue && objectKey) {
        transformedValue = Object.keys(transformedValue)
          .sort(compareFunction)
          .reduce((acc, k) => {
            acc.push({ [objectKey]: k, ...transformedValue[k] });
            return acc;
          }, []);
      }
      if (transformedValue && Array.isArray(transformedValue)) {
        transformedValue = transformedValue.map((item) =>
          getItemInitialValues({ initInfo: { settings: item } }),
        );
      } else {
        transformedValue = [buildDefaultItem()];
      }

      const initialValues = {
        [name]: transformedValue,
        [`${name}InputMethod`]: FORM,
        [`${name}DataElement`]: "",
      };

      if (typeof value === "string") {
        initialValues[name] = [""];
        initialValues[`${name}InputMethod`] = DATA_ELEMENT;
        initialValues[`${name}DataElement`] = value;
      }
      return initialValues;
    },
    getSettings({ values }) {
      const settings = {};
      if (values[`${name}InputMethod`] === FORM) {
        const itemSettings = values[name].map((item) =>
          getItemSettings({ values: item }),
        );
        const filteredItems = itemSettings.filter((item) =>
          objectKey ? item[objectKey] : Object.keys(item).length > 0,
        );
        if (filteredItems.length > 0) {
          if (objectKey) {
            settings[name] = filteredItems.reduce((acc, item) => {
              const { [objectKey]: settingKey, ...rest } = item;
              acc[settingKey] = rest;
              return acc;
            }, {});
          } else {
            settings[name] = filteredItems;
          }
        }
      } else {
        settings[name] = values[`${name}DataElement`];
      }
      return settings;
    },
    getValidationShape({ initInfo, existingValidationShape }) {
      const itemShape = getItemValidationShape({
        initInfo,
        existingValidationShape: {},
      });

      if (objectKey) {
        itemShape[objectKey] = all(
          ...[
            itemShape[objectKey],
            required(`Please provide a ${lowerInitialLetters(singularLabel)}.`),
            rule(
              (key, ctx) =>
                !previousItems(ctx).some((item) => item[objectKey] === key),
              `Duplicate ${lowerInitialLetters(objectLabelPlural)} are not allowed`,
            ),
          ].filter(Boolean),
        );
      }

      // Rows without any settings are left out when saving, so they are not
      // validated either.
      const itemSchema = when(
        (item) => Object.keys(getItemSettings({ values: item })).length > 0,
        shape(itemShape),
      );

      const inputMethodIs = (inputMethod) => (value, ctx) =>
        parentOf(ctx)[`${name}InputMethod`] === inputMethod;
      const validationShape = {
        [name]: when(
          (items, ctx) =>
            inputMethodIs(FORM)(items, ctx) && Array.isArray(items),
          itemSchema.array(),
        ),
        [`${name}DataElement`]: when(
          inputMethodIs(DATA_ELEMENT),
          dataElementRequired,
        ),
      };
      return {
        ...existingValidationShape,
        ...validationShape,
      };
    },
    Component: ({ namePrefix = "", ...props }) => {
      const inputMethod = useFieldValue(`${namePrefix}${name}InputMethod`);
      const itemsField = useFormField(`${namePrefix}${name}`);
      const items = itemsField.state.value;

      return (
        <ObjectArrayContainer horizontal={horizontal} label={singularLabel}>
          {dataElementSupported && (
            <FormRadioGroup
              name={`${namePrefix}${name}InputMethod`}
              orientation="horizontal"
              label={label}
              aria-label={ariaLabel}
            >
              <Radio
                data-test-id={`${namePrefix}${name}FormOption`}
                value={FORM}
              >
                Use a form.
              </Radio>
              <Radio
                data-test-id={`${namePrefix}${name}DataElementOption`}
                value={DATA_ELEMENT}
              >
                Provide a data element.
              </Radio>
            </FormRadioGroup>
          )}
          {inputMethod === FORM && (
            <>
              {items.map((item, index) => {
                return (
                  <div key={index}>
                    {!horizontal && (
                      <FormEditGroup label={`${singularLabel} ${index + 1}`}>
                        <div className={WELL_CONTENT_STYLE}>
                          <ItemComponent
                            namePrefix={`${namePrefix}${name}.${index}.`}
                            {...props}
                          />
                          <div className={REMOVE_ROW_STYLE}>
                            <Button
                              variant="secondary"
                              fillStyle="outline"
                              data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                              onPress={() => {
                                itemsField.handleChange(
                                  items.filter((_, i) => i !== index),
                                );
                              }}
                              isDisabled={
                                items.length === 1 && isRowEmpty(item)
                              }
                              styles={REMOVE_BUTTON_STYLE}
                            >
                              {`Remove ${lowerInitialLetters(singularLabel)}`}
                            </Button>
                          </div>
                        </div>
                      </FormEditGroup>
                    )}
                    {horizontal && (
                      <div className={REMOVE_ROW_STYLE}>
                        <ItemComponent
                          namePrefix={`${namePrefix}${name}.${index}.`}
                          hideLabel={index > 0}
                          horizontal
                          {...props}
                        />
                        <ActionButton
                          isQuiet
                          data-test-id={`${namePrefix}${name}${index}RemoveButton`}
                          onPress={() =>
                            items.length > 1
                              ? itemsField.handleChange(
                                  items.filter((_, i) => i !== index),
                                )
                              : itemsField.handleChange([buildDefaultItem()])
                          }
                          isDisabled={items.length === 1 && isRowEmpty(item)}
                          styles={HORIZONTAL_REMOVE_BUTTON_STYLES[index === 0]}
                        >
                          <Delete />
                        </ActionButton>
                      </div>
                    )}
                  </div>
                );
              })}
              <div>
                <Button
                  variant="secondary"
                  fillStyle="outline"
                  data-test-id={`${namePrefix}${name}AddButton`}
                  onPress={() => itemsField.pushValue(buildDefaultItem())}
                >
                  {`Add another ${lowerInitialLetters(singularLabel)}`}
                </Button>
              </div>
            </>
          )}
          {inputMethod === DATA_ELEMENT && (
            <DataElementSelector>
              <FormTextField
                data-test-id={`${namePrefix}${name}DataElementField`}
                name={`${namePrefix}${name}DataElement`}
                description={dataElementDescription}
                width="size-5000"
                aria-label={`${label} data element`}
              />
            </DataElementSelector>
          )}
        </ObjectArrayContainer>
      );
    },
  };
  formPart.Component.propTypes = {
    namePrefix: PropTypes.string,
  };
  return formPart;
}
