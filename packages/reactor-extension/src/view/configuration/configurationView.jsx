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

import { useState, useRef } from "react";
import { object, array, string } from "yup";
import { FieldArray, useField } from "formik";
import {
  Button,
  ButtonGroup,
  Content,
  DialogContainer,
  Dialog,
  Flex,
  Heading as HeadingSlot,
  Item,
  Divider,
  Text,
  TabList,
  TabPanels,
  Tabs,
  View,
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
  Radio,
  Heading,
  InlineAlert,
} from "@adobe/react-spectrum";
import DeleteIcon from "@spectrum-icons/workflow/Delete";
import PropTypes from "prop-types";
import ExtensionView from "../components/extensionView";
import useNewlyValidatedFormSubmission from "../utils/useNewlyValidatedFormSubmission";
import useFocusFirstError from "../utils/useFocusFirstError";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import BasicSection, { bridge as basicSectionBridge } from "./basicSection";
import EdgeConfigurationsSection, {
  bridge as edgeConfigurationsSectionBridge,
} from "./edgeConfigurationsSection";
import PrivacySection, {
  bridge as privacySectionBridge,
} from "./privacySection";
import IdentitySection, {
  bridge as identitySectionBridge,
} from "./identitySection";
import AdvertisingSection, {
  bridge as advertisingSectionBridge,
} from "./advertisingSection";
import PersonalizationSection, {
  bridge as personalizationSectionBridge,
} from "./personalizationSection";
import DataCollectionSection, {
  bridge as dataCollectionSectionBridge,
} from "./dataCollectionSection";
import OverridesSection, {
  bridge as overridesBridge,
} from "../components/overrides";
import AdvancedSection, {
  bridge as advancedSectionBridge,
} from "./advancedSection";
import getEdgeConfigIds from "../utils/getEdgeConfigIds";
import { FIELD_NAMES } from "../components/overrides/utils";
import StreamingMediaSection, {
  bridge as mediaBridge,
} from "./streamingMediaSection";
import ComponentsSection, {
  bridge as componentsBridge,
} from "./componentsSection";
import PushNotificationsSection, {
  bridge as pushNotificationsBridge,
} from "./pushNotificationsSection";
import BrandConciergeSection, {
  bridge as brandConciergeBridge,
} from "./brandConciergeSection";
import {
  LIBRARY_TYPE_MANAGED,
  LIBRARY_TYPE_PREINSTALLED,
} from "../constants/libraryType";
import {
  createNameValidation,
  createUniqueNameTest,
} from "./basicSectionBridge";

const sectionBridges = [
  basicSectionBridge,
  edgeConfigurationsSectionBridge,
  privacySectionBridge,
  identitySectionBridge,
  advertisingSectionBridge,
  personalizationSectionBridge,
  dataCollectionSectionBridge,
  overridesBridge,
  advancedSectionBridge,
  mediaBridge,
  pushNotificationsBridge,
  brandConciergeBridge,
];

/**
 * Produces a function that, when called, calls the method from
 * all section bridges and merges the result into a single object.
 */
const getMergedBridgeMethod = (methodName) => {
  return async (params) => {
    const bridgeMethodResults = await Promise.all(
      sectionBridges.map((bridge) => {
        return bridge[methodName] ? bridge[methodName](params) : {};
      }),
    );
    return Object.assign(...bridgeMethodResults);
  };
};

const getInstanceDefaults = getMergedBridgeMethod("getInstanceDefaults");
const getInitialInstanceValues = getMergedBridgeMethod(
  "getInitialInstanceValues",
);
const getInstanceSettings = getMergedBridgeMethod("getInstanceSettings");

/**
 * Creates the validation schema based on library type
 */
const createValidationSchema = () => {
  // Create full validation schema by merging all bridge schemas
  const fullInstanceSchema = sectionBridges.reduce((instanceSchema, bridge) => {
    return bridge.instanceValidationSchema
      ? instanceSchema.concat(bridge.instanceValidationSchema)
      : instanceSchema;
  }, object());

  // Create minimal schema for preinstalled mode (only name validation)
  const preinstalledInstanceSchema = object()
    .shape({
      name: createNameValidation(),
    })
    .test(createUniqueNameTest());

  return object().shape({
    libraryCode: object().shape({
      type: string().required(),
    }),
    instances: array().of(
      object().when("$libraryCode.type", {
        is: LIBRARY_TYPE_PREINSTALLED,
        then: () => preinstalledInstanceSchema,
        otherwise: () => fullInstanceSchema,
      }),
    ),
  });
};

