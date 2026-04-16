/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { ContextualHelp, Heading, Content, Text } from "@adobe/react-spectrum";

const NodeDescription = ({ title, description }) => {
  if (!description) {
    return null;
  }

  return (
    <ContextualHelp
      variant="info"
      data-test-id="nodeDescription"
      aria-label="Click to view additional information about this field"
    >
      <Heading>{title}</Heading>
      <Content>
        <Text>{description}</Text>
      </Content>
    </ContextualHelp>
  );
};

NodeDescription.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default NodeDescription;
