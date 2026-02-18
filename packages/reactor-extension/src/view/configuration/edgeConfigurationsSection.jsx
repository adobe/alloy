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

import PropTypes from "prop-types";
import { Radio, Link, Content } from "@adobe/react-spectrum";
import { object, string } from "yup";
import { useField } from "formik";
import SectionHeader from "../components/sectionHeader";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import EdgeConfigurationSelectInputMethod from "./edgeConfigurationSelectInputMethod";
import FormElementContainer from "../components/formElementContainer";
import fetchSandboxes from "../utils/fetchSandboxes";
import EdgeConfigurationFreeformInputMethod from "./edgeConfigurationFreeformInputMethod";
import fetchConfig from "./utils/fetchConfig";
import fetchConfigs from "./utils/fetchConfigs";
import getPartsFromEnvironmentCompositeId from "./utils/getPartsFromEnvironmentCompositeId";
import { useFieldValue } from "../utils/useFieldValue";

const INPUT_METHOD = {
  SELECT: "select",
  FREEFORM: "freeform",
};
const NOT_FOUND_STATUS = "not_found";

const sandboxSettingsExist = (instanceSettings) => {
  return !!(
    instanceSettings.sandbox ||
    instanceSettings.stagingSandbox ||
    instanceSettings.developmentSandbox
  );
};

const getSelectInputMethodStateNewInstance = () => {
  return {
    productionEnvironment: {
      datastreamId: "",
      sandbox: "",
    },
    stagingEnvironment: {
      datastreamId: "",
      sandbox: "",
    },
    developmentEnvironment: {
      datastreamId: "",
      sandbox: "",
    },
  };
};

const prepareDatastreamsMap = (datastreams) => {
  return datastreams.reduce((acc, datastream) => {
    // eslint-disable-next-line no-underscore-dangle
    const datastreamId = datastream._system.id;
    acc[datastreamId] = {
      sandbox: datastream.sandboxName,
      configId: datastreamId,
    };
    return acc;
  }, {});
};

const createFindTheEdgeConfig = (orgId, imsAccess) => {
  return (sandbox, edgeConfigId) => {
    return fetchConfig({
      orgId,
      imsAccess,
      edgeConfigId,
      sandbox,
    }).catch(() => {
      return {
        status: NOT_FOUND_STATUS,
      };
    });
  };
};

const getEnvironmentEdgeConfigs = (
  configId,
  datastreamsMap,
  parsedConfigId,
) => {
  return new Promise((resolve, reject) => {
    if (datastreamsMap[configId]) {
      resolve({
        datastreamId: configId,
        sandbox: datastreamsMap[configId].sandbox,
      });
      return;
    }
    if (datastreamsMap[parsedConfigId]) {
      resolve({
        datastreamId: configId,
        sandbox: datastreamsMap[parsedConfigId].sandbox,
      });
      return;
    }

    reject(new Error("no datastream was found"));
  });
};

const getSelectInputMethodStateFromExistingExtensionSettings = (
  instanceSettings,
  sandboxes,
) => {
  const selectInputMethodState = getSelectInputMethodStateNewInstance();
  // if default sandbox only we pre-populate the environments sandboxes to have the form render correctly
  if (sandboxes.length === 1) {
    selectInputMethodState.productionEnvironment.sandbox = sandboxes[0].name;
    selectInputMethodState.stagingEnvironment.sandbox = sandboxes[0].name;
    selectInputMethodState.developmentEnvironment.sandbox = sandboxes[0].name;
  }

  if (instanceSettings.edgeConfigId) {
    selectInputMethodState.productionEnvironment.datastreamId =
      instanceSettings.edgeConfigId;
    selectInputMethodState.productionEnvironment.sandbox =
      instanceSettings.sandbox;
  }

  if (instanceSettings.stagingEdgeConfigId) {
    selectInputMethodState.stagingEnvironment.datastreamId =
      instanceSettings.stagingEdgeConfigId;
    selectInputMethodState.stagingEnvironment.sandbox =
      instanceSettings.stagingSandbox;
  }

  if (instanceSettings.developmentEdgeConfigId) {
    selectInputMethodState.developmentEnvironment.datastreamId =
      instanceSettings.developmentEdgeConfigId;
    selectInputMethodState.developmentEnvironment.sandbox =
      instanceSettings.developmentSandbox;
  }

  return selectInputMethodState;
};