const getInitialValues = async ({ initInfo, context }) => {
  const { instances: instancesSettings } = initInfo.settings || {};

  let instancesInitialValues;

  if (instancesSettings) {
    instancesInitialValues = await Promise.all(
      instancesSettings.map((instanceSettings, instanceSettingsIndex) => {
        return getInitialInstanceValues({
          initInfo,
          isFirstInstance: instanceSettingsIndex === 0,
          instanceSettings,
          context,
        });
      }),
    );
  } else {
    instancesInitialValues = [
      await getInstanceDefaults({ initInfo, isFirstInstance: true, context }),
    ];
  }

  return {
    ...componentsBridge.getInitialValues({ initInfo }),
    instances: instancesInitialValues,
    libraryCode: initInfo.settings?.libraryCode || {
      type: LIBRARY_TYPE_MANAGED,
    },
  };
};

const getSettings = async ({ values, initInfo }) => {
  const isPreinstalled = values.libraryCode?.type === LIBRARY_TYPE_PREINSTALLED;

  return {
    // Don't emit components when preinstalled
    ...(isPreinstalled
      ? { libraryCode: values.libraryCode }
      : componentsBridge.getSettings({ values, initInfo })),
    instances: await Promise.all(
      values.instances.map((instanceValues) => {
        // For preinstalled mode, only save the instance name
        if (isPreinstalled) {
          return { name: instanceValues.name };
        }

        return getInstanceSettings({
          initInfo,
          instanceValues,
          components: values.components,
        });
      }),
    ),
  };
};

