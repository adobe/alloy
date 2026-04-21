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
import { Checkbox } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import FieldDescriptionAndError from "../components/fieldDescriptionAndError";
import BetaBadge from "../components/betaBadge";

/** @typedef {import("./form").Form} Form */
/**
 * Form builder for a disabled text field. When getSettings is called, this always returns the same value.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The name of the field to include in settings.
 * @param {string} options.value - The value of the field to include in settings.
 * @param {string} options.label - The label for the field.
 * @param {string} [options.description] - The description text to put under the
 * @param {boolean} [options.beta] - If true, a beta badge will be shown next to the
 * checkbox.
 * @returns {Form} A disabled checkbox form.
 */
export default function disabledCheckbox({
  name,
  value,
  label,
  description,
  beta,
}) {
  const Component = ({ namePrefix = "" }) => {
    return (
      <FieldDescriptionAndError
        description={description}
        messagePaddingTop="size-0"
        messagePaddingStart="size-300"
      >
        <Checkbox
          data-test-id={`${namePrefix}${name}DisabledCheckbox`}
          isSelected={value}
          width="size-5000"
          isDisabled
        >
          {label}
          {beta && <BetaBadge isDisabled />}
        </Checkbox>
      </FieldDescriptionAndError>
    );
  };
  Component.propTypes = {
    namePrefix: PropTypes.string,
  };

  return {
    getSettings() {
      return {
        [name]: value,
      };
    },
    Component,
  };
}
