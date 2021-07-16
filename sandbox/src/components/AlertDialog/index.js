/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Divider } from "../Divider";
import { Button } from "../Button";
import "@spectrum-css/underlay";
import "@spectrum-css/modal";
import "@spectrum-css/dialog";

const AlertDialog = ({ isOpen, setIsOpen, title, children }) => (
  <>
    <div
      onClick={() => {
        setIsOpen(false);
      }}
      css={css`
        z-index: 10;
      `}
      className={classNames(["spectrum-Underlay", { "is-open": isOpen }])}
    ></div>
    <div
      css={css`
        z-index: 11;
      `}
      className={classNames(["spectrum-Modal-wrapper", { "is-open": isOpen }])}
    >
      <div className={classNames(["spectrum-Modal", { "is-open": isOpen }])}>
        <section
          className="spectrum-Dialog spectrum-Dialog--medium"
          role="alertdialog"
          tabIndex="-1"
          aria-modal="true"
        >
          <div className="spectrum-Dialog-grid">
            <h1 className="spectrum-Dialog-heading">{title}</h1>
            <Divider size="M" className="spectrum-Dialog-divider" />
            <section className="spectrum-Dialog-content">{children}</section>
            <div className="spectrum-Dialog-buttonGroup">
              <Button
                variant="primary"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </>
);

AlertDialog.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  title: PropTypes.string
};

export default AlertDialog;
