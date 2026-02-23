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

import copyToClipboard from "clipboard-copy";
import PropTypes from "prop-types";
import {
  Content,
  InlineAlert,
  View,
  Item,
  Text,
  Heading,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import SectionHeader from "../components/sectionHeader";
import CodeField from "../components/codeField";
import CodePreview from "../components/codePreview";
import prehidingSnippet from "./constants/prehidingSnippet";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import FormElementContainer from "../components/formElementContainer";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";

export const bridge = {
  getInstanceDefaults: () => ({
    prehidingStyle: "",
    targetMigrationEnabled: false,
    personalizationStorageEnabled: false,
    autoCollectPropositionInteractionsAJO: "always",
    autoCollectPropositionInteractionsTGT: "never",
  }),
  getInitialInstanceValues: ({ instanceSettings }) => {
    const instanceValues = {};

    if (instanceSettings.autoCollectPropositionInteractions?.AJO) {
      instanceSettings.autoCollectPropositionInteractionsAJO =
        instanceSettings.autoCollectPropositionInteractions.AJO;
    }
    if (instanceSettings.autoCollectPropositionInteractions?.TGT) {
      instanceSettings.autoCollectPropositionInteractionsTGT =
        instanceSettings.autoCollectPropositionInteractions.TGT;
    }

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: instanceSettings,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: [
        "prehidingStyle",
        "targetMigrationEnabled",
        "personalizationStorageEnabled",
        "autoCollectPropositionInteractionsAJO",
        "autoCollectPropositionInteractionsTGT",
      ],
    });

    return instanceValues;
  },
  getInstanceSettings: ({ instanceValues, components }) => {
    const instanceSettings = {};
    if (components.personalization) {
      copyPropertiesIfValueDifferentThanDefault({
        toObj: instanceSettings,
        fromObj: instanceValues,
        defaultsObj: bridge.getInstanceDefaults(),
        keys: [
          "prehidingStyle",
          "targetMigrationEnabled",
          "personalizationStorageEnabled",
          "autoCollectPropositionInteractionsAJO",
          "autoCollectPropositionInteractionsTGT",
        ],
      });

      const autoCollectPropositionInteractions = {};
      if (instanceSettings.autoCollectPropositionInteractionsAJO) {
        autoCollectPropositionInteractions.AJO =
          instanceSettings.autoCollectPropositionInteractionsAJO;
        delete instanceSettings.autoCollectPropositionInteractionsAJO;
      }
      if (instanceSettings.autoCollectPropositionInteractionsTGT) {
        autoCollectPropositionInteractions.TGT =
          instanceSettings.autoCollectPropositionInteractionsTGT;
        delete instanceSettings.autoCollectPropositionInteractionsTGT;
      }
      if (Object.keys(autoCollectPropositionInteractions).length > 0) {
        instanceSettings.autoCollectPropositionInteractions =
          autoCollectPropositionInteractions;
      }

      if (!components.rulesEngine) {
        delete instanceSettings.personalizationStorageEnabled;
      }
    }
    return instanceSettings;
  },
};

const ClickCollectionPicker = (props) => {
  return (
    <FormikPicker {...props}>
      <Item textValue="Always" key="always">
        <Text>Always</Text>
        <Text slot="description">
          Collect all interactions with propositions.
        </Text>
      </Item>
      <Item textValue="Decorated elements only" key="decoratedElementsOnly">
        <Text>Decorated elements only</Text>
        <Text slot="description">
          Only collect interactions on elements with data-aep-click-label or
          data-aep-click-token attributes.
        </Text>
      </Item>
      <Item textValue="Never" key="never">
        <Text>Never</Text>
        <Text slot="description">
          Do not collect interactions with propositions.
        </Text>
      </Item>
    </FormikPicker>
  );
};

const PersonalizationSection = ({ instanceFieldName }) => {
  const [{ value: personalizationComponentEnabled }] = useField(
    "components.personalization",
  );
  const [{ value: rulesEngineEnabled }] = useField("components.rulesEngine");

  return (
    <>
      <SectionHeader learnMoreUrl="https://adobe.ly/3fYDkfh">
        Personalization
      </SectionHeader>
      {personalizationComponentEnabled ? (
        <FormElementContainer>
          <FormikCheckbox
            data-test-id="targetMigrationEnabledField"
            name={`${instanceFieldName}.targetMigrationEnabled`}
            description="Use this option to enable the Web SDK to read and write the legacy
            mbox and mboxEdgeCluster cookies that are used by at.js 1.x or 2.x libraries. This helps you keep the visitor profile while moving from a page that uses the Web SDK to a page that uses the at.js 1.x or 2.x libraries and vice-versa."
            width="size-5000"
          >
            Migrate Target from at.js to the Web SDK
          </FormikCheckbox>
          <CodeField
            data-test-id="prehidingStyleEditButton"
            label="Prehiding style"
            buttonLabelSuffix="prehiding style"
            name={`${instanceFieldName}.prehidingStyle`}
            description="A CSS style definition that will be used to hide content areas of your web page while personalized content is being loaded from the server."
            language="css"
            placeholder={
              "/*\nHide elements as necessary. For example:\n#container { opacity: 0 !important }\n*/"
            }
          />
          <CodePreview
            data-test-id="copyToClipboardPrehidingSnippetButton"
            value={prehidingSnippet}
            label="Prehiding snippet"
            buttonLabel="Copy prehiding snippet to clipboard"
            description="To avoid flicker from occurring while the Launch library is being loaded, place this prehiding snippet within the <head> tag of your HTML page."
            onPress={() => {
              copyToClipboard(prehidingSnippet);
            }}
          />
          {rulesEngineEnabled ? (
            <FormikCheckbox
              data-test-id="personalizationStorageEnabledField"
              name={`${instanceFieldName}.personalizationStorageEnabled`}
              description="Use this option to store personalization events in the browser's local storage. This allows the Web SDK to keep track of which experiences have been seen by the user across page loads."
              width="size-5000"
            >
              Enable personalization storage
            </FormikCheckbox>
          ) : (
            <View width="size-6000">
              <InlineAlert variant="info">
                <Heading>Rules engine component disabled</Heading>
                <Content>
                  The rules engine custom build component is disabled. Enable it
                  above to configure personalization storage settings.
                </Content>
              </InlineAlert>
            </View>
          )}
          <ClickCollectionPicker
            data-test-id="autoCollectPropositionInteractionsAJOPicker"
            label="Auto click collection for Adobe Journey Optimizer"
            name={`${instanceFieldName}.autoCollectPropositionInteractionsAJO`}
            width="size-5000"
            description="This setting determines when the Web SDK should automatically collect clicks on content returned from Adobe Journey Optimizer."
          />
          <ClickCollectionPicker
            data-test-id="autoCollectPropositionInteractionsTGTPicker"
            label="Auto click collection for Adobe Target"
            name={`${instanceFieldName}.autoCollectPropositionInteractionsTGT`}
            width="size-5000"
            description="This setting determines when the Web SDK should automatically collect clicks on content returned from Adobe Target."
          />
        </FormElementContainer>
      ) : (
        <View width="size-6000">
          <InlineAlert variant="info">
            <Heading>Personalization component disabled</Heading>
            <Content>
              The personalization custom build component is disabled. Enable it
              above to configure personalization settings.
            </Content>
          </InlineAlert>
        </View>
      )}
    </>
  );
};

PersonalizationSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default PersonalizationSection;
