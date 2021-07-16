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

import React, { useState } from "react";
import { css } from "@emotion/react";
import classNames from "classnames";
import "@spectrum-css/textfield";
import "@spectrum-css/search";
import "@spectrum-css/button";
import { Magnify, Cross } from "../Icons";

export const SearchField = ({ className, onClear, onChange, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showClear, setShowClear] = useState(false);

  return (
    <form
      className={classNames("spectrum-Search", className)}
      onSubmit={event => {
        event.preventDefault();
        onSubmit && onSubmit();
      }}
    >
      <div
        className={classNames("spectrum-Textfield", {
          "is-focused": isFocused
        })}
        css={css`
          min-width: auto;
          width: 100%;
        `}
      >
        <Magnify className="spectrum-Textfield-icon" />
        <input
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          onChange={e => {
            onChange(e.target.value);
            setShowClear(e.target.value.length > 0);
          }}
          aria-label="Search"
          type="search"
          placeholder="Search"
          className="spectrum-Textfield-input spectrum-Search-input"
          autoComplete="off"
        />
      </div>
      {showClear && (
        <button
          aria-label="Clear Search"
          type="reset"
          className="spectrum-ClearButton spectrum-Search-clearButton"
          onClick={() => {
            onClear && onClear();
          }}
        >
          <Cross />
        </button>
      )}
    </form>
  );
};
