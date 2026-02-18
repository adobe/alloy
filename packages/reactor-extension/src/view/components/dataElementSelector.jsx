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

import { Children } from "react";
import PropTypes from "prop-types";
import { useField } from "formik";
import RawDataElementSelector from "./rawDataElementSelector";

const DataElementSelector = ({
  children,
  augmentValue,
  tokenize,
  isDisabled,
  clearable,
}) => {
  // We have to vertically nudge down the data element selector
  // button if the field has a label so the button aligns
  // with the input box.
  const inputChild = Children.toArray(children).find(
    (child) => child.props.name,
  );

  if (!inputChild) {
    throw new Error(
      "DataElementSelector must wrap a component with its `name` prop set.",
    );
  }

  const name = inputChild.props.name;
  const adjustForLabel = Boolean(inputChild.props.label);
  const [{ value }, , { setValue }] = useField(name);

  return (
    <RawDataElementSelector
      augmentValue={augmentValue}
      value={value}
      onChange={setValue}
      adjustForLabel={adjustForLabel}
      isDisabled={isDisabled}
      tokenize={tokenize}
      clearable={clearable}
    >
      {children}
    </RawDataElementSelector>
  );
};

DataElementSelector.propTypes = {
  children: PropTypes.node.isRequired,
  augmentValue: PropTypes.bool,
  tokenize: PropTypes.bool,
  isDisabled: PropTypes.bool,
  clearable: PropTypes.bool,
};

export default DataElementSelector;
