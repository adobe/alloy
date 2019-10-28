/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fireImage from "./fireImage";
import { appendNode, awaitSelector, createNode, removeNode } from "./dom";
import { BODY, IFRAME } from "../constants/tagNames";

const fireOnPage = fireImage;

const IFRAME_ATTRS = {
  name: "Adobe Destinationing iFrame",
  class: "adobe-iframe",
  style: "display: none; width: 0; height: 0;"
};

const createFilterResultBySucceeded = succeeded => result =>
  result.succeeded === succeeded;
const mapResultToDest = result => result.dest;

export default ({ logger, destinations }) => {
  let iframePromise;

  const createIframe = () => {
    if (!iframePromise) {
      iframePromise = awaitSelector(BODY).then(([body]) => {
        const iframe = createNode(IFRAME, IFRAME_ATTRS);
        return appendNode(body, iframe);
      });
    }
    return iframePromise;
  };

  const fireInIframe = ({ src }) => {
    return createIframe().then(iframe => {
      const currentDocument = iframe.contentWindow.document;
      return fireImage({ src, currentDocument });
    });
  };

  return Promise.all(
    destinations.map(dest => {
      const imagePromise = dest.hideReferrer
        ? fireInIframe({ src: dest.url })
        : fireOnPage({ src: dest.url });

      return imagePromise
        .then(() => {
          logger.log("Destination succeeded:", dest.url);
          return {
            succeeded: true,
            dest
          };
        })
        .catch(() => {
          logger.log("Destination failed:", dest.url);
          return {
            succeeded: false,
            dest
          };
        });
    })
  ).then(results => {
    if (iframePromise) {
      iframePromise.then(iframe => removeNode(iframe));
    }

    return {
      succeeded: results
        .filter(createFilterResultBySucceeded(true))
        .map(mapResultToDest),
      failed: results
        .filter(createFilterResultBySucceeded(false))
        .map(mapResultToDest)
    };
  });
};
