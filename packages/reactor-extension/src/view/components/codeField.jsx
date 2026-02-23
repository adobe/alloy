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

import { useField } from "formik";
import PropTypes from "prop-types";
import { ActionButton, Flex, Text } from "@adobe/react-spectrum";
import CodePreview from "./codePreview";

/**
 * A button that, when clicked, opens the Launch code editor
 * which allows the user to edit code. When the user
 * closes the editor, this calls onChange with the updated
 * code.
 */
const CodeField = ({
  "data-test-id": dataTestId,
  "aria-label": ariaLabel,
  label,
  buttonLabelSuffix,
  name,
  description,
  language,
  placeholder,
  beta,
}) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] =
    useField(name);

  const onPress = async () => {
    setTouched(true);

    const options = {
      code: value || placeholder || "",
    };

    if (language) {
      options.language = language;
    }

    // This returns undefined when the user clicks cancel.
    let updatedCode = await window.extensionBridge.openCodeEditor(options);
    if (updatedCode === undefined) {
      return;
    }

    // If the user never changed placeholder code, don't save the placeholder code.
    if (placeholder && updatedCode === placeholder) {
      updatedCode = "";
    }
    setValue(updatedCode);
  };

  return (
    <Flex direction="row" gap="size-100">
      <CodePreview
        data-test-id={dataTestId}
        value={value}
        label={label}
        aria-label={ariaLabel}
        buttonLabel={`${value ? "Edit" : "Provide"} ${buttonLabelSuffix}`}
        description={description}
        error={touched && error ? error : undefined}
        onPress={onPress}
        beta={beta}
      />
      {value && (
        <ActionButton
          data-test-id={`${dataTestId}-clearButton`}
          onPress={() => {
            setValue("");
          }}
          marginTop={23}
        >
          <Text>Clear</Text>
        </ActionButton>
      )}
    </Flex>
  );
};

CodeField.propTypes = {
  "data-test-id": PropTypes.string,
  "aria-label": PropTypes.string,
  label: PropTypes.string,
  buttonLabelSuffix: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.node,
  beta: PropTypes.bool,
  language: PropTypes.string,
  placeholder: PropTypes.string,
};

export default CodeField;
