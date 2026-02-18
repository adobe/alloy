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

import { Flex, View } from "@adobe/react-spectrum";
import PropTypes from "prop-types";

const IndicatorDescription = ({ indicator, children }) => {
  return (
    <Flex>
      <Flex
        width="size-500"
        flexShrink={0}
        flexGrow={0}
        justifyContent="center"
        marginTop="size-50"
      >
        {indicator}
      </Flex>
      <View>{children}</View>
    </Flex>
  );
};

IndicatorDescription.propTypes = {
  indicator: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default IndicatorDescription;
