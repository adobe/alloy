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
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

// TODO Define additional meta properties
const ContentSecurityPolicy = ({ title, description }) => (
  <Helmet>
    <html lang="en" />
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    <meta
      name="viewport"
      content="width=device-width,minimum-scale=1,initial-scale=1"
    />
    <meta
      http-equiv="Content-Security-Policy"
      // cdn.tt.omtrdc.net is necessary for Target VEC to function properly.
      content={`default-src 'self';
              script-src 'self' 'nonce-321' cdn.jsdelivr.net assets.adobedtm.com cdn.tt.omtrdc.net;
              style-src 'self' 'unsafe-inline';
              img-src * data:;
              connect-src 'self' *.alloyio.com *.adobedc.net *.demdex.net`}
    />
    <link
      rel="icon"
      href="https://www.adobe.com/favicon.ico"
      type="image/x-icon"
    />
    <link
      rel="shortcut icon"
      href="https://www.adobe.com/favicon.ico"
      type="image/x-icon"
    />
  </Helmet>
);

ContentSecurityPolicy.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};

export { ContentSecurityPolicy };
