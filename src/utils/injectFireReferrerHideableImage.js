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

import fireImageInDocument from "./fireImage";
import {
  appendNode as appendNodeToDocument,
  awaitSelector as awaitSelectorInDocument,
  createNode as createNodeInDocument,
  removeNode as removeNodeInDocument
} from "./dom";
import { BODY, IFRAME } from "../constants/tagName";

const IFRAME_ATTRS = {
  name: "Adobe Alloy"
};

const IFRAME_PROPS = {
  style: {
    display: "none",
    width: 0,
    height: 0
  }
};

export default ({
  appendNode = appendNodeToDocument,
  awaitSelector = awaitSelectorInDocument,
  createNode = createNodeInDocument,
  fireImage = fireImageInDocument,
  removeNode = removeNodeInDocument
}) => {
  const fireOnPage = fireImage;

  let hiddenIframe;

  const createIframe = () => {
    if (hiddenIframe) {
      return Promise.resolve(hiddenIframe);
    }
    return awaitSelector(BODY).then(([body]) => {
      hiddenIframe = createNode(IFRAME, IFRAME_ATTRS, IFRAME_PROPS);
      return appendNode(body, hiddenIframe);
    });
  };

  const fireInIframe = ({ src }) => {
    return createIframe().then(iframe => {
      const currentDocument = iframe.contentWindow.document;
      return fireImage({ src, currentDocument }).catch(() => {
        hiddenIframe = undefined;
        removeNode(iframe);
      });
    });
  };

  return request => {
    const { hideReferrer, url } = request;
    return hideReferrer ? fireInIframe({ src: url }) : fireOnPage({ src: url });
  };
};
