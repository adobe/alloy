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
import SectionHeader from "../components/sectionHeader";
import BetaBadge from "../components/betaBadge";
import form from "./form";

/** @typedef {import("./form").Form} Form */
/**
 * This creates a section header with a learn more url.
 * @param {object} options - Options for the section header.
 * @param {string} options.label - The heading to use for the field.
 * @param {string} [options.learnMoreUrl] - The url to use for the learn more link.
 * @param {boolean} [options.beta] - Whether to show a beta badge.
 * @param {Form[]} [children] - The children forms to include in the section.
 * @returns {Form} A section header form.
 */
export default function section({ label, learnMoreUrl, beta }, children = []) {
  const { getInitialValues, getSettings, getValidationShape, Component } = form(
    {},
    children,
  );

  return {
    getInitialValues,
    getSettings,
    getValidationShape,
    Component: (props) => (
      <>
        <SectionHeader learnMoreUrl={learnMoreUrl}>
          {label}
          {beta && <BetaBadge />}
        </SectionHeader>
        <Component {...props} />
      </>
    ),
  };
}
