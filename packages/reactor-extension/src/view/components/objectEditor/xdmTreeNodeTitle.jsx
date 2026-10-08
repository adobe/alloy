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
import {
  style,
  iconStyle,
  color,
} from "@react-spectrum/s2/style" with { type: "macro" };
import AlertIcon from "@react-spectrum/s2/icons/AlertTriangle";
import InfoIcon from "@react-spectrum/s2/icons/InfoCircle";
import Delete from "@react-spectrum/s2/icons/Delete";
import PopulationAmountIndicator from "./populationAmountIndicator";
import "./xdmTreeNodeTitle.css";
import { EMPTY, FULL, PARTIAL, BLANK } from "./constants/populationAmount";

// xdmTreeNodeTitle.css still styles antd's own `.ant-tree-treenode-disabled`
// ancestor class, which we don't render and so can't target with the
// style() macro. Resolve the real gray-500 here and hand it down as a CSS
// custom property so the plain CSS never has to hardcode a color.
const GRAY_500 = color("gray-500");

// The style() macro must be statically evaluable, so the `error` boolean
// can't be interpolated directly; precompute both variants.
const TEXT_COLOR_STYLES = {
  true: style({ color: "negative" }),
  false: style({}),
};
const TYPE_TEXT_COLOR_STYLES = {
  true: style({ color: "negative" }),
  false: style({ color: "gray-600" }),
};

const XdmTreeNodeTitle = (props) => {
  const { id, displayName, type, populationAmount, error, infoTip, clear } =
    props;
  return (
    <div
      data-test-id="xdmTreeNodeTitle"
      data-node-id={id}
      className={classNames(
        "XdmTreeNodeTitle",
        style({
          display: "flex",
          alignItems: "center",
          gap: 8,
        }),
        TEXT_COLOR_STYLES[Boolean(error)],
      )}
      style={{ "--xdm-tree-node-title-gray-500": GRAY_500 }}
    >
      {error && (
        <div title={error}>
          <div
            className={style({
              display: "flex",
              alignItems: "center",
            })}
          >
            <AlertIcon styles={iconStyle({ color: "negative", size: "S" })} />
          </div>
        </div>
      )}
      <PopulationAmountIndicator populationAmount={populationAmount} />
      <span
        data-test-id="xdmTreeNodeTitleDisplayName"
        className="XdmTreeNodeTitle-displayName"
      >
        {displayName}
      </span>
      {clear && (
        <div
          className={style({
            display: "flex",
            alignItems: "center",
          })}
        >
          <Delete styles={iconStyle({ size: "XS" })} />
        </div>
      )}
      {infoTip && (
        <div title={infoTip}>
          <div
            className={style({
              display: "flex",
              alignItems: "center",
            })}
          >
            <InfoIcon styles={iconStyle({ size: "XS" })} />
          </div>
        </div>
      )}
      <span
        className={classNames(
          "XdmTreeNodeTitle-type",
          TYPE_TEXT_COLOR_STYLES[Boolean(error)],
        )}
      >
        {type.split("-")[0]}
      </span>
    </div>
  );
};

XdmTreeNodeTitle.propTypes = {
  id: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  populationAmount: PropTypes.oneOf([FULL, PARTIAL, EMPTY, BLANK]),
  error: PropTypes.string,
  infoTip: PropTypes.string,
  clear: PropTypes.bool.isRequired,
};

export default XdmTreeNodeTitle;
