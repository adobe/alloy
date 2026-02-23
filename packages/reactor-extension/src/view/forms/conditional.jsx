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
import { mixed } from "yup";
import { useField } from "formik";
import PropTypes from "prop-types";
import form from "./form";

/** @typedef {import("./form").Form} Form */
/**
 * This function is used to create a form that conditionally renders
 * other form based on a conditional function.
 * @param {object} options The options for the conditional form.
 * @param {Array | string} options.args The name of the formik state field or fields
 * that will be passed to the conditional function as arguments.
 * @param {Function} options.condition If this function returns true, the part's
 * Components will be rendered, the part's schema will be used, and the part's
 * settings will be returned.
 * @param  {Form[]} children The form fragments that will be used when
 * the conditional returns true.
 * @returns {Form} A form that conditionally renders other forms.
 */
export default function conditional({ args, condition }, children) {
  const argsArray = Array.isArray(args) ? args : [args];
  const { getInitialValues, getSettings, getValidationShape, Component } = form(
    {},
    children,
  );

  const parts = {
    // getInitialValues should run regardless of the condition so that the
    // default formik state can be set up.
    getInitialValues,
    getSettings({ values }) {
      const conditionalArgValues = argsArray.map((arg) => values[arg]);
      if (!condition(...conditionalArgValues)) {
        return {};
      }
      return getSettings({ values });
    },
    getValidationShape({ initInfo, existingValidationShape }) {
      const validationShape = getValidationShape({
        initInfo,
        existingValidationShape: {},
      });
      return Object.keys(validationShape).reduce(
        (memo, key) => {
          const existingValidation = memo[key];
          if (existingValidation) {
            memo[key] = mixed().when(args, {
              is: condition,
              then: () => validationShape[key],
              otherwise: () => existingValidation,
            });
          } else {
            memo[key] = mixed().when(args, {
              is: condition,
              then: () => validationShape[key],
            });
          }
          return memo;
        },
        { ...existingValidationShape },
      );
    },
    Component: (props) => {
      const { namePrefix = "" } = props;
      const conditionalArgValues = argsArray.map((arg) => {
        const [{ value }] = useField(`${namePrefix}${arg}`);
        return value;
      });
      if (!condition(...conditionalArgValues)) {
        return null;
      }
      return <Component {...props} />;
    },
  };
  parts.Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return parts;
}