const getSelectInputMethodStateForNotFullyPopulatedForDefaultSandbox = (
  context,
  instanceSettings,
) => {
  const { sandboxes, datastreams } = context;
  const datastreamsMap = prepareDatastreamsMap(datastreams);
  const selectInputMethodState = getSelectInputMethodStateNewInstance();
  const defaultSandbox = sandboxes[0];

  if (instanceSettings.edgeConfigId) {
    selectInputMethodState.productionEnvironment.datastreamId =
      datastreamsMap[instanceSettings.edgeConfigId].configId;
  }

  if (instanceSettings.stagingEdgeConfigId) {
    selectInputMethodState.stagingEnvironment.datastreamId =
      datastreamsMap[instanceSettings.stagingEdgeConfigId].configId;
  }

  if (instanceSettings.developmentEdgeConfigId) {
    selectInputMethodState.developmentEnvironment.datastreamId =
      datastreamsMap[instanceSettings.developmentEdgeConfigId].configId;
  }

  selectInputMethodState.productionEnvironment.sandbox = defaultSandbox.name;
  selectInputMethodState.stagingEnvironment.sandbox = defaultSandbox.name;
  selectInputMethodState.developmentEnvironment.sandbox = defaultSandbox.name;
  return selectInputMethodState;
};

const getSelectInputMethodStateForExistingInstance = async ({
  orgId,
  imsAccess,
  instanceSettings,
  context,
}) => {
  // if there are sandbox settings in the previously configured extension we just populate with values
  const { current } = context;
  const { sandboxes } = current;

  if (sandboxSettingsExist(instanceSettings)) {
    return getSelectInputMethodStateFromExistingExtensionSettings(
      instanceSettings,
      sandboxes,
    );
  }

  // this section is to fetch the edge configs and get the sandbox name for each environment
  // the old version of extension was fetching the datastreams and save
  // a composite datastream ID for each environment
  // we are trying to get the edge config and fetch the edge config details,
  // then we initialize the form with sandbox names and edge config IDs
  // when only one sandbox per org we fetch all datastreams in get Instance defaults
  //  we re-use it here to create a map and prepopulate the form with sandbox names
  if (sandboxes.length === 1) {
    return getSelectInputMethodStateForNotFullyPopulatedForDefaultSandbox(
      current,
      instanceSettings,
    );
  }
  const selectInputMethodState = getSelectInputMethodStateNewInstance();
  const parsedConfigIds = {
    productionEnvironment: undefined,
    stagingEnvironment: undefined,
    developmentEnvironment: undefined,
  };
  const findTheEdgeConfig = createFindTheEdgeConfig(orgId, imsAccess);
  // try to find the sandbox for each edge config to pre - populate the select dropdowns
  const promises = [];

  const { edgeConfigId } = getPartsFromEnvironmentCompositeId(
    instanceSettings.edgeConfigId,
  );
  parsedConfigIds.productionEnvironment = edgeConfigId;

  const findProdEdgeConfigPromises = sandboxes.map((sandbox) => {
    return findTheEdgeConfig(sandbox.name, edgeConfigId);
  });

  promises.push(...findProdEdgeConfigPromises);

  if (instanceSettings.stagingEdgeConfigId) {
    const stagingEdgeConfigId = getPartsFromEnvironmentCompositeId(
      instanceSettings.stagingEdgeConfigId,
    ).edgeConfigId;
    if (stagingEdgeConfigId === edgeConfigId) {
      parsedConfigIds.stagingEnvironment = stagingEdgeConfigId;
    } else {
      const findStageEdgeConfigPromises = sandboxes.map((sandbox) => {
        return findTheEdgeConfig(
          sandbox.name,
          instanceSettings.stagingEdgeConfigId,
        );
      });
      promises.push(...findStageEdgeConfigPromises);
    }
  }
  if (instanceSettings.developmentEdgeConfigId) {
    const developmentEdgeConfigId = getPartsFromEnvironmentCompositeId(
      instanceSettings.developmentEdgeConfigId,
    ).edgeConfigId;
    if (developmentEdgeConfigId === edgeConfigId) {
      parsedConfigIds.developmentEnvironment = developmentEdgeConfigId;
    } else {
      const findDevEdgeConfigPromises = sandboxes.map((sandbox) => {
        return findTheEdgeConfig(
          sandbox.name,
          instanceSettings.developmentEdgeConfigId,
        );
      });
      promises.push(...findDevEdgeConfigPromises);
    }
  }

  const edgeConfigs = (await Promise.all(promises)).filter(
    (result) => result.status !== NOT_FOUND_STATUS,
  );

  const datastreamsMap = prepareDatastreamsMap(edgeConfigs);

  if (instanceSettings.edgeConfigId) {
    selectInputMethodState.productionEnvironment =
      await getEnvironmentEdgeConfigs(
        instanceSettings.edgeConfigId,
        datastreamsMap,
        parsedConfigIds.productionEnvironment,
      );
  }
  if (instanceSettings.stagingEdgeConfigId) {
    selectInputMethodState.stagingEnvironment = await getEnvironmentEdgeConfigs(
      instanceSettings.stagingEdgeConfigId,
      datastreamsMap,
      parsedConfigIds.stagingEnvironment,
    );
  }
  if (instanceSettings.developmentEdgeConfigId) {
    selectInputMethodState.developmentEnvironment =
      await getEnvironmentEdgeConfigs(
        instanceSettings.developmentEdgeConfigId,
        datastreamsMap,
        parsedConfigIds.developmentEnvironment,
      );
  }
  return selectInputMethodState;
};

