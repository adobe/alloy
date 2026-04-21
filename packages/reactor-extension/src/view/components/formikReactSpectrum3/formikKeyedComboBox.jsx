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

import { useRef } from "react";
import PropTypes from "prop-types";
import { ComboBox } from "@adobe/react-spectrum";
import { useField } from "formik";
import useForceRender from "../../utils/useForceRender";

const FormikKeyedComboBox = ({
  name,
  width,
  items,
  getKey,
  getLabel,
  ...otherProps
}) => {
  const [{ value }, { touched, error }, { setValue, setTouched }] =
    useField(name);
  const forceRender = useForceRender();
  const isFilteringRef = useRef(false);
  const itemsRef = useRef(items);

  let text;
  if (isFilteringRef.current) {
    text = value;
  } else {
    const currentItem = items.find((item) => getKey(item) === value);
    text = currentItem ? getLabel(currentItem) : value;
  }

  return (
    <ComboBox
      {...otherProps}
      inputValue={text}
      items={itemsRef.current}
      loadingState="idle"
      onInputChange={(newText) => {
        isFilteringRef.current = true;
        if (newText === "") {
          itemsRef.current = items;
        } else {
          const newTextLowerCase = newText.toLowerCase();
          itemsRef.current = items.filter(
            (item) =>
              getLabel(item).toLowerCase().includes(newTextLowerCase) ||
              getKey(item).toLowerCase().includes(newTextLowerCase),
          );
        }
        // This will cause a re-render.
        setValue(newText);
      }}
      onSelectionChange={(key) => {
        if (key) {
          isFilteringRef.current = false;
          itemsRef.current = items;
          setValue(key);
        }
      }}
      onBlur={() => {
        isFilteringRef.current = false;
        itemsRef.current = items;
        const selectedItem = items.find(
          (item) => getKey(item) === value || getLabel(item) === value,
        );
        if (selectedItem) {
          setValue(getKey(selectedItem));
        }
        setTouched(true);
      }}
      validationState={touched && error ? "invalid" : undefined}
      width={width}
      errorMessage={error}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          isFilteringRef.current = false;
          itemsRef.current = items;
          forceRender();
        }
      }}
    />
  );
};

FormikKeyedComboBox.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  items: PropTypes.array.isRequired,
  getKey: PropTypes.func.isRequired,
  getLabel: PropTypes.func.isRequired,
};

export default FormikKeyedComboBox;
