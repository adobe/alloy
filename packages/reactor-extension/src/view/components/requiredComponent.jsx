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
import { InlineAlert, Content, Heading, Well } from "@adobe/react-spectrum";
import camelCaseToTitleCase from "../utils/camelCaseToTitleCase";
import { LIBRARY_TYPE_PREINSTALLED } from "../constants/libraryType";
import FillParentAndCenterChildren from "./fillParentAndCenterChildren";
import { isDefaultComponent } from "../utils/alloyComponents.mjs";

/**
 * A component that will render children if the required component is enabled.
 * If the component is disabled, it will render an error message.
 *
 * @param {object} props The component props.
 * @param {object} props.initInfo The init info object.
 * @param {string} props.requiredComponent The named of the required component. (camelCased)
 * @param {string} props.title The title of the component.
 * @param {boolean} props.whole Is the component required for this whole form? If so, do not allow the form to create new items.
 * @param {boolean} props.deprecated Whether the component is deprecated.
 * @param {boolean} props.isPreinstalled Whether the library is in preinstalled mode.
 * @param {React.ReactNode} props.children The children to render.
 * @returns {React.ReactNode} The rendered component.
 */
const RequiredComponent = ({
  initInfo,
  requiredComponent,
  title,
  whole = false,
  deprecated = false,
  children,
}) => {
  const componentLabel = camelCaseToTitleCase(requiredComponent);
  const components = initInfo?.extensionSettings?.components || {};
  const isComponentDisabled = Object.keys(components).includes(
    requiredComponent,
  )
    ? components[requiredComponent] === false
    : !isDefaultComponent(requiredComponent);
  const isPreinstalled =
    initInfo?.extensionSettings?.libraryCode?.type ===
    LIBRARY_TYPE_PREINSTALLED;

  if (isPreinstalled) {
    const content = (
      <>
        <InlineAlert
          variant="notice"
          width="size-5000"
          data-test-id="preinstalledModeWarning"
          marginBottom="size-100"
        >
          <Heading>Self-hosted Alloy instance detected</Heading>
          <Content>
            {title && title.charAt(0).toUpperCase() + title.slice(1)} requires
            the &quot;
            {componentLabel}&quot; component to be included in your self-hosted
            alloy.js build. If this component is missing, {title} will not
            function correctly.{" "}
          </Content>
        </InlineAlert>
        {children}
      </>
    );

    return whole ? content : <Well marginBottom="size-200">{content}</Well>;
  }

  if (!isComponentDisabled) {
    return children;
  }

  if (whole) {
    const isNew = initInfo?.settings == null;

    if (isNew) {
      // This is returned when the component is disabled and the item is new. We want
      // to only show the error.
      return (
        <FillParentAndCenterChildren>
          <InlineAlert
            width="size-5000"
            variant="negative"
            data-test-id="requiredComponentError"
          >
            <Heading>Custom build component disabled</Heading>
            <Content>
              You cannot create {title} because a custom build component is
              disabled on this property. To create this, first enable the{" "}
              {componentLabel} component in the custom build section of the Web
              SDK extension configuration.
            </Content>
          </InlineAlert>
        </FillParentAndCenterChildren>
      );
    }
    // This is returned when the component is diabled and the item is existing. We want
    // to still show the form, but with a warning.
    return (
      <>
        <InlineAlert
          variant="notice"
          width="size-5000"
          data-test-id="requiredComponentWarning"
        >
          <Heading>Custom build component disabled</Heading>
          <Content>
            Warning, {title} will not function correctly because a custom build
            component is disabled on this property. To fix this, first enable
            the {componentLabel} component in the custom build section of the
            Web SDK extension configuration.
          </Content>
        </InlineAlert>
        {children}
      </>
    );
  }

  if (!deprecated) {
    return (
      <InlineAlert width="size-5000">
        <Heading>Custom build component disabled</Heading>
        <Content>
          This part of the configuration is hidden because a custom build
          component is disabled on this property. To set {title}, enable the{" "}
          {componentLabel} component in the custom build section of the Web SDK
          extension configuration.
        </Content>
      </InlineAlert>
    );
  }

  return null;
};

RequiredComponent.propTypes = {
  initInfo: PropTypes.object.isRequired,
  requiredComponent: PropTypes.string.isRequired,
  title: PropTypes.string,
  whole: PropTypes.bool,
  deprecated: PropTypes.bool,
  children: PropTypes.node,
};

export default RequiredComponent;