const getSelectInputMethodStateForNewInstance = async ({
  orgId,
  imsAccess,
  context,
}) => {
  const selectInputMethodState = getSelectInputMethodStateNewInstance();

  // We cache the first page of edge configs for optimization,
  // particularly so when a user clicks the Add Instance button,
  // they don't have to wait while the instance is created.
  // Cache is keyed by orgId to ensure fresh data when organization changes.
  const cacheKey = `cache_${orgId}`;
  if (!context.current[cacheKey]) {
    context.current[cacheKey] = {};
  }
  const cache = context.current[cacheKey];

  if (!cache.firstPageOfSandboxes) {
    try {
      ({ results: cache.firstPageOfSandboxes } = await fetchSandboxes({
        orgId,
        imsAccess,
      }));
    } catch {
      context.current.fetchSandboxError = true;
    }
  }

  context.current.sandboxes = cache.firstPageOfSandboxes;

  // when not enough permissions we might get empty array of sandboxes
  if (
    !cache.firstPageOfSandboxes ||
    (cache.firstPageOfSandboxes && cache.firstPageOfSandboxes.length === 0)
  ) {
    context.current.fetchSandboxError = true;
  }
  // checking if this is a organization with one sandbox ( default sandbox )
  if (cache.firstPageOfSandboxes && cache.firstPageOfSandboxes.length === 1) {
    if (!cache.firstPageOfDatastreams) {
      try {
        ({ results: cache.firstPageOfDatastreams } = await fetchConfigs({
          orgId,
          imsAccess,
          limit: 1000,
          sandbox: cache.firstPageOfSandboxes[0].name,
        }));
      } catch {
        context.current.fetchConfigsError = true;
      }
    }

    context.current.datastreams = cache.firstPageOfDatastreams;

    selectInputMethodState.productionEnvironment.sandbox =
      cache.firstPageOfSandboxes[0].name;
    selectInputMethodState.stagingEnvironment.sandbox =
      cache.firstPageOfSandboxes[0].name;
    selectInputMethodState.developmentEnvironment.sandbox =
      cache.firstPageOfSandboxes[0].name;
  }

  return selectInputMethodState;
};

