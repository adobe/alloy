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

import { InlineAlert, Heading, Content } from "@adobe/react-spectrum";
import render from "../render";
import ExtensionView from "../components/extensionView";
import FillParentAndCenterChildren from "../components/fillParentAndCenterChildren";
import Body from "../components/typography/body";
import RequiredComponent from "../components/requiredComponent";
import { LIBRARY_TYPE_PREINSTALLED } from "../constants/libraryType";

const getInitialValues = ({ initInfo }) => {
  const { cacheId = crypto.randomUUID() } = initInfo.settings || {};

  return {
    cacheId,
  };
};

const getSettings = ({ values }) => {
  return values;
};
let initInfoCache;

const EventMergeId = () => (
  <ExtensionView
    getInitialValues={getInitialValues}
    getSettings={getSettings}
    validateNonFormikState={() => {
      const isNew = initInfoCache?.settings == null;
      if (
        isNew &&
        (initInfoCache?.extensionSettings?.libraryCode?.type ===
          LIBRARY_TYPE_PREINSTALLED ||
          initInfoCache?.extensionSettings?.components?.eventMerge === false)
      ) {
        return false;
      }

      return true;
    }}
    render={({ initInfo }) => {
      initInfoCache = initInfo;
      const isPreinstalled =
        initInfo?.extensionSettings?.libraryCode?.type ===
        LIBRARY_TYPE_PREINSTALLED;

      return isPreinstalled ? (
        <FillParentAndCenterChildren>
          <InlineAlert variant="negative" width="size-6000">
            <Heading>
              Not available when using a self-hosted Alloy instance
            </Heading>
            <Content>
              Event merge data elements will not function correctly when using a
              self-hosted Alloy instance. To use this component, go to the
              extension configuration view and select the &quot;Managed by
              Launch&quot; option in the Build Options section.
            </Content>
          </InlineAlert>
        </FillParentAndCenterChildren>
      ) : (
        <RequiredComponent
          initInfo={initInfo}
          requiredComponent="eventMerge"
          title="the event merge ID data element"
          whole
        >
          <FillParentAndCenterChildren>
            <InlineAlert variant="info" width="size-6000">
              <Heading size="XXS">Event merge ID caching</Heading>
              <Content>
                This data element will provide an event merge ID. Regardless of
                what you choose for the data element storage duration in Launch,
                the value of this data element will remain the same until either
                the visitor to your website leaves the current page or the event
                merge ID is reset using the <b>Reset event merge ID</b> action.
              </Content>
            </InlineAlert>
            <Body size="L" marginTop="size-200">
              No configuration necessary.
            </Body>
          </FillParentAndCenterChildren>
        </RequiredComponent>
      );
    }}
  />
);

EventMergeId.propTypes = {};

render(EventMergeId);
