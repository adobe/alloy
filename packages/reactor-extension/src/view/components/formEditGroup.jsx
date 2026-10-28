/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { Card, Content, mergeStyles } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

const GROUP_STYLE = style({
  width: "fit",
  maxWidth: "full",
});

const FormEditGroup = ({ children, label, styles, ...props }) => (
  <Card {...props} styles={mergeStyles(GROUP_STYLE, styles)}>
    <Content styles={style({ minWidth: 0 })}>
      <div role="group" aria-label={label} className={style({ minWidth: 0 })}>
        {children}
      </div>
    </Content>
  </Card>
);

FormEditGroup.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string.isRequired,
  styles: PropTypes.string,
};

export default FormEditGroup;