const getFreeformInputMethodStateForExistingInstance = ({
  instanceSettings,
}) => {
  return {
    edgeConfigId: instanceSettings.edgeConfigId ?? "",
    stagingEdgeConfigId: instanceSettings.stagingEdgeConfigId ?? "",
    developmentEdgeConfigId: instanceSettings.developmentEdgeConfigId ?? "",
  };
};

const getFreeformInputStateForNewInstance = () => {
  return {
    edgeConfigId: "",
    stagingEdgeConfigId: "",
    developmentEdgeConfigId: "",
  };
};

export const bridge = {
  getInstanceDefaults: async ({ initInfo, isFirstInstance, context }) => {
    const {
      company: { orgId },
      tokens: { imsAccess },
    } = initInfo;

    // Preserve sandbox cache when resetting context
    const cacheKey = `cache_${orgId}`;
    const preservedCache = context.current?.[cacheKey];
    context.current = {};
    if (preservedCache) {
      context.current[cacheKey] = preservedCache;
    }

    const instanceDefaults = {
      edgeConfigInputMethod: isFirstInstance
        ? INPUT_METHOD.SELECT
        : INPUT_METHOD.FREEFORM,
      // We only display the edge configuration selection components on the first instance, which
      // might make this seem unnecessary for subsequent instances. However, it's possible for
      // the user to delete their first instance, which would make their second instance become
      // their first instance, which would cause the selection components to be displayable for that
      // instance. We want the state to be ready for this case.
      edgeConfigFreeformInputMethod: getFreeformInputStateForNewInstance(),
      edgeConfigSelectInputMethod:
        await getSelectInputMethodStateForNewInstance({
          orgId,
          imsAccess,
          context,
        }),
    };
    if (
      context.current.fetchSandboxError ||
      context.current.fetchConfigsError
    ) {
      instanceDefaults.edgeConfigInputMethod = INPUT_METHOD.FREEFORM;
    }

    return instanceDefaults;
  },
  getInitialInstanceValues: async ({
    initInfo,
    isFirstInstance,
    instanceSettings,
    context,
  }) => {
    const {
      company: { orgId },
      tokens: { imsAccess },
    } = initInfo;

    const instanceValues = await bridge.getInstanceDefaults({
      initInfo,
      isFirstInstance,
      context,
    });
    let isSuccessfullyPopulatedForSelectInputMethod = false;

    if (isFirstInstance) {
      try {
        instanceValues.edgeConfigSelectInputMethod =
          await getSelectInputMethodStateForExistingInstance({
            orgId,
            imsAccess,
            instanceSettings,
            context,
          });

        instanceValues.edgeConfigFreeformInputMethod =
          getFreeformInputStateForNewInstance();
        if (
          context.current.fetchSandboxError ||
          context.current.fetchConfigsError
        ) {
          instanceValues.edgeConfigInputMethod = INPUT_METHOD.FREEFORM;
          isSuccessfullyPopulatedForSelectInputMethod = false;
        } else {
          instanceValues.edgeConfigInputMethod = INPUT_METHOD.SELECT;
          isSuccessfullyPopulatedForSelectInputMethod = true;
        }
      } catch {
        instanceValues.edgeConfigInputMethod = INPUT_METHOD.FREEFORM;
      }
    }

    if (!isSuccessfullyPopulatedForSelectInputMethod) {
      // We only display the edge configuration selection components on the first instance, which
      // might make this seem unnecessary for subsequent instances. However, it's possible for
      // the user to delete their first instance, which would make their second instance become
      // their first instance, which would cause the selection components to be displayable for that
      // instance. We want the state to be ready for this case.
      try {
        instanceValues.edgeConfigSelectInputMethod =
          await getSelectInputMethodStateForNewInstance({
            orgId,
            imsAccess,
            context,
          });
      } catch {
        // do nothing we will fall back to free form
      }
      instanceValues.edgeConfigFreeformInputMethod =
        getFreeformInputMethodStateForExistingInstance({ instanceSettings });
      instanceValues.edgeConfigInputMethod = INPUT_METHOD.FREEFORM;
    }

    return instanceValues;
  },
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};
    if (instanceValues.edgeConfigInputMethod === INPUT_METHOD.SELECT) {
      if (
        instanceValues?.edgeConfigSelectInputMethod?.productionEnvironment
          ?.datastreamId
      ) {
        instanceSettings.edgeConfigId =
          instanceValues.edgeConfigSelectInputMethod.productionEnvironment.datastreamId;
        instanceSettings.sandbox =
          instanceValues.edgeConfigSelectInputMethod.productionEnvironment.sandbox;
      }

      if (
        instanceValues?.edgeConfigSelectInputMethod?.stagingEnvironment
          ?.datastreamId
      ) {
        instanceSettings.stagingEdgeConfigId =
          instanceValues.edgeConfigSelectInputMethod.stagingEnvironment.datastreamId;
        instanceSettings.stagingSandbox =
          instanceValues.edgeConfigSelectInputMethod.stagingEnvironment.sandbox;
      }

      if (
        instanceValues?.edgeConfigSelectInputMethod?.developmentEnvironment
          ?.datastreamId
      ) {
        instanceSettings.developmentEdgeConfigId =
          instanceValues.edgeConfigSelectInputMethod.developmentEnvironment.datastreamId;
        instanceSettings.developmentSandbox =
          instanceValues.edgeConfigSelectInputMethod.developmentEnvironment.sandbox;
      }
    } else {
      if (instanceValues.edgeConfigFreeformInputMethod.edgeConfigId) {
        instanceSettings.edgeConfigId =
          instanceValues.edgeConfigFreeformInputMethod.edgeConfigId;
      }

      if (instanceValues.edgeConfigFreeformInputMethod.stagingEdgeConfigId) {
        instanceSettings.stagingEdgeConfigId =
          instanceValues.edgeConfigFreeformInputMethod.stagingEdgeConfigId;
      }

      if (
        instanceValues.edgeConfigFreeformInputMethod.developmentEdgeConfigId
      ) {
        instanceSettings.developmentEdgeConfigId =
          instanceValues.edgeConfigFreeformInputMethod.developmentEdgeConfigId;
      }
    }
    return instanceSettings;
  },
  instanceValidationSchema: object()
    .shape({
      edgeConfigSelectInputMethod: object().when("edgeConfigInputMethod", {
        is: INPUT_METHOD.SELECT,
        then: (schema) =>
          schema.shape({
            productionEnvironment: object().shape({
              datastreamId: string().required("Please specify a datastream."),
              sandbox: string().required("Please specify a sandbox."),
            }),
          }),
      }),
      edgeConfigFreeformInputMethod: object().when("edgeConfigInputMethod", {
        is: INPUT_METHOD.FREEFORM,
        then: (schema) =>
          schema.shape({
            edgeConfigId: string().required("Please specify a datastream."),
          }),
      }),
    })
    // TestCafe doesn't allow this to be an arrow function because of
    // how it scopes "this".
    // eslint-disable-next-line func-names
    .test("uniqueEdgeConfigId", function (instance, testContext) {
      const { path: instancePath, parent: instances } = testContext;

      const getEdgeConfigIdFromInstance = (inst) => {
        return inst.edgeConfigInputMethod === INPUT_METHOD.SELECT
          ? inst.edgeConfigSelectInputMethod.productionEnvironment.datastreamId
          : inst.edgeConfigFreeformInputMethod.edgeConfigId;
      };

      const edgeConfigId = getEdgeConfigIdFromInstance(instance);

      if (!edgeConfigId) {
        return true;
      }

      const firstInstanceWithSameEdgeConfigId = instances.find(
        (candidateInstance) =>
          getEdgeConfigIdFromInstance(candidateInstance) === edgeConfigId,
      );
      const isDuplicate = firstInstanceWithSameEdgeConfigId !== instance;

      const edgeConfigIdFieldName =
        instance.edgeConfigInputMethod === INPUT_METHOD.SELECT
          ? `edgeConfigSelectInputMethod.productionEnvironment.datastreamId`
          : `edgeConfigFreeformInputMethod.edgeConfigId`;

      return (
        !isDuplicate ||
        this.createError({
          path: `${instancePath}.${edgeConfigIdFieldName}`,
          message:
            "Please provide a value unique from those used for other instances.",
        })
      );
    }),
};

