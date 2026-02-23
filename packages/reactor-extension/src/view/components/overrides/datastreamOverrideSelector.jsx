/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
=
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  ActionButton,
  Flex,
  Item,
  Radio,
  useAsyncList,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";
import { useEffect } from "react";
import Delete from "@spectrum-icons/workflow/Delete";
import fetchConfigs from "../../configuration/utils/fetchConfigs";
import usePrevious from "../../utils/usePrevious";
import FormikRadioGroup from "../formikReactSpectrum3/formikRadioGroup";
import OverrideInput from "./overrideInput";

/**
 * @typedef {Object} Datastream
 * @property {string} orgId
 * @property {string} sandboxName
 * @property {Object} _system
 * @property {string} _system.id
 * @property {number} _system.revision
 * @property {string} _system.createdAt
 * @property {string} _system.createdBy
 * @property {string} _system.updatedAt
 * @property {string} _system.updatedBy
 * @property {Object} _links
 * @property {Object} _links.self
 * @property {string} _links.self.href
 * @property {Object} data
 * @property {boolean} data.enabled
 * @property {string} data.title
 * @property {string} data.description
 * @property {Object} data.settings
 */

/**
 * Get a unique identified for a datastream.
 * @param {Datastream} datastream
 * @returns {string?}
 */
// eslint-disable-next-line no-underscore-dangle
const getKey = (datastream) => datastream?._system?.id;
/**
 * Get a human-readable identifier for a datastream.
 * @param {Datastream} datastream
 * @returns {string?}
 */
const getLabel = (datastream) => {
  if (!datastream) {
    return undefined;
  }
  const region = datastream.region
    ? ` (${datastream.region.toUpperCase()})`
    : "";
  return `${datastream.data.title}${region}`;
};

const InputMethod = Object.freeze({
  SELECT: "select",
  FREEFORM: "freeform",
});

/**
 * Display a dropdown with text entry to choose (or enter) a datastream.
 * @param {Object} options
 * @param {string} orgId
 * @param {string} imsAccess
 * @param {string} name
 * @param {string} options.sandbox
 * @param {number} options.limit
 * @param {Object} options.otherProps
 * @param {string} options.label
 * @returns {React.ReactElement}
 */
const DatastreamOverrideSelector = ({
  orgId,
  imsAccess,
  sandbox,
  name,
  limit = 1000,
  label,
  ...otherProps
}) => {
  /** @type {import("@adobe/react-spectrum").AsyncListData<Datastream, string>} */
  const datastreamList = useAsyncList({
    async load({ signal }) {
      /** @type {{ results: Datastream[] }} */
      const { results: datastreams } = await fetchConfigs({
        orgId,
        imsAccess,
        limit,
        sandbox,
        signal,
      });
      return {
        items: datastreams,
      };
    },
  });
  const [{ value }, , { setValue }] = useField(name);
  const inputMethodFieldName = `${name}InputMethod`;
  /** @type {[{ value: "select" | "freeform" }]} */
  const [
    { value: inputMethod },
    { touched: inputMethodTouched },
    { setValue: setInputMethod },
  ] = useField(inputMethodFieldName);
  const selectedDatastream = datastreamList.items.find(
    (item) => getKey(item) === value,
  );
  useEffect(() => {
    if (datastreamList.error) {
      setInputMethod(InputMethod.FREEFORM);
      return;
    }
    if (inputMethodTouched) {
      return;
    }
    if (datastreamList.items.length === 0) {
      setInputMethod(InputMethod.FREEFORM);
    } else if (
      datastreamList.items.length > 0 &&
      (selectedDatastream || !value)
    ) {
      setInputMethod(InputMethod.SELECT);
    } else {
      setInputMethod(InputMethod.FREEFORM);
    }
  }, [
    datastreamList.error,
    datastreamList.items.length,
    selectedDatastream,
    inputMethodTouched,
    value,
  ]);
  const useManualEntry = inputMethod === InputMethod.FREEFORM;
  const inputMethodIsDisabled =
    datastreamList.items.length === 0 || Boolean(datastreamList.error);

  const previousSelectedSandbox = usePrevious(sandbox);
  useEffect(() => {
    // Reset the datastreams options if the user selects a different sandbox.
    // if the selected sandbox was changed we want to reload the datastreams dropdown and
    // reset the formik value, otherwise in case there the user haven't selected another datastream
    // formik will keep the old datastream value( when the extension was previously set up)
    if (previousSelectedSandbox && sandbox) {
      datastreamList.selectedKeys = null;
      if (value) {
        setValue(undefined);
      }
      datastreamList.reload();
    }
  }, [sandbox]);

  const onClear = () => {
    setValue(undefined);
    datastreamList.setSelectedKeys(null);
    datastreamList.reload();
  };

  return (
    <>
      <FormikRadioGroup
        label={label}
        name={inputMethodFieldName}
        isDisabled={inputMethodIsDisabled}
        orientation="horizontal"
      >
        <Radio
          data-test-id="datastreamOverrideInputMethodSelectRadio"
          value={InputMethod.SELECT}
        >
          Choose from list
        </Radio>
        <Radio
          data-test-id="datastreamOverrideInputMethodFreeformRadio"
          value={InputMethod.FREEFORM}
        >
          Enter values
        </Radio>
      </FormikRadioGroup>
      <Flex direction="row">
        <OverrideInput
          {...otherProps}
          aria-label={label}
          allowClear
          selectedKey={getKey(selectedDatastream)}
          items={datastreamList.items}
          name={name}
          loadingState={datastreamList.loadingState}
          useManualEntry={useManualEntry}
        >
          {(/** @type {Datastream} */ item) => (
            <Item key={getKey(item)}>{getLabel(item)}</Item>
          )}
        </OverrideInput>
        {!useManualEntry && (
          <ActionButton isQuiet aria-label="Clear" onPress={onClear}>
            <Delete />
          </ActionButton>
        )}
      </Flex>
    </>
  );
};

DatastreamOverrideSelector.propTypes = {
  orgId: PropTypes.string.isRequired,
  imsAccess: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  sandbox: PropTypes.string.isRequired,
  label: PropTypes.string,
  limit: PropTypes.number,
};

export default DatastreamOverrideSelector;
