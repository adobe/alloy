/*
 * Copyright 2020 Adobe. All rights reserved.
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
import classNames from "classnames";
import { css } from "@emotion/react";
import "@spectrum-css/icon";

const commonProps = {
  focusable: false,
  "aria-hidden": true,
  role: "img"
};

// Used by GlobalNav
export const Adobe = props => (
  <svg
    {...props}
    {...commonProps}
    viewBox="0 0 30 26"
    fill="#FA0F00"
    aria-label="Adobe"
  >
    <polygon points="19,0 30,0 30,26"></polygon>
    <polygon points="11.1,0 0,0 0,26"></polygon>
    <polygon points="15,9.6 22.1,26 17.5,26 15.4,20.8 10.2,20.8"></polygon>
  </svg>
);

// Used by Picker
export const ChevronDown = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-ChevronDown100"
    )}
  >
    <path
      d="M4.5 13.25a1.094 1.094 0 01-.773-1.868L8.109 7 3.727 2.618A1.094 1.094 0 015.273 1.07l5.157 5.156a1.094 1.094 0 010 1.546L5.273 12.93a1.091 1.091 0 01-.773.321z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by Breadcrumbs
export const ChevronRightSmall = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-ChevronRight75"
    )}
  >
    <path
      d="M3.833 11.578a1.05 1.05 0 01-.742-1.793L6.876 6 3.091 2.215A1.05 1.05 0 114.575.73l4.529 4.527a1.05 1.05 0 010 1.486L4.575 11.27a1.047 1.047 0 01-.742.308z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M7.482 4.406l-.001-.001L3.86.783a.84.84 0 00-1.188 1.188L5.702 5l-3.03 3.03A.84.84 0 003.86 9.216l3.621-3.622h.001a.84.84 0 000-1.19z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by Accordion
export const ChevronRight = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-ChevronRight100"
    )}
  >
    <path
      d="M4.5 13.25a1.094 1.094 0 01-.773-1.868L8.109 7 3.727 2.618A1.094 1.094 0 015.273 1.07l5.157 5.156a1.094 1.094 0 010 1.546L5.273 12.93a1.091 1.091 0 01-.773.321z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M3 9.95a.875.875 0 01-.615-1.498L5.88 5 2.385 1.547A.875.875 0 013.615.302L7.74 4.377a.876.876 0 010 1.246L3.615 9.698A.872.872 0 013 9.95z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by InlineAlert
export const InfoMedium = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-InfoMedium"
    )}
    css={css`
      width: var(
        --spectrum-icon-info-medium-width,
        var(--spectrum-global-dimension-size-225)
      );
      height: var(
        --spectrum-icon-info-medium-height,
        var(--spectrum-global-dimension-size-225)
      );
    `}
  >
    <path
      d="M11 2a9 9 0 109 9 9 9 0 00-9-9zm-.15 2.65a1.359 1.359 0 011.431 1.283q.004.064.001.129a1.332 1.332 0 01-1.432 1.432 1.353 1.353 0 01-1.432-1.433 1.359 1.359 0 011.304-1.412q.064-.002.128.001zM13.5 16a.5.5 0 01-.5.5H9a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h1v-4H9a.5.5 0 01-.5-.5V9a.5.5 0 01.5-.5h2.5a.5.5 0 01.5.5v5.5h1a.5.5 0 01.5.5z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M9 1a8 8 0 108 8 8 8 0 00-8-8zm-.15 2.15a1.359 1.359 0 011.431 1.283q.004.064.001.129A1.332 1.332 0 018.85 5.994a1.353 1.353 0 01-1.432-1.433 1.359 1.359 0 011.304-1.412q.064-.002.128.001zM11 13.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H8V9h-.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h2a.5.5 0 01.5.5V12h.5a.5.5 0 01.5.5z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by InlineAlert
export const SuccessMedium = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-SuccessMedium"
    )}
    css={css`
      width: var(
        --spectrum-icon-success-medium-width,
        var(--spectrum-global-dimension-size-225)
      );
      height: var(
        --spectrum-icon-success-medium-height,
        var(--spectrum-global-dimension-size-225)
      );
    `}
  >
    <path
      d="M11 2a9 9 0 109 9 9 9 0 00-9-9zm5.638 5.609L10.1 15.652a.5.5 0 01-.742.038L5.086 11.5a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L9.6 13.1l5.486-6.751a.5.5 0 01.7-.073l.776.631a.5.5 0 01.076.702z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M9 1a8 8 0 108 8 8 8 0 00-8-8zm5.333 4.54l-6.324 8.13a.6.6 0 01-.437.23h-.037a.6.6 0 01-.425-.176l-3.893-3.9a.6.6 0 010-.849l.663-.663a.6.6 0 01.848 0L7.4 10.991l5.256-6.754a.6.6 0 01.843-.1l.728.566a.6.6 0 01.106.837z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by InlineAlert
export const WarningMedium = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-HelpMedium"
    )}
    css={css`
      width: var(
        --spectrum-icon-warning-medium-width,
        var(--spectrum-global-dimension-size-225)
      );
      height: var(
        --spectrum-icon-warning-medium-height,
        var(--spectrum-global-dimension-size-225)
      );
    `}
  >
    <path
      d="M10.563 2.206l-9.249 16.55a.5.5 0 00.436.744h18.5a.5.5 0 00.436-.744l-9.251-16.55a.5.5 0 00-.872 0zm1.436 15.044a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3.5a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M8.564 1.289L.2 16.256A.5.5 0 00.636 17h16.728a.5.5 0 00.436-.744L9.436 1.289a.5.5 0 00-.872 0zM10 14.75a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by InlineAlert
export const HelpMedium = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-HelpMedium"
    )}
    css={css`
      width: var(
        --spectrum-icon-help-medium-width,
        var(--spectrum-global-dimension-size-225)
      );
      height: var(
        --spectrum-icon-help-medium-height,
        var(--spectrum-global-dimension-size-225)
      );
    `}
  >
    <path
      d="M11 2a9 9 0 109 9 9 9 0 00-9-9zm-.007 14.681a1.145 1.145 0 01-1.227-1.215 1.159 1.159 0 011.115-1.201q.056-.002.112.001a1.159 1.159 0 011.226 1.088q.003.056.001.112a1.127 1.127 0 01-1.227 1.215zm1.981-6.63c-.684.642-1.344 1.215-1.333 1.736a2.275 2.275 0 00.176.732.25.25 0 01-.232.343h-1.26a.3.3 0 01-.228-.069 1.886 1.886 0 01-.421-1.2c0-.816.508-1.336 1.35-2.17.578-.573.911-.937.911-1.475 0-.625-.421-1.059-1.49-1.059a5.337 5.337 0 00-2 .473.249.249 0 01-.347-.23v-1.24a.5.5 0 01.3-.459 6.413 6.413 0 012.434-.5c2.1.006 3.261 1.2 3.261 2.725a3.053 3.053 0 01-1.121 2.393z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M9 1a8 8 0 108 8 8 8 0 00-8-8zm1.3 12.3a1.222 1.222 0 01-.3.9 1.223 1.223 0 01-.9.3 1.2 1.2 0 010-2.4c.8 0 1.3.5 1.2 1.2zm.1-4.5c-.4.4-.8.8-.8 1.2a1.135 1.135 0 00.3.8v.1a.098.098 0 01-.096.1H8.4a.229.229 0 01-.2-.1 1.666 1.666 0 01-.4-1.1 2.772 2.772 0 011-1.7 2.772 2.772 0 001-1.7c0-.5-.4-1.1-1.4-1.1a5.018 5.018 0 00-2 .4h-.2V4.3c0-.1 0-.2.1-.2a6.183 6.183 0 012.4-.5c1.9 0 3.1 1.1 3.1 2.7a3.704 3.704 0 01-1.4 2.5z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by InlineAlert
export const AlertMedium = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-AlertMedium"
    )}
    css={css`
      width: var(
        --spectrum-icon-alert-medium-width,
        var(--spectrum-global-dimension-size-225)
      );
      height: var(
        --spectrum-icon-alert-medium-height,
        var(--spectrum-global-dimension-size-225)
      );
    `}
  >
    <path
      d="M10.563 2.206l-9.249 16.55a.5.5 0 00.436.744h18.5a.5.5 0 00.436-.744l-9.251-16.55a.5.5 0 00-.872 0zm1.436 15.044a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3.5a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M8.564 1.289L.2 16.256A.5.5 0 00.636 17h16.728a.5.5 0 00.436-.744L9.436 1.289a.5.5 0 00-.872 0zM10 14.75a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25zm0-3a.25.25 0 01-.25.25h-1.5a.25.25 0 01-.25-.25v-6a.25.25 0 01.25-.25h1.5a.25.25 0 01.25.25z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

// Used by GithubActions
export const Edit = ({ ...props }) => (
  <svg
    {...props}
    {...commonProps}
    viewBox="0 0 36 36"
    className="spectrum-Icon spectrum-Icon--sizeS"
  >
    <path d="M33.567 8.2L27.8 2.432a1.215 1.215 0 0 0-.866-.353H26.9a1.371 1.371 0 0 0-.927.406L5.084 23.372a.99.99 0 0 0-.251.422L2.055 33.1c-.114.377.459.851.783.851a.251.251 0 0 0 .062-.007c.276-.063 7.866-2.344 9.311-2.778a.972.972 0 0 0 .414-.249l20.888-20.889a1.372 1.372 0 0 0 .4-.883 1.221 1.221 0 0 0-.346-.945zM11.4 29.316c-2.161.649-4.862 1.465-6.729 2.022l2.009-6.73z"></path>
  </svg>
);

// Used by GithubActions
export const Bug = ({ ...props }) => (
  <svg
    {...props}
    {...commonProps}
    viewBox="0 0 36 36"
    className="spectrum-Icon spectrum-Icon--sizeS"
  >
    <path d="M26.194 7.242A9.8 9.8 0 0 0 18 3a9.8 9.8 0 0 0-8.194 4.242A11.943 11.943 0 0 0 18 10.5a11.943 11.943 0 0 0 8.194-3.258zm-20.978-.85L2.548 7.726a18.1 18.1 0 0 0 4.581 5.114A27.459 27.459 0 0 0 6.118 18H0v3h6.045a13.6 13.6 0 0 0 2.5 6.363 15.078 15.078 0 0 0-4.5 6.16l2.7 1.35a12.052 12.052 0 0 1 3.774-5.2 11.571 11.571 0 0 0 5.981 3.185V13.5A14.982 14.982 0 0 1 5.216 6.392zM36 21v-3h-6.118a27.459 27.459 0 0 0-1.011-5.16 18.1 18.1 0 0 0 4.581-5.114l-2.668-1.334A14.982 14.982 0 0 1 19.5 13.5v19.358a11.571 11.571 0 0 0 5.979-3.185 12.052 12.052 0 0 1 3.774 5.2l2.7-1.35a15.078 15.078 0 0 0-4.5-6.16A13.6 13.6 0 0 0 29.955 21z"></path>
  </svg>
);

export const CheckMark = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className={classNames(
      className,
      "spectrum-Icon",
      "spectrum-UIIcon-Checkmark100"
    )}
  >
    <path
      d="M5.125 12.625a1.25 1.25 0 01-.96-.45L1.04 8.425a1.25 1.25 0 011.92-1.6l2.136 2.563 5.922-7.536a1.25 1.25 0 111.964 1.545l-6.874 8.75a1.25 1.25 0 01-.965.478z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);

export const TripleGripper = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    viewBox="0 0 36 36"
    className="spectrum-Icon spectrum-Icon--sizeS"
  >
    <rect height="4" rx="1" ry="1" width="28" x="4" y="16"></rect>
    <rect height="4" rx="1" ry="1" width="28" x="4" y="6"></rect>
    <rect height="4" rx="1" ry="1" width="28" x="4" y="26"></rect>
  </svg>
);

// Used by SearchField
export const Magnify = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    viewBox="0 0 36 36"
    className={classNames(className, "spectrum-Icon", "spectrum-Icon--sizeM")}
  >
    <path d="M33.173 30.215L25.4 22.443a12.826 12.826 0 10-2.957 2.957l7.772 7.772a2.1 2.1 0 002.958-2.958zM6 15a9 9 0 119 9 9 9 0 01-9-9z"></path>
  </svg>
);

// Used by SearchField
export const Cross = ({ className, ...props }) => (
  <svg
    {...props}
    {...commonProps}
    className="spectrum-Icon spectrum-UIIcon-Cross75"
  >
    <path
      d="M6.485 5l2.674-2.674A1.05 1.05 0 107.674.84L5 3.515 2.326.84A1.05 1.05 0 00.84 2.326L3.515 5 .84 7.674A1.05 1.05 0 002.326 9.16L5 6.485 7.674 9.16A1.05 1.05 0 109.16 7.674z"
      className="spectrum-UIIcon--large"
    ></path>
    <path
      d="M5.188 4l2.14-2.14A.84.84 0 106.141.672L4 2.812 1.86.672A.84.84 0 00.672 1.86L2.812 4 .672 6.14A.84.84 0 101.86 7.328L4 5.188l2.14 2.14A.84.84 0 107.328 6.14z"
      className="spectrum-UIIcon--medium"
    ></path>
  </svg>
);