const getInputMethodFieldName = (instanceFieldName) =>
  `${instanceFieldName}.edgeConfigInputMethod`;
const getSelectInputMethodFieldName = (instanceFieldName) =>
  `${instanceFieldName}.edgeConfigSelectInputMethod`;
const getFreeformInputMethodFieldName = (instanceFieldName) =>
  `${instanceFieldName}.edgeConfigFreeformInputMethod`;

/**
 * A custom React hook that provides the edge config IDs and sandboxes.
 * @param {string} instanceFieldName
 * @returns {{
 *  developmentEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * stagingEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * productionEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * }}}
 */
export const useEdgeConfigIdFields = (instanceFieldName) => {
  const inputMethod = useFieldValue(getInputMethodFieldName(instanceFieldName));

  if (inputMethod === INPUT_METHOD.SELECT) {
    return useFieldValue(getSelectInputMethodFieldName(instanceFieldName));
  }

  const { developmentEdgeConfigId, stagingEdgeConfigId, edgeConfigId } =
    useFieldValue(getFreeformInputMethodFieldName(instanceFieldName));
  return {
    developmentEnvironment: {
      datastreamId: developmentEdgeConfigId,
    },
    stagingEnvironment: {
      datastreamId: stagingEdgeConfigId,
    },
    productionEnvironment: {
      datastreamId: edgeConfigId,
    },
  };
};

