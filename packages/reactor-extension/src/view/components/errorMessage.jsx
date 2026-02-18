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
import { Content, Heading, IllustratedMessage } from "@adobe/react-spectrum";
import Error from "@spectrum-icons/illustrations/Error";
import PropTypes from "prop-types";
import FillParentAndCenterChildren from "./fillParentAndCenterChildren";
import useExtensionBridge from "../utils/useExtensionBridge";

const ErrorMessage = ({ children, dataTestId }) => {
  useExtensionBridge({
    init: () => ({}),
    getSettings: () => ({}),
    validate: () => false,
  });

  return (
    <FillParentAndCenterChildren>
      <IllustratedMessage data-test-id={dataTestId}>
        <Error />
        <Heading>An error occurred.</Heading>
        <Content>{children}</Content>
      </IllustratedMessage>
    </FillParentAndCenterChildren>
  );
};

ErrorMessage.propTypes = {
  children: PropTypes.node.isRequired,
  dataTestId: PropTypes.string,
};

export default ErrorMessage;
