/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const buildXdmFromClickedElementProperties = (props) => {
  return {
    eventType: "web.webinteraction.linkClicks",
    web: {
      webInteraction: {
        name: props.linkName,
        region: props.linkRegion,
        type: props.linkType,
        URL: props.linkUrl,
        linkClicks: {
          value: 1,
        },
      },
    },
  };
};

const buildDataFromClickedElementProperties = (props) => {
  return {
    __adobe: {
      analytics: {
        c: {
          a: {
            activitymap: {
              page: props.pageName,
              link: props.linkName,
              region: props.linkRegion,
              pageIDType: props.pageIDType,
            },
          },
        },
      },
    },
  };
};

const populateClickedElementPropertiesFromOptions = (options, props) => {
  const { xdm, data, clickedElement } = options;
  props.clickedElement = clickedElement;
  if (xdm && xdm.web && xdm.web.webInteraction) {
    const { name, region, type, URL } = xdm.web.webInteraction;
    props.linkName = name;
    props.linkRegion = region;
    props.linkType = type;
    props.linkUrl = URL;
  }
  // DATA has priority over XDM
  /* eslint no-underscore-dangle: 0 */
  if (data && data.__adobe && data.__adobe.analytics) {
    const { c } = data.__adobe.analytics;
    if (c && c.a && c.a.activitymap) {
      // Set the properties if they exists
      const { page, link, region, pageIDType } = c.a.activitymap;
      props.pageName = page || props.pageName;
      props.linkName = link || props.linkName;
      props.linkRegion = region || props.linkRegion;
      if (pageIDType !== undefined) {
        props.pageIDType = pageIDType;
      }
    }
  }
};

export default ({ properties, logger } = {}) => {
  let props = properties || {};
  const clickedElementProperties = {
    get pageName() {
      return props.pageName;
    },
    set pageName(value) {
      props.pageName = value;
    },
    get linkName() {
      return props.linkName;
    },
    set linkName(value) {
      props.linkName = value;
    },
    get linkRegion() {
      return props.linkRegion;
    },
    set linkRegion(value) {
      props.linkRegion = value;
    },
    get linkType() {
      return props.linkType;
    },
    set linkType(value) {
      props.linkType = value;
    },
    get linkUrl() {
      return props.linkUrl;
    },
    set linkUrl(value) {
      props.linkUrl = value;
    },
    get pageIDType() {
      return props.pageIDType;
    },
    set pageIDType(value) {
      props.pageIDType = value;
    },
    get clickedElement() {
      return props.clickedElement;
    },
    set clickedElement(value) {
      props.clickedElement = value;
    },
    get properties() {
      return {
        pageName: props.pageName,
        linkName: props.linkName,
        linkRegion: props.linkRegion,
        linkType: props.linkType,
        linkUrl: props.linkUrl,
        pageIDType: props.pageIDType,
      };
    },
    isValidLink() {
      return (
        !!props.linkUrl &&
        !!props.linkType &&
        !!props.linkName &&
        !!props.linkRegion
      );
    },
    isInternalLink() {
      return this.isValidLink() && props.linkType === "other";
    },
    isValidActivityMapData() {
      return (
        !!props.pageName &&
        !!props.linkName &&
        !!props.linkRegion &&
        props.pageIDType !== undefined
      );
    },
    get xdm() {
      if (props.filteredXdm) {
        return props.filteredXdm;
      }
      return buildXdmFromClickedElementProperties(this);
    },
    get data() {
      if (props.filteredData) {
        return props.filteredData;
      }
      return buildDataFromClickedElementProperties(this);
    },
    applyPropertyFilter(filter) {
      if (filter && filter(props) === false) {
        if (logger) {
          logger.info(
            `Clicked element properties were rejected by filter function: ${JSON.stringify(
              this.properties,
              null,
              2,
            )}`,
          );
        }
        props = {};
      }
    },
    applyOptionsFilter(filter) {
      const opts = this.options;
      if (opts && opts.clickedElement && (opts.xdm || opts.data)) {
        // Properties are rejected if filter is explicitly false.
        if (filter && filter(opts) === false) {
          if (logger) {
            logger.info(
              `Clicked element properties were rejected by filter function: ${JSON.stringify(
                this.properties,
                null,
                2,
              )}`,
            );
          }
          this.options = undefined;
          return;
        }
        this.options = opts;
        // This is just to ensure that any fields outside clicked element properties
        // set by the user filter persists.
        props.filteredXdm = opts.xdm;
        props.filteredData = opts.data;
      }
    },
    get options() {
      const opts = {};
      if (this.isValidLink()) {
        opts.xdm = this.xdm;
      }
      if (this.isValidActivityMapData()) {
        opts.data = this.data;
      }
      if (this.clickedElement) {
        opts.clickedElement = this.clickedElement;
      }
      if (!opts.xdm && !opts.data) {
        return undefined;
      }
      return opts;
    },
    set options(value) {
      props = {};
      if (value) {
        populateClickedElementPropertiesFromOptions(value, props);
      }
    },
  };
  return clickedElementProperties;
};
