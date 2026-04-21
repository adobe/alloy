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

import { useAsyncList } from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";
import { useEffect } from "react";
import fetchSandboxes from "../utils/fetchSandboxes";
import FormikPicker from "./formikReactSpectrum3/formikPicker";
import sandboxItems from "./sandboxItems";

/**
 * @typedef {Object} Sandbox
 * @property {string} name
 * @property {string} title
 * @property {string} state
 * @property {string} type
 * @property {string} region
 * @property {boolean} isDefault
 * @property {number} eTag
 * @property {string} createdDate
 * @property {string} lastModifiedDate
 * @property {string} createdBy
 * @property {string} lastModifiedBy
 */

/**
 * @param {Sandbox} sandbox
 * @returns {string}
 */
const getKey = (sandbox) => sandbox.name;

/**
 * @param {Object} props
 * @param {Object} props.initInfo
 * @param {Object} props.initInfo.company
 * @param {string} props.initInfo.company.orgId
 * @param {Object} props.initInfo.tokens
 * @param {string} props.initInfo.tokens.imsAccess
 * @param {string} props.name
 * @returns {JSX.Element}
 */
const SandboxSelector = ({ initInfo, name, ...otherProps }) => {
  const {
    company: { orgId },
    tokens: { imsAccess },
  } = initInfo;

  /** @type {import("@adobe/react-spectrum").AsyncListData<Sandbox, string>} */
  const sandboxList = useAsyncList({
    async load({ signal }) {
      if (!orgId || !imsAccess) {
        const missingParams = Object.entries({
          orgId,
          imsAccess,
        })
          .filter(([value]) => value)
          .map(([key]) => key)
          .join(", ");
        return {
          items: [],
          error: new Error(`Missing required parameters: ${missingParams}`),
        };
      }
      /** @type {{ results: Sandbox[] }} */
      const { results: sandboxes } = await fetchSandboxes({
        orgId,
        imsAccess,
        signal,
      });
      return {
        items: sandboxes,
        initialSelectedKeys:
          sandboxes.length === 1 ? [getKey(sandboxes[0])] : [],
        getKey,
      };
    },
  });

  const [{ value: sandbox }, , { setValue: setSandbox }] = useField(name);
  useEffect(() => {
    if (sandboxList.items.length === 1 && !sandbox) {
      setSandbox(sandboxList.items[0].name);
    } else {
      const defaultSandbox = sandboxList.items.find((s) => s.isDefault);
      if (defaultSandbox && !sandbox) {
        setSandbox(defaultSandbox.name);
      }
    }
  }, [sandboxList.items, sandbox]);

  if (sandboxList.error || sandboxList.items.length === 0) {
    return null;
  }

  return (
    <FormikPicker
      {...otherProps}
      isDisabled={sandboxList.items.length <= 1}
      name={name}
      items={sandboxList.items}
      isLoading={sandboxList.isLoading}
    >
      {sandboxItems}
    </FormikPicker>
  );
};

SandboxSelector.propTypes = {
  initInfo: PropTypes.shape({
    company: PropTypes.shape({
      orgId: PropTypes.string.isRequired,
    }).isRequired,
    tokens: PropTypes.shape({
      imsAccess: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
};

export default SandboxSelector;
