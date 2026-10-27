/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  ActionButton,
  Collection,
  ComboBox,
  ComboBoxItem,
  ComboBoxSection,
  Header,
  Text,
  Tooltip,
  TooltipTrigger,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import Copy from "@react-spectrum/s2/icons/Copy";
import copyToClipboard from "clipboard-copy";
import { useField } from "formik";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import DataElementSelector from "./dataElementSelector";
import RefreshButton from "./refreshButton";
import { findDatastream } from "../utils/useDatastreamCatalog";

const getLabel = (datastream) => datastream.data.title;

const matchesFilter = (datastream, filterText) =>
  getLabel(datastream).toLowerCase().includes(filterText) ||
  datastream._system.id.toLowerCase().includes(filterText);

const findByLabel = (groups, label) => {
  const matches = groups.flatMap(({ sandbox, datastreams }) =>
    datastreams
      .filter((datastream) => getLabel(datastream) === label)
      .map((datastream) => ({ datastream, sandbox })),
  );
  return matches.length === 1 ? matches[0] : undefined;
};

/**
 * A combo box for choosing a datastream from any sandbox, or entering any
 * value (ID, legacy composite ID, or data element). The saved value is always
 * the datastream ID or the exact text entered; the sandbox of a chosen
 * datastream is saved alongside it so later API calls can use it.
 */
const DatastreamField = ({
  name,
  sandboxName,
  catalog,
  label,
  description,
  placeholder,
  isRequired,
  "data-test-id": dataTestId,
}) => {
  const [{ value = "" }, { touched, error }, { setValue, setTouched }] =
    useField(name);
  const [{ value: sandbox = "" }, , { setValue: setSandbox }] =
    useField(sandboxName);
  const { groups } = catalog;

  const match = findDatastream(groups, value);
  const displayValue = match?.isExact ? getLabel(match.datastream) : value;
  const [inputValue, setInputValue] = useState(displayValue);
  const [isFocused, setIsFocused] = useState(false);
  const [unfilteredText, setUnfilteredText] = useState(displayValue);
  // The combo box can call onBlur with a closure from before the latest
  // keystroke rendered, so the committed text is read from a ref.
  const inputValueRef = useRef(inputValue);
  const updateInputValue = (text) => {
    inputValueRef.current = text;
    setInputValue(text);
  };

  useEffect(() => {
    if (!isFocused) {
      updateInputValue(displayValue);
      setUnfilteredText(displayValue);
    }
  }, [displayValue, isFocused]);

  const matchedSandboxName = match?.sandbox.name;
  useEffect(() => {
    if (matchedSandboxName && matchedSandboxName !== sandbox) {
      setSandbox(matchedSandboxName);
    }
  }, [matchedSandboxName, sandbox]);

  // A saved sandbox is kept for an unchanged value that can't be found (the
  // user may lack access to it), but a new value's sandbox must come from the
  // datastream list.
  const savedValue = useRef(value);
  useEffect(() => {
    if (value !== savedValue.current && !match) {
      setSandbox("");
    }
  }, [value]);

  const choose = (id, chosenSandboxName, chosenLabel) => {
    setValue(id);
    setSandbox(chosenSandboxName);
    updateInputValue(chosenLabel);
    setUnfilteredText(chosenLabel);
  };

  // Typed text is saved immediately because the extension bridge can read
  // settings while the field still has focus.
  const onInputChange = (text) => {
    updateInputValue(text);
    if (text !== displayValue) {
      setValue(text);
    }
  };

  const commitInput = () => {
    const text = inputValueRef.current;
    if (text === displayValue) {
      return;
    }
    const labelMatch = findByLabel(groups, text);
    if (labelMatch) {
      choose(labelMatch.datastream._system.id, labelMatch.sandbox.name, text);
    }
  };

  const filterText =
    inputValue === unfilteredText ? "" : inputValue.trim().toLowerCase();
  const sections = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          datastreams: group.datastreams.filter((datastream) =>
            matchesFilter(datastream, filterText),
          ),
        }))
        .filter((group) => group.datastreams.length > 0),
    [groups, filterText],
  );

  return (
    <div
      className={style({
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
      })}
    >
      <DataElementSelector>
        <ComboBox
          data-test-id={dataTestId}
          name={name}
          label={label}
          description={description}
          placeholder={placeholder}
          isRequired={isRequired}
          allowsCustomValue
          items={sections}
          selectedKey={
            match?.isExact && inputValue === displayValue ? value : null
          }
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSelectionChange={(key) => {
            if (key == null) {
              return;
            }
            const selected = findDatastream(groups, key);
            if (selected) {
              choose(key, selected.sandbox.name, getLabel(selected.datastream));
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            commitInput();
            setIsFocused(false);
            setTouched(true);
          }}
          loadingState={catalog.isLoading ? "loading" : "idle"}
          isInvalid={Boolean(touched && error)}
          errorMessage={touched ? error : undefined}
          styles={style({ width: 400 })}
        >
          {(section) => (
            <ComboBoxSection id={section.sandbox.name}>
              <Header>{section.sandbox.title}</Header>
              <Collection items={section.datastreams}>
                {(datastream) => (
                  <ComboBoxItem
                    id={datastream._system.id}
                    textValue={getLabel(datastream)}
                  >
                    <Text slot="label">{getLabel(datastream)}</Text>
                    <Text slot="description">{datastream._system.id}</Text>
                  </ComboBoxItem>
                )}
              </Collection>
            </ComboBoxSection>
          )}
        </ComboBox>
      </DataElementSelector>
      <div
        className={style({
          display: "flex",
          flexDirection: "row",
          marginTop: 24,
        })}
      >
        <RefreshButton
          onPress={catalog.reload}
          isDisabled={catalog.isLoading}
          tooltipText="Refresh datastreams list"
          ariaLabel="Refresh datastreams"
        />
        <TooltipTrigger>
          <ActionButton
            isQuiet
            isDisabled={!value}
            onPress={() => copyToClipboard(value)}
            aria-label="Copy datastream ID to clipboard"
          >
            <Copy />
          </ActionButton>
          <Tooltip>Copy datastream ID to clipboard.</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
};

DatastreamField.propTypes = {
  name: PropTypes.string.isRequired,
  sandboxName: PropTypes.string.isRequired,
  catalog: PropTypes.shape({
    groups: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }).isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.node,
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool,
  "data-test-id": PropTypes.string,
};

export default DatastreamField;
