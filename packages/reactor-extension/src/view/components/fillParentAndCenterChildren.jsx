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
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

const CONTAINER_STYLE = style({
  height: "full",
  alignItems: "center",
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
});

const FillParentAndCenterChildren = ({ children }) => {
  return <div className={CONTAINER_STYLE}>{children}</div>;
};

FillParentAndCenterChildren.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FillParentAndCenterChildren;
