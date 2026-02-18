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
import { Badge } from "@adobe/react-spectrum";
import PropTypes from "prop-types";

const betaBadge = ({ isDisabled }) => {
  const styles = {
    padding: "0",
  };
  if (isDisabled) {
    styles.backgroundColor = "var(--spectrum-alias-text-color-disabled)";
  }

  return (
    <Badge variant="info" marginStart="size-100" UNSAFE_style={styles}>
      Beta
    </Badge>
  );
};

betaBadge.propTypes = {
  isDisabled: PropTypes.bool,
};

export default betaBadge;
