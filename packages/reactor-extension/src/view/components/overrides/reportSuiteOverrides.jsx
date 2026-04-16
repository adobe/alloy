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
import { ActionButton, Button, Flex, Item } from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import { FieldArray } from "formik";
import PropTypes from "prop-types";
import { useFieldValue } from "../../utils/useFieldValue";
import OverrideInput from "./overrideInput";
import { FIELD_NAMES } from "./utils";

/**
 * The section of the page that allows the user to input a variable number of
 * report suite overrides.
 *
 * @param {Object} props
 * @param {string} props.prefix The common prefix for all the data input
 * fields in the Formik state object.
 * @param {{ value: string, label: string }} props.items The list of items to
 * display in the dropdown.
 * @param {string[]} props.primaryItem The list of report suites that are being
 * overridden.
 * @param {boolean} [props.isDisabled=] Whether or not to disable the controls.
 * @param {(value: string) => string | undefined} props.validate A function that
 * returns undefined if the value is valid, or an error message if the value is
 * invalid.
 * @param {boolean} props.useManualEntry If true, the input is a text field. If
 * false, the input is a combo box.
 * @returns
 */
const ReportSuitesOverride = ({
  prefix,
  items,
  primaryItem,
  validate,
  useManualEntry,
  isDisabled,
}) => {
  const fieldName = `${prefix}.com_adobe_analytics.reportSuites`;
  const rsids = useFieldValue(fieldName);
  let reportSuiteDescription =
    "The IDs for the destination report suites in Adobe Analytics. The value must be a preconfigured override report suite (or a comma-separated list of report suites) from your datastream configuration and overrides the primary report suites.";
  if (primaryItem && primaryItem.length > 0) {
    reportSuiteDescription = `Overrides report suites: ${primaryItem
      .map((v) => `"${v}"`)
      .join(", ")}. ${reportSuiteDescription}`;
  }
  return (
    <FieldArray name={fieldName}>
      {({ remove, push }) => (
        <>
          <Flex direction="column" gap="size-100">
            {rsids.map((rsid, index) => (
              <Flex key={index} direction="row">
                <OverrideInput
                  useManualEntry={useManualEntry || items.length === 0}
                  data-test-id={`${FIELD_NAMES.reportSuitesOverride}.${index}`}
                  aria-label={`Report suite override #${index + 1}`}
                  label={index === 0 && "Report suites"}
                  allowsCustomValue
                  overrideType="report suites"
                  primaryItem={primaryItem}
                  validate={validate}
                  defaultItems={items}
                  isDisabled={isDisabled}
                  name={`${fieldName}.${index}`}
                  description={
                    index === rsids.length - 1 && reportSuiteDescription
                  }
                  width="size-5000"
                  key={index}
                >
                  {({ value, label }) => <Item key={value}>{label}</Item>}
                </OverrideInput>
                <ActionButton
                  isQuiet
                  isDisabled={isDisabled || rsids.length < 2}
                  marginTop={index === 0 && "size-300"}
                  data-test-id={`removeReportSuite.${index}`}
                  aria-label={`Remove report suite #${index + 1}`}
                  onPress={() => remove(index)}
                >
                  <Delete />
                </ActionButton>
              </Flex>
            ))}
          </Flex>
          <Button
            data-test-id="addReportSuite"
            variant="secondary"
            onPress={() => push("")}
            isDisabled={isDisabled}
            UNSAFE_style={{ maxWidth: "fit-content" }}
          >
            Add Report Suite
          </Button>
        </>
      )}
    </FieldArray>
  );
};

ReportSuitesOverride.propTypes = {
  prefix: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  primaryItem: PropTypes.arrayOf(PropTypes.string).isRequired,
  validate: PropTypes.func.isRequired,
  useManualEntry: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
};

export default ReportSuitesOverride;
