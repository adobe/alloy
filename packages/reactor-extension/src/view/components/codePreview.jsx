/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { ActionButton, LabeledValue, Text, TextArea } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import CodeIcon from "@react-spectrum/s2/icons/Code";
import FieldDescriptionAndError from "./fieldDescriptionAndError";
import "./codePreview.css";
import BetaBadge from "./betaBadge";

const CodePreview = ({
  "data-test-id": dataTestId,
  "aria-label": ariaLabel,
  label,
  buttonLabel,
  value,
  description,
  error,
  onPress,
  beta,
}) => {
  const classNames = ["CodePreview-textArea"];
  if (error) {
    classNames.push("CodePreview-textArea--invalid");
  }

  return (
    <div
      className={style({
        position: "relative",
      })}
      style={{
        width: "fit-content",
      }}
    >
      <LabeledValue label={label} aria-label={ariaLabel} />
      {beta && <BetaBadge />}
      <FieldDescriptionAndError
        description={description}
        error={error}
        width="size-5000"
      >
        <TextArea
          aria-label={label || ariaLabel}
          value={value}
          isDisabled
          UNSAFE_className={classNames.join(" ")}
          isInvalid={Boolean(error)}
          styles={style({
            width: 400,
            height: 128,
          })}
        />
      </FieldDescriptionAndError>
      <div className="CodePreview-openEditorButton">
        <ActionButton data-test-id={dataTestId} onPress={onPress}>
          <CodeIcon />
          <Text>{buttonLabel}</Text>
        </ActionButton>
      </div>
    </div>
  );
};

CodePreview.propTypes = {
  "data-test-id": PropTypes.string,
  "aria-label": PropTypes.string,
  label: PropTypes.string,
  buttonLabel: PropTypes.string.isRequired,
  value: PropTypes.string,
  description: PropTypes.node,
  error: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  beta: PropTypes.bool,
};

export default CodePreview;
