/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import spectrum from "./spectrum.mjs";
import overrideWrappers from "./overrideViewSelectors.mjs";

export const addInstanceButton = spectrum.button("addInstanceButton");
export const instancesTabs = spectrum.tabs();
export const resourceUsageDialog = {
  cancelDeleteInstanceButton: spectrum.button("cancelDeleteInstanceButton"),
  confirmDeleteInstanceButton: spectrum.button("confirmDeleteInstanceButton"),
};

export const buildOptions = {
  heading: spectrum.button("buildOptionsHeading"),
  pushNotifications: spectrum.checkbox("pushNotificationsComponentCheckbox"),
};

const instances = [];

for (let i = 0; i < 3; i += 1) {
  instances.push({
    nameField: spectrum.textField("nameField"),
    nameChangeAlert: spectrum.alert("nameChangeAlert"),
    edgeConfig: {
      inputMethodSelectRadio: spectrum.radio(
        "edgeConfigInputMethodSelectRadio",
      ),
      inputMethodFreeformRadio: spectrum.radio(
        "edgeConfigInputMethodFreeformRadio",
      ),
      inputMethodSelect: {
        fetchConfigsAlert: spectrum.alert("alertErrorFetchingConfigs"),
        production: {
          datastreamField: spectrum.picker("productionDatastreamField"),
          sandboxField: spectrum.picker("productionSandboxField"),
          datastreamDisabledField: spectrum.textField(
            "datastreamDisabledFieldproduction",
          ),
          datastreamErrorFetchingAlert: spectrum.alert(
            "productionErrorFetchingDatastreamsAlert",
          ),
        },
        staging: {
          datastreamField: spectrum.picker("stagingDatastreamField"),
          sandboxField: spectrum.picker("stagingSandboxField"),
        },
        development: {
          datastreamField: spectrum.picker("developmentDatastreamField"),
          sandboxField: spectrum.picker("developmentSandboxField"),
        },
      },
      inputMethodFreeform: {
        productionEnvironmentField: spectrum.textField(
          "productionEnvironmentTextfield",
        ),
        stagingEnvironmentField: spectrum.textField(
          "stagingEnvironmentTextfield",
        ),
        developmentEnvironmentField: spectrum.textField(
          "developmentEnvironmentTextfield",
        ),
      },
    },
    edgeConfigInputMethodSelectFields: {
      edgeConfigComboBox: spectrum.comboBox("edgeConfigComboBox"),
      productionEnvironmentComboBox: spectrum.comboBox(
        "productionEnvironmentComboBox",
      ),
      stagingEnvironmentComboBox: spectrum.comboBox(
        "stagingEnvironmentComboBox",
      ),
      developmentEnvironmentComboBox: spectrum.comboBox(
        "developmentEnvironmentComboBox",
      ),
    },
    edgeConfigInputMethodFreeformFields: {
      productionEnvironmentTextfield: spectrum.textField(
        "productionEnvironmentTextfield",
      ),
      stagingEnvironmentTextfield: spectrum.textField(
        "stagingEnvironmentTextfield",
      ),
      developmentEnvironmentTextfield: spectrum.textField(
        "developmentEnvironmentTextfield",
      ),
    },
    orgIdField: spectrum.textField("orgIdField"),
    orgIdRestoreButton: spectrum.button("orgIdRestoreButton"),
    edgeDomainField: spectrum.textField("edgeDomainField"),
    edgeDomainRestoreButton: spectrum.button("edgeDomainRestoreButton"),
    edgeBasePathField: spectrum.textField("edgeBasePathField"),
    edgeBasePathRestoreButton: spectrum.button("edgeBasePathRestoreButton"),
    defaultConsent: {
      inRadio: spectrum.radio("defaultConsentInRadio"),
      outRadio: spectrum.radio("defaultConsentOutRadio"),
      pendingRadio: spectrum.radio("defaultConsentPendingRadio"),
      dataElementRadio: spectrum.radio("defaultConsentDataElementRadio"),
      dataElementField: spectrum.textField("defaultConsentDataElementField"),
    },
    idMigrationEnabled: spectrum.checkbox("idMigrationEnabledField"),
    thirdPartyCookiesEnabled: spectrum.comboBox(
      "thirdPartyCookiesEnabledField",
    ),
    // Due to limitations of the sandbox where tests are run,
    // testing prehiding style viewing/editing is limited.
    prehidingStyleEditButton: spectrum.button("prehidingStyleEditButton"),
    targetMigrationEnabled: spectrum.checkbox("targetMigrationEnabledField"),
    internalLinkEnabledField: spectrum.checkbox("internalLinkEnabledField"),
    eventGrouping: {
      noneField: spectrum.radio("eventGroupingNoneField"),
      sessionStorageField: spectrum.radio("eventGroupingSessionStorageField"),
      memoryField: spectrum.radio("eventGroupingMemoryField"),
    },
    externalLinkEnabledField: spectrum.checkbox("externalLinkEnabledField"),
    downloadLinkEnabledField: spectrum.checkbox("downloadLinkEnabledField"),
    autoCollectPropositionInteractionsAJOPicker: spectrum.picker(
      "autoCollectPropositionInteractionsAJOPicker",
    ),
    autoCollectPropositionInteractionsTGTPicker: spectrum.picker(
      "autoCollectPropositionInteractionsTGTPicker",
    ),
    downloadLinkQualifierField: spectrum.textField(
      "downloadLinkQualifierField",
    ),
    downloadLinkQualifierRestoreButton: spectrum.button(
      "downloadLinkQualifierRestoreButton",
    ),
    downloadLinkQualifierTestButton: spectrum.button(
      "downloadLinkQualifierTestButton",
    ),
    onBeforeEventSendEditButton: spectrum.button("onBeforeEventSendEditButton"),
    filterClickDetailsEditButton: spectrum.button(
      "filterClickDetailsEditButton",
    ),
    onBeforeLinkClickSendEditButton: spectrum.button(
      "onBeforeLinkClickSendEditButton",
    ),
    contextGranularity: {
      allField: spectrum.radio("contextGranularityAllField"),
      specificField: spectrum.radio("contextGranularitySpecificField"),
    },
    specificContext: {
      webField: spectrum.checkbox("contextWebField"),
      deviceField: spectrum.checkbox("contextDeviceField"),
      environmentField: spectrum.checkbox("contextEnvironmentField"),
      placeContextField: spectrum.checkbox("contextPlaceContextField"),
      highEntropyUserAgentHintsContextField: spectrum.checkbox(
        "contextHighEntropyUserAgentHintsField",
      ),
    },
    deleteButton: spectrum.button("deleteInstanceButton"),
    overrides: overrideWrappers,
    streamingMedia: {
      mediaChannelField: spectrum.textField("mediaChannelField"),
      mediaPlayerNameField: spectrum.textField("mediaPlayerNameField"),
      mediaVersionField: spectrum.textField("mediaVersionField"),
      mediaMainPingIntervalField: spectrum.textField(
        "mediaMainPingIntervalField",
      ),
      mediaAdPingIntervalField: spectrum.textField("mediaAdPingIntervalField"),
    },
    pushNotifications: {
      vapidPublicKeyField: spectrum.textField("vapidPublicKeyField"),
      appIdField: spectrum.textField("appIdField"),
      trackingDatasetIdField: spectrum.textField("trackingDatasetIdField"),
    },
    advertising: {
      dspEnabledField: spectrum.comboBox("dspEnabledField"),
      addAdvertiserButton: spectrum.button("addAdvertiserButton"),
      advertiser0Field: spectrum.comboBox("advertiser0Field"),
      advertiser1Field: spectrum.comboBox("advertiser1Field"),
      advertiser2Field: spectrum.comboBox("advertiser2Field"),
      advertiserEnabled0Field: spectrum.comboBox("advertiserEnabled0Field"),
      advertiserEnabled1Field: spectrum.comboBox("advertiserEnabled1Field"),
      advertiserEnabled2Field: spectrum.comboBox("advertiserEnabled2Field"),
      deleteAdvertiser0Button: spectrum.button("deleteAdvertiser0Button"),
      deleteAdvertiser1Button: spectrum.button("deleteAdvertiser1Button"),
      deleteAdvertiser2Button: spectrum.button("deleteAdvertiser2Button"),
      id5PartnerIdField: spectrum.textField("id5PartnerIdField"),
      rampIdJSPathField: spectrum.textField("rampIdJSPathField"),
    },
  });
}

export { instances };
