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
export const addStyle = (styleTagId, cssText) => {
  const existingStyle = document.getElementById(styleTagId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const styles = document.createElement("style");
  styles.id = styleTagId;

  styles.appendChild(document.createTextNode(cssText));
  document.head.appendChild(styles);
};

export const removeElements = cssClassName => {
  [...document.getElementsByClassName(cssClassName)].forEach(element => {
    if (!element) {
      return;
    }
    element.remove();
  });
};

export const applyStyleSetting = settings => {
  const {
    verticalAlign,
    width,
    horizontalAlign,
    backdropColor,
    height,
    cornerRadius,
    horizontalInset,
    verticalInset,
    uiTakeOver
  } = settings;
  return {
    verticalAlign: verticalAlign === "center" ? "middle" : verticalAlign,
    top: verticalAlign === "top" ? "0px" : "auto",
    width: width ? `${width}%` : "100%",
    horizontalAlign: horizontalAlign === "center" ? "middle" : horizontalAlign,
    backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
    height: height ? `${height}vh` : "100%",
    borderRadius: cornerRadius ? `${cornerRadius}px` : "0px",
    border: "none",
    marginLeft: horizontalInset ? `${horizontalInset}px` : "0px",
    marginRight: horizontalInset ? `${horizontalInset}px` : "0px",
    marginTop: verticalInset ? `${verticalInset}px` : "0px",
    marginBottom: verticalInset ? `${verticalInset}px` : "0px",
    zIndex: uiTakeOver ? "9999" : "0",
    position: uiTakeOver ? "fixed" : "relative",
    overflow: "hidden"
  };
};
