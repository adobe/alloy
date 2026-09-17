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
import { Badge } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";

const BADGE_STYLE = style({ marginStart: 8 });

// S2 Badge has no background-color override; the disabled look uses the
// neutral variant instead of forcing a specific color like v3 did.
const betaBadge = ({ isDisabled }) => {
  return (
    <Badge
      variant={isDisabled ? "neutral" : "informative"}
      styles={BADGE_STYLE}
    >
      Beta
    </Badge>
  );
};

betaBadge.propTypes = {
  isDisabled: PropTypes.bool,
};

export default betaBadge;
