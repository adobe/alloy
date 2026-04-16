/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import InstanceNamePicker from "../components/instanceNamePicker";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a form field for an instance name picker.
 * @param {object} options - Options for the field.
 * @param {string} options.name - The formik key to use for this field.
 * @returns {Form} A form field for an instance name picker.
 */
export default function instancePicker({ name, onInstanceChange }) {
  const form = {
    getInitialValues({ initInfo }) {
      const { [name]: value = initInfo.extensionSettings.instances[0].name } =
        initInfo.settings || {};
      return { [name]: value };
    },
    getSettings({ values }) {
      const settings = {};
      if (values[name]) {
        settings[name] = values[name];
      }
      return settings;
    },
    Component({ namePrefix = "", initInfo }) {
      const formikContext = useFormikContext();
      const onChange = (context) => (key) => {
        if (onInstanceChange) {
          onInstanceChange({ context, instanceName: key, initInfo });
        }
      };
      return (
        <InstanceNamePicker
          data-test-id={`${namePrefix}${name}Picker`}
          name={`${namePrefix}${name}`}
          initInfo={initInfo}
          onChange={onChange(formikContext)}
        />
      );
    },
  };

  form.Component.propTypes = {
    initInfo: PropTypes.object.isRequired,
    namePrefix: PropTypes.string,
  };
  return form;
}
