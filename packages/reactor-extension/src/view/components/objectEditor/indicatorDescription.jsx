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

import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";

const IndicatorDescription = ({ indicator, children }) => {
  return (
    <div
      className={style({
        display: "flex",
      })}
    >
      <div
        className={style({
          display: "flex",
          width: 40,
          flexShrink: 0,
          flexGrow: 0,
          justifyContent: "center",
          marginTop: 4,
        })}
      >
        {indicator}
      </div>
      <div>{children}</div>
    </div>
  );
};

IndicatorDescription.propTypes = {
  indicator: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default IndicatorDescription;
