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

import React from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import classNames from "classnames";
import nextId from "react-id-generator";
import { GatsbyLink } from "../GatsbyLink";
import "@spectrum-css/menu";
import { CheckMark } from "../Icons";
import { getExternalLinkProps } from "../../utils";

const Menu = ({ children }) => {
  return (
    <ul
      className="spectrum-Menu"
      role="menu"
      css={css`
        display: block;
      `}
    >
      {children}
    </ul>
  );
};

const Item = ({
  children,
  isDivider = false,
  isHighlighted,
  isSelected,
  href = "",
  ...props
}) => {
  const Element = href ? GatsbyLink : "li";

  return isDivider ? (
    <li className="spectrum-Menu-divider" role="separator" />
  ) : (
    <Element
      className={classNames(
        "spectrum-Menu-item",
        { "is-open": isHighlighted },
        { "is-selected": isSelected }
      )}
      to={href}
      {...getExternalLinkProps(href)}
      role="menuitem"
      tabIndex="0"
      css={css`
        text-align: left;
      `}
      {...props}
    >
      <span className="spectrum-Menu-itemLabel">{children}</span>
      <CheckMark className="spectrum-Menu-checkmark spectrum-Menu-itemIcon" />
    </Element>
  );
};

const Section = ({ children, title }) => {
  const id = nextId();

  return (
    <li role="presentation">
      <span className="spectrum-Menu-sectionHeading" id={id} aria-hidden="true">
        {title}
      </span>
      <ul className="spectrum-Menu" role="group" aria-labelledby={id}>
        {children}
      </ul>
    </li>
  );
};

Item.propTypes = {
  isHighlighted: PropTypes.bool,
  isSelected: PropTypes.bool,
  isDivider: PropTypes.bool,
  href: PropTypes.string
};

Section.propTypes = {
  title: PropTypes.string
};

export { Menu, Item, Section };
