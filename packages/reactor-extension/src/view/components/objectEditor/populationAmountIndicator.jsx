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
import classNames from "classnames";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { FULL, PARTIAL, EMPTY, BLANK } from "./constants/populationAmount";

const SIZE_STYLE = style({
  width: 15,
  height: 15,
  minHeight: 15,
  minWidth: 15,
});
const BASE_RING_STYLE = style({ stroke: "gray-400" });
const EMPHASIS_RING_STYLE = style({ stroke: "blue-900" });

// The style() macro must be statically evaluable, so the populationAmount
// value can't be interpolated into a dasharray directly; precompute one
// dasharray per possible amount and select at runtime.
const DASH_ARRAY_BY_POPULATION_AMOUNT = {
  [FULL]: "100 0",
  [PARTIAL]: "50 50",
  [EMPTY]: "0 200",
};

const PopulationAmountIndicator = ({ className, populationAmount }) => {
  return populationAmount && populationAmount !== BLANK ? (
    <svg viewBox="0 0 42 42" className={classNames(SIZE_STYLE, className)}>
      <circle
        className={BASE_RING_STYLE}
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        strokeWidth="9"
      />

      <circle
        className={EMPHASIS_RING_STYLE}
        cx="21"
        cy="21"
        r="15.91549430918954"
        fill="transparent"
        strokeWidth="9"
        strokeDashoffset="25"
        strokeDasharray={DASH_ARRAY_BY_POPULATION_AMOUNT[populationAmount]}
        data-test-id="populationAmountIndicator"
      />
    </svg>
  ) : null;
};

PopulationAmountIndicator.propTypes = {
  className: PropTypes.string,
  populationAmount: PropTypes.oneOf([FULL, PARTIAL, EMPTY, BLANK]),
};

export default PopulationAmountIndicator;
