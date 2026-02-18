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
import PropTypes from "prop-types";
import SectionHeader from "../sectionHeader";

/**
 * The header for the Overrides Section. Can be standalone, with a bottom border
 * (aka largeHeader), or inline with the other overrides (aka smallHeader).
 * @param {Object} options
 * @param {boolean} [options.largeHeader=false] Use a large or small header. Defaults to false.
 * @param {string | React.Element | React.Element[]} options.children
 * @returns {React.Element}
 */
const HeaderContainer = ({ largeHeader = false, children, ...props }) => {
  const marginTop = largeHeader ? null : "size-200";
  const marginBottom = largeHeader ? null : "size-0";
  return (
    <SectionHeader marginTop={marginTop} marginBottom={marginBottom} {...props}>
      {children}
    </SectionHeader>
  );
};

HeaderContainer.propTypes = {
  largeHeader: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default HeaderContainer;
