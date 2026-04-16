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

import { useEffect } from "react";
import PropTypes from "prop-types";
import { ComboBox, Item } from "@adobe/react-spectrum";
import { useField } from "formik";
import usePagedComboBox from "../../utils/usePagedComboBox";

import useIsFirstRender from "../../utils/useIsFirstRender";
import Alert from "../alert";

const FormikPagedComboBox = ({
  name,
  width,
  loadItems,
  getKey,
  getLabel,
  dependencies = [],
  firstPage,
  firstPageCursor,
  "data-test-id": dataTestId,
  alertTitle,
  alertDescription,
  ...otherProps
}) => {
  const isFirstRender = useIsFirstRender();
  const [{ value }, { touched, error }, { setValue, setTouched }] =
    useField(name);

  const pagedComboBox = usePagedComboBox({
    defaultSelectedItem: value,
    loadItems,
    getKey,
    getLabel,
    firstPage,
    firstPageCursor,
  });

  useEffect(() => {
    if (!isFirstRender) {
      setValue(pagedComboBox.selectedItem);
    }
  }, [getKey(pagedComboBox.selectedItem)]);

  useEffect(() => {
    if (!isFirstRender) {
      pagedComboBox.clear();
    }
  }, dependencies);

  if (dependencies.length > 0 && !dependencies.find((d) => d)) {
    return null;
  }

  return (
    <>
      <ComboBox
        {...otherProps}
        data-test-id={dataTestId}
        width={width}
        items={pagedComboBox.items}
        inputValue={pagedComboBox.inputValue || ""}
        selectedKey={getKey(pagedComboBox.selectedItem) || null}
        loadingState={pagedComboBox.loadingState}
        validationState={touched && error ? "invalid" : undefined}
        errorMessage={error}
        onInputChange={pagedComboBox.onInputChange}
        onSelectionChange={pagedComboBox.onSelectionChange}
        onOpenChange={pagedComboBox.onOpenChange}
        onLoadMore={pagedComboBox.onLoadMore}
        onBlur={() => {
          setTouched(true);
        }}
      >
        {(item) => <Item key={getKey(item)}>{getLabel(item)}</Item>}
      </ComboBox>
      {pagedComboBox.inputValue === "" &&
        pagedComboBox.loadingState === "idle" &&
        pagedComboBox.items.length === 0 &&
        alertTitle &&
        alertDescription && (
          <Alert
            variant="negative"
            title={alertTitle}
            data-test-id={`${dataTestId}Alert`}
          >
            {alertDescription}
          </Alert>
        )}
    </>
  );
};

FormikPagedComboBox.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  loadItems: PropTypes.func.isRequired,
  getKey: PropTypes.func.isRequired,
  getLabel: PropTypes.func.isRequired,
  dependencies: PropTypes.array,
  firstPage: PropTypes.array,
  firstPageCursor: PropTypes.any,
  alertTitle: PropTypes.string,
  alertDescription: PropTypes.string,
  "data-test-id": PropTypes.string,
};

export default FormikPagedComboBox;
