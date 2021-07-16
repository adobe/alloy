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

import React, { forwardRef, useContext } from "react";
import { Link, withPrefix } from "gatsby";
import {
  isInternalLink,
  isExternalLink,
  fixInternalLink,
  trailingSlashFix
} from "../../utils";
import PropTypes from "prop-types";
import Context from "../Context";

const GatsbyLink = forwardRef(({ to, ...props }, ref) => {
  const { location, allSitePage, pathPrefix } = useContext(Context);
  if (isExternalLink(to)) {
    return <a href={to} ref={ref} {...props} />;
  }

  const pages = allSitePage.nodes.map(page => withPrefix(page.path));

  if (isInternalLink(to, location, pages)) {
    return (
      <Link
        to={fixInternalLink(to, location, pathPrefix)}
        ref={ref}
        {...props}
      />
    );
  }

  return (
    <a
      href={
        pathPrefix && to && to.startsWith(trailingSlashFix(pathPrefix))
          ? to.replace(pathPrefix, "")
          : to
      }
      ref={ref}
      {...props}
    />
  );
});

GatsbyLink.propTypes = {
  to: PropTypes.string
};

export { GatsbyLink };