const InstancesSection = ({ initInfo, context, isPreinstalled }) => {
  const [{ value: instances }] = useField("instances");
  const [selectedTabKey, setSelectedTabKey] = useState("0");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState(null);

  useNewlyValidatedFormSubmission((errors) => {
    // If the user just tried to save the configuration and there's
    // a validation error, make sure the first accordion item containing
    // an error is shown.
    if (errors && errors.instances) {
      const instanceIndexContainingErrors = errors.instances.findIndex(
        (instance) => instance,
      );
      setSelectedTabKey(String(instanceIndexContainingErrors));
    }
  });

  // Focus the first field with an error after validation
  useFocusFirstError();

  return (
    <Flex direction="column" gap="size-50">
      <FieldArray
        name="instances"
        render={(arrayHelpers) => {
          return (
            <div>
              <Flex alignItems="center">
                <Button
                  data-test-id="addInstanceButton"
                  variant="secondary"
                  onPress={async () => {
                    const newInstance = await getInstanceDefaults({
                      initInfo,
                      isFirstInstance: false,
                      context,
                      existingInstances: instances,
                    });
                    arrayHelpers.push(newInstance);
                    setSelectedTabKey(String(instances.length));
                  }}
                  position="absolute"
                  top="12px"
                  right="16px"
                >
                  Add instance
                </Button>
              </Flex>
              <Tabs
                aria-label="SDK instances"
                items={instances}
                selectedKey={selectedTabKey}
                onSelectionChange={setSelectedTabKey}
              >
                <TabList marginBottom="size-200">
                  {instances.map((instance, index) => {
                    return (
                      <Item key={index}>
                        {instance.name || "Unnamed instance"}
                      </Item>
                    );
                  })}
                </TabList>
                <TabPanels>
                  {instances.map((instance, index) => {
                    const instanceFieldName = `instances.${index}`;
                    const edgeConfigIds = getEdgeConfigIds(instance);
                    return (
                      <Item key={index}>
                        <BasicSection
                          instanceFieldName={instanceFieldName}
                          initInfo={initInfo}
                          isPreinstalled={isPreinstalled}
                        />
                        {!isPreinstalled && (
                          <>
                            <EdgeConfigurationsSection
                              instanceFieldName={instanceFieldName}
                              instanceIndex={index}
                              initInfo={initInfo}
                              context={context}
                            />
                            <PrivacySection
                              instanceFieldName={instanceFieldName}
                            />
                            <IdentitySection
                              instanceFieldName={instanceFieldName}
                            />
                            <PersonalizationSection
                              instanceFieldName={instanceFieldName}
                            />
                            <DataCollectionSection
                              instanceFieldName={instanceFieldName}
                            />
                            <StreamingMediaSection
                              instanceFieldName={instanceFieldName}
                            />
                            <PushNotificationsSection
                              instanceFieldName={instanceFieldName}
                            />
                            <BrandConciergeSection
                              instanceFieldName={instanceFieldName}
                            />
                            <AdvertisingSection
                              instanceFieldName={instanceFieldName}
                              initInfo={initInfo}
                            />
                            <OverridesSection
                              initInfo={initInfo}
                              instanceFieldName={instanceFieldName}
                              edgeConfigIds={edgeConfigIds}
                              configOrgId={instance.orgId}
                              hideFields={[FIELD_NAMES.datastreamId]}
                            />
                            <AdvancedSection
                              instanceFieldName={instanceFieldName}
                            />
                          </>
                        )}
                        {instances.length > 1 && (
                          <View marginTop="size-300">
                            <Button
                              data-test-id="deleteInstanceButton"
                              icon={<DeleteIcon />}
                              variant="secondary"
                              disabled={instances.length === 1}
                              onPress={() => {
                                setInstanceToDelete(index);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete instance
                            </Button>
                          </View>
                        )}{" "}
                      </Item>
                    );
                  })}
                </TabPanels>
              </Tabs>
              <DialogContainer
                onDismiss={() => {
                  setDeleteDialogOpen(false);
                  setInstanceToDelete(null);
                }}
              >
                {deleteDialogOpen && (
                  <Dialog data-test-id="resourceUsageDialog">
                    <HeadingSlot>Resource Usage</HeadingSlot>
                    <Divider />
                    <Content>
                      <Text>
                        Any rule components or data elements using this instance
                        will no longer function as expected when running on your
                        website. We recommend removing these resources or
                        switching them to use a different instance before
                        publishing your next library. Would you like to proceed?
                      </Text>
                    </Content>
                    <ButtonGroup>
                      <Button
                        data-test-id="cancelDeleteInstanceButton"
                        variant="secondary"
                        onPress={() => {
                          setDeleteDialogOpen(false);
                          setInstanceToDelete(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        data-test-id="confirmDeleteInstanceButton"
                        variant="cta"
                        onPress={() => {
                          arrayHelpers.remove(instanceToDelete);
                          setSelectedTabKey(
                            String(
                              instanceToDelete > 0 ? instanceToDelete - 1 : 0,
                            ),
                          );
                          setDeleteDialogOpen(false);
                          setInstanceToDelete(null);
                        }}
                        autoFocus
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  </Dialog>
                )}
              </DialogContainer>{" "}
            </div>
          );
        }}
      />
    </Flex>
  );
};

InstancesSection.propTypes = {
  initInfo: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
  isPreinstalled: PropTypes.bool.isRequired,
};

const Configuration = ({ initInfo, context }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set(["instances"]));
  const [{ value: libraryCode }] = useField("libraryCode");

  useNewlyValidatedFormSubmission((errors) => {
    if (errors) {
      const alreadyOpenOrErrorKeys = ["buildOptions", "instances"].filter(
        (key) => {
          return !!errors[key] || expandedKeys.has(key);
        },
      );
      setExpandedKeys(new Set(alreadyOpenOrErrorKeys));
    }
  });

  // Focus the first field with an error after validation
  useFocusFirstError();
  const isPreinstalled = libraryCode?.type === LIBRARY_TYPE_PREINSTALLED;

  return (
    <Flex direction="column" gap="size-200">
      <Accordion
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}
        allowsMultipleExpanded
      >
        <Disclosure id="buildOptions" data-test-id="buildOptionsHeading">
          <DisclosureTitle>Build options</DisclosureTitle>
          <DisclosurePanel>
            <Flex direction="column" gap="size-200">
              <InlineAlert variant="notice" width="size-6000">
                <Heading>Warning, advanced settings</Heading>
                <Content>
                  Modifying settings here can break your implementation. You can
                  decrease the size of your Web SDK bundle by disabling
                  components that you are not using. Each time you change the
                  list of used components, please test your implementation
                  thoroughly to verify that all functionalities are working as
                  expected.
                </Content>
              </InlineAlert>

              <FormikRadioGroup
                width="size-6000"
                data-test-id="libraryCodeField"
                name="libraryCode.type"
                label="Library management"
                description="Select whether Launch should bundle and manage the Alloy library, or use your own self-hosted alloy.js file that is already loaded on your page."
                orientation="horizontal"
              >
                <Radio value={LIBRARY_TYPE_MANAGED}>
                  Managed by Adobe Tags
                </Radio>
                <Radio value={LIBRARY_TYPE_PREINSTALLED}>
                  Use a self-hosted alloy.js instance
                </Radio>
              </FormikRadioGroup>
              {!isPreinstalled && <ComponentsSection />}
            </Flex>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="instances" data-test-id="instancesHeading">
          <DisclosureTitle>SDK instances</DisclosureTitle>
          <DisclosurePanel>
            <InstancesSection
              initInfo={initInfo}
              context={context}
              isPreinstalled={isPreinstalled}
            />
          </DisclosurePanel>
        </Disclosure>
      </Accordion>
    </Flex>
  );
};

Configuration.propTypes = {
  initInfo: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
};

const ConfigurationView = () => {
  const context = useRef();

  return (
    <ExtensionView
      getInitialValues={({ initInfo }) =>
        getInitialValues({ initInfo, context })
      }
      getSettings={getSettings}
      formikStateValidationSchema={createValidationSchema()}
      render={({ initInfo }) => {
        return <Configuration initInfo={initInfo} context={context} />;
      }}
    />
  );
};

export default ConfigurationView;
