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
import { css } from "@emotion/react";
import "@spectrum-css/table";

const Table = ({ children, ...props }) => (
  <table className="spectrum-Table" {...props}>
    {children}
  </table>
);

const THead = ({ children }) => (
  <thead className="spectrum-Table-head">{children}</thead>
);

const Th = ({ children }) => (
  <th className="spectrum-Table-headCell">{children}</th>
);

const TBody = ({ children }) => (
  <tbody className="spectrum-Table-body">{children}</tbody>
);

const Tr = ({ children }) => (
  <tr
    className="spectrum-Table-row"
    css={css`
      cursor: inherit;

      &:hover {
        background-color: inherit;
      }
    `}
  >
    {children}
  </tr>
);

const Td = ({ children }) => (
  <td className="spectrum-Table-cell">{children}</td>
);

export { Table, THead, Th, TBody, Tr, Td };
