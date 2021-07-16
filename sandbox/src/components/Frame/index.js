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

import React, { useContext, useRef, useEffect, useState } from "react";
import { withPrefix } from "gatsby";
import { css } from "@emotion/react";
import { connectToChild } from "penpal";
import { Footer } from "../Footer";
import PropTypes from "prop-types";
import Context from "../Context";
import { isExternalLink } from "../../utils";

const Frame = ({
  src,
  height = "calc(100vh - var(--spectrum-global-dimension-size-800))",
  location
}) => {
  const iframe = useRef(null);
  const { ims } = useContext(Context);
  const [child, setChild] = useState(null);

  useEffect(() => {
    if (child) {
      if (iframe.current.clientHeight === 0) {
        child.onHide();
      } else {
        child.onShow();
      }
    }
  }, [location.pathname]);

  return (
    <>
      <iframe
        title="Main content"
        ref={iframe}
        src={isExternalLink(src) ? src : withPrefix(src)}
        onLoad={() => {
          const connection = connectToChild({
            // The iframe to which a connection should be made
            iframe: iframe.current,
            // Methods the parent is exposing to the child
            methods: {
              scrollTop(position = 0) {
                if (document?.scrollingElement) {
                  document.scrollingElement.scrollTop = position;
                }
              },
              getURL() {
                return window?.location?.href;
              },
              setHeight(height) {
                iframe.current.style.height = height;
              },
              getIMSAccessToken() {
                if (ims?.isSignedInUser()) {
                  return ims.getAccessToken();
                }

                return null;
              },
              getIMSProfile() {
                if (ims?.isSignedInUser()) {
                  return ims.getProfile();
                }

                return null;
              },
              signIn() {
                if (ims && !ims.isSignedInUser()) {
                  ims.signIn();
                }
              },
              signOut() {
                if (ims && ims.isSignedInUser()) {
                  ims.signOut();
                }
              }
            }
          });

          connection.promise.then(child => {
            if (iframe.current.clientHeight === 0) {
              child.onHide();
            } else {
              child.onShow();
            }

            setChild(child);
          });
        }}
        css={css`
          display: block;
          height: ${height};
          width: 100%;
          border: none;
        `}
      />

      <Footer />
    </>
  );
};

Frame.propTypes = {
  src: PropTypes.string,
  height: PropTypes.string,
  location: PropTypes.object
};

export default Frame;
