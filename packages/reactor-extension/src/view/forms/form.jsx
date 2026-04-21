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
import PropTypes from "prop-types";
import FormElementContainer from "../components/formElementContainer";

/**
 * @typedef {object} Form
 * @property {Function} [getInitialValues] - A function that converts the Adobe
 * Tags settings to an object of initial values to include in the Formik state.
 * @property {Function} [getSettings] - A function that converts the Formik state
 * into an object of Adobe Tags settings.
 * @property {object} [validationShape] - An object containing Formik fields as
 * keys and Yup validation schemas as values.
 * @property {Function} [getValidationShape] - A function that takes an existing
 * validation shape and returns a new validation shape. This is useful if you need to
 * modify an existing validator for the same field. Only use one of "validationShape"
 * or "getValidationShape". If you use both, "validationShape" will be ignored. Also,
 * initInfo is passed to getValidationShape.
 * @property {Function} [Component] - The react component to render. This
 * component will be passes the props "namePrefix", "initInfo", and
 * "formikProps".
 */

const Identity = (x) => x;

/**
 * This creates a composite form.
 * @param {object} [options] - The options for the form.
 * @param {Function} [options.wrapGetInitialValues] - A function that is given
 * the computed initial values from the children form elements and returns the
 * new initial values.
 * @param {Function} [options.wrapGetSettings] - A function that is given the computed
 * settings from the children form elements and returns the new settings.
 * @param {Function} [options.wrapValidationShape] - A function that is given the computed
 * validation shape from the children form elements and returns the new validation
 * shape.
 * @param {Form[]} children - The children forms to combine.
 * @returns {Form} A composite form.
 */
export default function Form(
  {
    wrapGetInitialValues = Identity,
    wrapGetSettings = Identity,
    wrapGetValidationShape = Identity,
  } = {},
  children = [],
) {
  const part = {
    getInitialValues({ initInfo }) {
      const initialValues = children
        .filter((child) => child.getInitialValues)
        .reduce((values, child) => {
          return {
            ...values,
            ...child.getInitialValues({ initInfo }),
          };
        }, {});
      return initialValues;
    },
    getSettings({ values }) {
      return children
        .filter((child) => child.getSettings)
        .reduce((settings, child) => {
          return {
            ...settings,
            ...child.getSettings({ values }),
          };
        }, {});
    },
    getValidationShape({ initInfo, existingValidationShape }) {
      return children
        .filter(
          ({ validationShape, getValidationShape }) =>
            validationShape || getValidationShape,
        )
        .reduce(
          (memo, { validationShape, getValidationShape }) => {
            if (validationShape) {
              if (
                Object.keys(memo).find(
                  (existingKey) => validationShape[existingKey],
                )
              ) {
                throw new Error(
                  `Duplicate validation key (${Object.keys(memo).join(
                    ",",
                  )}) versus (${Object.keys(validationShape).join(",")})`,
                );
              }
              return {
                ...memo,
                ...validationShape,
              };
            }
            return getValidationShape({
              initInfo,
              existingValidationShape: memo,
            });
          },
          { ...existingValidationShape },
        );
    },
    Component(props) {
      const { horizontal } = props;
      return (
        <FormElementContainer direction={horizontal ? "row" : "column"}>
          {children.map(({ Component }, index) => {
            if (Component) {
              return <Component key={`${index}`} {...props} />;
            }
            return null;
          })}
        </FormElementContainer>
      );
    },
  };
  part.getInitialValues = wrapGetInitialValues(part.getInitialValues);
  part.getSettings = wrapGetSettings(part.getSettings);
  part.getValidationShape = wrapGetValidationShape(part.getValidationShape);
  part.Component.propTypes = {
    horizontal: PropTypes.bool,
  };
  return part;
}