const EdgeConfigurationsSection = ({
  instanceFieldName,
  instanceIndex,
  initInfo,
  context,
}) => {
  const [{ value: inputMethod }] = useField(
    getInputMethodFieldName(instanceFieldName),
  );

  return (
    <>
      <SectionHeader learnMoreUrl="https://adobe.ly/3eY91Er">
        Datastreams
      </SectionHeader>
      <FormElementContainer>
        <Content>
          <Link
            href="https://experience.adobe.com/#/data-collection/scramjet/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create a datastream first,
          </Link>{" "}
          or choose an existing one below.
        </Content>
        {
          // Each instance must have a unique org ID. Typically, the first instance will have
          // the org ID that matches the Launch user's active org ID.
          // The Launch user's active org is that only org we can retrieve edge configurations
          // for via an API, so presenting edge configurations for the active org on an
          // instance configured for a different org would most likely confuse the user.
          // To prevent this confusion, we'll hide the radios on all but the first instance.
          instanceIndex === 0 && (
            <FormikRadioGroup
              label="Input method"
              name={getInputMethodFieldName(instanceFieldName)}
              orientation="horizontal"
            >
              <Radio
                data-test-id="edgeConfigInputMethodSelectRadio"
                value={INPUT_METHOD.SELECT}
              >
                Choose from list
              </Radio>
              <Radio
                data-test-id="edgeConfigInputMethodFreeformRadio"
                value={INPUT_METHOD.FREEFORM}
              >
                Enter values
              </Radio>
            </FormikRadioGroup>
          )
        }
        {inputMethod === INPUT_METHOD.SELECT ? (
          <EdgeConfigurationSelectInputMethod
            name={getSelectInputMethodFieldName(instanceFieldName)}
            initInfo={initInfo}
            context={context}
          />
        ) : (
          <EdgeConfigurationFreeformInputMethod
            name={getFreeformInputMethodFieldName(instanceFieldName)}
          />
        )}
      </FormElementContainer>
    </>
  );
};

EdgeConfigurationsSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  instanceIndex: PropTypes.number.isRequired,
  initInfo: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired,
};

export default EdgeConfigurationsSection;
