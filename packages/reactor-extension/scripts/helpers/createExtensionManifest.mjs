/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import alloyComponents, {
  isDefaultComponent,
} from "../../src/view/utils/alloyComponents.mjs";

const createPreprocessingVariables = () => [
  // Alloy component variables
  ...Object.keys(alloyComponents).map((n) => ({
    key: `ALLOY_${n.toUpperCase()}`,
    path: `components.${n}`,
    default: isDefaultComponent(n),
  })),
  // Library loading mode variable (string: "managed" or "preinstalled")
  {
    key: "ALLOY_LIBRARY_TYPE",
    path: "libraryCode.type",
    default: "managed",
  },
];

/**
 * @typedef {object} ExtensionManifest
 * https://experienceleague.adobe.com/docs/experience-platform/tags/extension-dev/manifest.html?lang=en
 * @property {string} displayName
 * @property {string} name
 * @property {string} iconPath
 * @property {string} exchangeUrl
 * @property {string} platform
 * @property {string} version
 * @property {string} description
 * @property {string} author.name
 * @property {string} viewBasePath
 * @property {string} main
 * @property {object} configuration
 * @property {object[]} actions
 * @property {object[]} events
 * @property {object[]} dataElements
 * @typedef {Pick<ExtensionManifest, "version">} ExtensionManifestConfiguration
 */

const enabledDisabledOrDataElement = {
  anyOf: [
    {
      type: "boolean",
    },
    {
      type: "string",
      pattern: "^%[^%]+%$",
    },
  ],
};

/**
 * Create a slice of a JSON schema used to describe the edge overrides
 * configuration.
 * Works for both actions and extension configuration
 * @param {boolean} isAction
 * @returns {object}
 */
const createEdgeConfigOverridesSchema = (isAction) => {
  const configOverridesProps = {
    enabled: enabledDisabledOrDataElement,
    com_adobe_experience_platform: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
        datasets: {
          type: "object",
          properties: {
            event: {
              type: "object",
              properties: {
                datasetId: {
                  type: "string",
                },
              },
              required: ["datasetId"],
            },
          },
        },
        com_adobe_edge_ode: {
          type: "object",
          properties: {
            enabled: enabledDisabledOrDataElement,
          },
          required: ["enabled"],
        },
        com_adobe_edge_segmentation: {
          type: "object",
          properties: {
            enabled: enabledDisabledOrDataElement,
          },
          required: ["enabled"],
        },
        com_adobe_edge_destinations: {
          type: "object",
          properties: {
            enabled: enabledDisabledOrDataElement,
          },
          required: ["enabled"],
        },
        com_adobe_edge_ajo: {
          type: "object",
          properties: {
            enabled: enabledDisabledOrDataElement,
          },
          required: ["enabled"],
        },
      },
    },
    com_adobe_analytics: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
        reportSuites: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
    com_adobe_identity: {
      type: "object",
      properties: {
        idSyncContainerId: {
          anyOf: [
            {
              type: "integer",
            },
            {
              type: "string",
            },
          ],
        },
      },
      required: ["idSyncContainerId"],
    },
    com_adobe_target: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
        propertyToken: {
          type: "string",
        },
      },
    },
    com_adobe_audiencemanager: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
      },
    },
    // deprecated and a typo for com_adobe_audiencemanager, but required for backwards compatibility and upgrades
    com_adobe_audience_manager: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
      },
    },
    com_adobe_launch_ssf: {
      type: "object",
      properties: {
        enabled: enabledDisabledOrDataElement,
      },
    },
  };
  const configOverridesWithDatastream = {
    ...configOverridesProps,
    sandbox: {
      type: "string",
      minLength: 1,
    },
    datastreamId: {
      type: "string",
      minLength: 1,
    },
    datastreamIdInputMethod: {
      type: "string",
      enum: ["freeform", "select"],
    },
  };
  return {
    type: "object",
    properties: {
      ...configOverridesProps,
      development: {
        type: "object",
        additionalProperties: false,
        properties: {
          ...(isAction ? configOverridesWithDatastream : configOverridesProps),
        },
      },
      staging: {
        type: "object",
        additionalProperties: false,
        properties: {
          ...(isAction ? configOverridesWithDatastream : configOverridesProps),
        },
      },
      production: {
        type: "object",
        additionalProperties: false,
        properties: {
          ...(isAction ? configOverridesWithDatastream : configOverridesProps),
        },
      },
    },
  };
};

/**
 * Create a list of common transforms used to with edge config overrides.
 * Works for both actions and extension configuration.
 * @param {boolean} isAction
 * @returns {{ type: "remove", propertyPath: string }[]}
 */
const createEdgeConfigOverridesTransforms = (isAction) => {
  const prefix = isAction ? "" : "instances[].";
  return [
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.development.sandbox`,
    },
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.staging.sandbox`,
    },
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.production.sandbox`,
    },
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.development.datastreamIdInputMethod`,
    },
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.staging.datastreamIdInputMethod`,
    },
    {
      type: "remove",
      propertyPath: `${prefix}edgeConfigOverrides.production.datastreamIdInputMethod`,
    },
  ];
};

/**
 * Create the contents of the extension.json aka the extension definition.
 * @param {ExtensionManifestConfiguration} options
 * @returns {ExtensionManifest}
 */
const createExtensionManifest = ({ version }) => {
  const actionEdgeConfigOverridesSchema = createEdgeConfigOverridesSchema(true);
  const actionEdgeConfigOverridesTransforms =
    createEdgeConfigOverridesTransforms(true);
  /** @type {ExtensionManifest} */
  const extensionManifest = {
    version,
    displayName: "Adobe Experience Platform Web SDK",
    name: "adobe-alloy",
    iconPath: "resources/images/icon.svg",
    exchangeUrl:
      "https://exchange.adobe.com/experiencecloud.details.106387.aep-web-sdk.html",
    platform: "web",
    description:
      "The Adobe Experience Platform Web SDK allows for streaming data into the platform, syncing identities, personalizing content, and more.",
    author: {
      name: "Adobe",
    },
    viewBasePath: "dist/view/",
    configuration: {
      viewPath: "configuration/configuration.html",
      schema: {
        $schema: "http://json-schema.org/draft-04/schema#",
        type: "object",
        oneOf: [
          {
            properties: {
              libraryCode: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["preinstalled"],
                  },
                },
                required: ["type"],
                additionalProperties: false,
              },
              instances: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      pattern: "\\D+",
                    },
                  },
                  required: ["name"],
                  additionalProperties: false,
                },
              },
            },
            required: ["libraryCode", "instances"],
            additionalProperties: false,
          },
          {
            properties: {
              instances: {
                type: "array",
                minItems: 1,
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      pattern: "\\D+",
                    },
                    edgeConfigId: {
                      type: "string",
                      minLength: 1,
                    },
                    stagingEdgeConfigId: {
                      type: "string",
                      minLength: 1,
                    },
                    developmentEdgeConfigId: {
                      type: "string",
                      minLength: 1,
                    },
                    sandbox: {
                      type: "string",
                      minLength: 1,
                    },
                    stagingSandbox: {
                      type: "string",
                      minLength: 1,
                    },
                    developmentSandbox: {
                      type: "string",
                      minLength: 1,
                    },
                    orgId: {
                      type: "string",
                      minLength: 1,
                    },
                    edgeDomain: {
                      type: "string",
                      minLength: 1,
                    },
                    edgeBasePath: {
                      type: "string",
                      minLength: 1,
                    },
                    defaultConsent: {
                      anyOf: [
                        {
                          type: "string",
                          pattern: "^%[^%]+%$",
                        },
                        {
                          type: "string",
                          enum: ["in", "out", "pending"],
                        },
                      ],
                    },
                    idMigrationEnabled: {
                      type: "boolean",
                    },
                    thirdPartyCookiesEnabled: enabledDisabledOrDataElement,
                    prehidingStyle: {
                      type: "string",
                      minLength: 1,
                    },
                    targetMigrationEnabled: {
                      type: "boolean",
                    },
                    clickCollectionEnabled: {
                      type: "boolean",
                    },
                    clickCollection: {
                      type: "object",
                      properties: {
                        internalLinkEnabled: {
                          type: "boolean",
                        },
                        externalLinkEnabled: {
                          type: "boolean",
                        },
                        downloadLinkEnabled: {
                          type: "boolean",
                        },
                        sessionStorageEnabled: {
                          type: "boolean",
                        },
                        eventGroupingEnabled: {
                          type: "boolean",
                        },
                        filterClickDetails: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      additionalProperties: false,
                    },
                    downloadLinkQualifier: {
                      type: "string",
                      minLength: 1,
                    },
                    context: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: [
                          "web",
                          "device",
                          "environment",
                          "placeContext",
                          "highEntropyUserAgentHints",
                          "oneTimeAnalyticsReferrer",
                        ],
                      },
                    },
                    onBeforeEventSend: {
                      type: "string",
                      minLength: 1,
                    },
                    onBeforeLinkClickSend: {
                      type: "string",
                      minLength: 1,
                    },
                    edgeConfigOverrides: createEdgeConfigOverridesSchema(false),
                    streamingMedia: {
                      type: "object",
                      properties: {
                        channel: {
                          type: "string",
                        },
                        playerName: {
                          type: "string",
                        },
                        appVersion: {
                          type: "string",
                        },
                        mainPingInterval: {
                          type: "integer",
                        },
                        adPingInterval: {
                          type: "integer",
                        },
                      },
                      required: ["channel", "playerName"],
                      additionalProperties: false,
                    },
                    advertising: {
                      type: "object",
                      properties: {
                        dspEnabled: enabledDisabledOrDataElement,
                        advertiserSettings: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              advertiserId: {
                                type: "string",
                              },
                              enabled: enabledDisabledOrDataElement,
                            },
                            required: ["advertiserId", "enabled"],
                            additionalProperties: false,
                          },
                        },
                        id5PartnerId: {
                          type: "string",
                        },
                        rampIdJSPath: {
                          type: "string",
                        },
                      },
                      additionalProperties: false,
                    },
                    pushNotifications: {
                      type: "object",
                      properties: {
                        vapidPublicKey: {
                          type: "string",
                          minLength: 1,
                        },
                        appId: {
                          type: "string",
                          minLength: 1,
                        },
                        trackingDatasetId: {
                          type: "string",
                          minLength: 1,
                        },
                      },
                      required: [
                        "vapidPublicKey",
                        "trackingDatasetId",
                        "appId",
                      ],
                      additionalProperties: false,
                    },
                    conversation: {
                      stickyConversationSession: {
                        type: "boolean",
                      },
                      streamTimeout: {
                        type: "integer",
                        minimum: 10000,
                      },
                    },
                    personalizationStorageEnabled: {
                      type: "boolean",
                    },
                    autoCollectPropositionInteractions: {
                      type: "object",
                      properties: {
                        AJO: {
                          type: "string",
                          enum: ["always", "decoratedElementsOnly", "never"],
                        },
                        TGT: {
                          type: "string",
                          enum: ["always", "decoratedElementsOnly", "never"],
                        },
                      },
                      additionalProperties: false,
                    },
                  },
                  required: ["edgeConfigId", "name"],
                  additionalProperties: false,
                },
              },
              components: {
                type: "object",
                patternProperties: {
                  ".*": { type: "boolean" },
                },
              },
            },
            required: ["instances"],
            additionalProperties: false,
          },
        ],
      },
      transforms: [
        {
          type: "function",
          propertyPath: "instances[].onBeforeEventSend",
          parameters: ["content"],
        },
        {
          type: "function",
          propertyPath: "instances[].onBeforeLinkClickSend",
          parameters: ["content"],
        },
        {
          type: "function",
          propertyPath: "instances[].clickCollection.filterClickDetails",
          parameters: ["content"],
        },
        {
          type: "remove",
          propertyPath: "instances[].edgeConfigInputMethod",
        },
        {
          type: "remove",
          propertyPath: "instances[].sandbox",
        },
        {
          type: "remove",
          propertyPath: "instances[].stagingSandbox",
        },
        {
          type: "remove",
          propertyPath: "instances[].developmentSandbox",
        },
        ...createEdgeConfigOverridesTransforms(false),
      ],
    },
    actions: [
      {
        displayName: "Reset event merge ID",
        name: "reset-event-merge-id",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            eventMergeId: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
          },
          required: ["eventMergeId"],
          additionalProperties: false,
        },
        libPath: "dist/lib/actions/resetEventMergeId/index.js",
        viewPath: "actions/resetEventMergeId.html",
      },
      {
        displayName: "Send event",
        name: "send-event",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            guidedEventsEnabled: {
              type: "boolean",
            },
            guidedEvent: {
              type: "string",
            },
            instanceName: {
              type: "string",
              minLength: 1,
            },
            renderDecisions: {
              type: "boolean",
              minLength: 1,
            },
            decisionScopes: {
              anyOf: [
                {
                  type: "array",
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
            personalization: {
              type: "object",
              properties: {
                decisionScopes: {
                  anyOf: [
                    {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "string",
                        minLength: 1,
                      },
                    },
                    {
                      type: "string",
                      pattern: "^%[^%]+%$",
                    },
                  ],
                },
                surfaces: {
                  anyOf: [
                    {
                      type: "array",
                      minItems: 1,
                      items: {
                        type: "string",
                        minLength: 1,
                      },
                    },
                    {
                      type: "string",
                      pattern: "^%[^%]+%$",
                    },
                  ],
                },
                sendDisplayEvent: {
                  type: "boolean",
                },
                includeRenderedPropositions: {
                  type: "boolean",
                },
                defaultPersonalizationEnabled: {
                  type: "boolean",
                },
                decisionContext: {
                  anyOf: [
                    {
                      type: "string",
                      pattern: "^%[^%]+%$",
                    },
                    {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                      },
                    },
                  ],
                },
              },
              additionalProperties: false,
            },
            xdm: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
            data: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
            type: {
              type: "string",
              minLength: 1,
            },
            mergeId: {
              type: "string",
              minLength: 1,
            },
            datasetId: {
              type: "string",
              minLength: 1,
            },
            documentUnloading: {
              type: "boolean",
            },
            advertising: {
              type: "object",
              properties: {
                handleAdvertisingData: {
                  anyOf: [
                    {
                      type: "string",
                      enum: ["auto", "wait", "disabled"],
                    },
                    {
                      type: "string",
                      pattern: "^%[^%]+%$",
                    },
                  ],
                },
              },
              additionalProperties: false,
            },
            edgeConfigOverrides: actionEdgeConfigOverridesSchema,
          },
          required: ["instanceName"],
          additionalProperties: false,
        },
        transforms: [
          {
            type: "remove",
            propertyPath: "guidedEventsEnabled",
          },
          {
            type: "remove",
            propertyPath: "guidedEvent",
          },
          ...actionEdgeConfigOverridesTransforms,
        ],
        libPath: "dist/lib/actions/sendEvent/index.js",
        viewPath: "actions/sendEvent.html",
      },
      {
        displayName: "Set consent",
        name: "set-consent",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            identityMap: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
            consent: {
              anyOf: [
                {
                  type: "array",
                  minItems: 1,
                  items: {
                    anyOf: [
                      {
                        type: "object",
                        properties: {
                          standard: {
                            type: "string",
                            enum: ["Adobe"],
                          },
                          version: {
                            type: "string",
                          },
                          value: {
                            type: "object",
                            properties: {
                              general: {
                                oneOf: [
                                  {
                                    type: "string",
                                    enum: ["in", "out"],
                                  },
                                  {
                                    type: "string",
                                    pattern: "^%[^%]+%$",
                                  },
                                ],
                              },
                            },
                          },
                        },
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          standard: {
                            type: "string",
                            enum: ["Adobe"],
                          },
                          version: {
                            type: "string",
                          },
                          value: {
                            type: "string",
                            pattern: "^%[^%]+%$",
                          },
                        },
                      },
                      {
                        type: "object",
                        properties: {
                          standard: {
                            type: "string",
                            enum: ["IAB TCF"],
                          },
                          version: {
                            type: "string",
                          },
                          value: {
                            type: "string",
                          },
                          gdprApplies: {
                            anyOf: [
                              {
                                type: "boolean",
                              },
                              {
                                type: "string",
                                pattern: "^%[^%]+%$",
                              },
                            ],
                          },
                          gdprContainsPersonalData: {
                            anyOf: [
                              {
                                type: "boolean",
                              },
                              {
                                type: "string",
                                pattern: "^%[^%]+%$",
                              },
                            ],
                          },
                        },
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
            edgeConfigOverrides: actionEdgeConfigOverridesSchema,
          },
          required: ["instanceName", "consent"],
          additionalProperties: false,
        },
        transforms: [...actionEdgeConfigOverridesTransforms],
        libPath: "dist/lib/actions/setConsent/index.js",
        viewPath: "actions/setConsent.html",
      },
      {
        displayName: "Redirect with identity",
        name: "redirect-with-identity",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            edgeConfigOverrides: actionEdgeConfigOverridesSchema,
          },
          required: ["instanceName"],
          additionalProperties: false,
        },
        transforms: [...actionEdgeConfigOverridesTransforms],
        libPath: "dist/lib/actions/redirectWithIdentity/index.js",
        viewPath: "actions/redirectWithIdentity.html",
      },
      {
        displayName: "Apply response",
        name: "apply-response",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            renderDecisions: {
              type: "boolean",
              minLength: 1,
            },
            responseHeaders: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
            responseBody: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
          },
          required: ["instanceName", "responseBody"],
          additionalProperties: false,
        },
        libPath: "dist/lib/actions/applyResponse/index.js",
        viewPath: "actions/applyResponse.html",
      },
      {
        displayName: "Apply propositions",
        name: "apply-propositions",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            propositions: {
              type: "string",
              pattern: "^%[^%]+%$",
            },
            metadata: {
              anyOf: [
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
                {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      selector: {
                        type: "string",
                        minLength: 1,
                      },
                      actionType: {
                        type: "string",
                        enum: [
                          "setHtml",
                          "replaceHtml",
                          "appendHtml",
                          "collectInteractions",
                        ],
                      },
                    },
                    required: ["selector", "actionType"],
                  },
                },
              ],
            },
            viewName: {
              type: "string",
              minLength: 1,
            },
          },
        },
        libPath: "dist/lib/actions/applyPropositions/index.js",
        viewPath: "actions/applyPropositions.html",
      },
      {
        displayName: "Update variable",
        name: "update-variable",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            dataElementCacheId: {
              type: "string",
              minLength: 1,
            },
            dataElementId: {
              type: "string",
              minLength: 1,
            },
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  minLength: 1,
                },
                version: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["id", "version"],
              additionalProperties: false,
            },
            data: {
              anyOf: [
                {
                  type: "object",
                },
                {
                  type: "string",
                  minLength: 1,
                },
              ],
            },
            transforms: {
              type: "object",
            },
            customCode: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["dataElementId"],
        },
        transforms: [
          {
            type: "remove",
            propertyPath: "schema",
          },
          {
            type: "function",
            propertyPath: "customCode",
            parameters: ["content", "event"],
          },
        ],
        libPath: "dist/lib/actions/updateVariable/index.js",
        viewPath: "actions/updateVariable.html",
      },
      {
        displayName: "Send Media Event",
        name: "send-media-event",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            handleMediaSessionAutomatically: {
              type: "boolean",
            },
            eventType: {
              type: "string",
              minLength: 1,
            },
            playerId: {
              type: "string",
              minLength: 1,
            },
            xdm: {
              type: "object",
            },
            edgeConfigOverrides: actionEdgeConfigOverridesSchema,
          },
          required: ["instanceName", "playerId"],
        },
        transforms: [...actionEdgeConfigOverridesTransforms],
        libPath: "dist/lib/actions/sendMediaEvent/index.js",
        viewPath: "actions/sendStreamingMediaEvent.html",
      },
      {
        displayName: "Get Media Analytics Tracker",
        name: "get-media-tracker",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
            objectName: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["instanceName"],
        },
        libPath: "dist/lib/actions/getMediaAnalyticsTracker/index.js",
        viewPath: "actions/createMediaTracker.html",
      },
      {
        displayName: "Evaluate rulesets",
        name: "evaluate-rulesets",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          instanceName: {
            type: "string",
            minLength: 1,
          },
          renderDecisions: {
            type: "boolean",
          },
          personalization: {
            type: "object",
            properties: {
              decisionContext: {
                anyOf: [
                  {
                    type: "string",
                    pattern: "^%[^%]+%$",
                  },
                  {
                    type: "object",
                    additionalProperties: {
                      type: "string",
                    },
                  },
                ],
              },
            },
          },
        },
        libPath: "dist/lib/actions/evaluateRulesets/index.js",
        viewPath: "actions/evaluateRulesets.html",
      },
      {
        name: "send-push-subscription",
        displayName: "Send push subscription",
        libPath: "dist/lib/actions/sendPushSubscription/index.js",
        viewPath: "actions/sendPushSubscription.html",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            instanceName: {
              type: "string",
              minLength: 1,
            },
          },
          additionalProperties: false,
          required: ["instanceName"],
        },
      },
    ],
    events: [
      {
        name: "monitor-triggered",
        displayName: "Monitoring hook triggered",
        libPath: "dist/lib/events/monitor/index.js",
        viewPath: "events/monitorTriggered.html",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
      },
      {
        name: "decisions-received",
        displayName: "Decisions received (DEPRECATED)",
        libPath: "dist/lib/events/decisionsReceived/index.js",
        schema: {},
      },
      {
        name: "send-event-complete",
        displayName: "Send event complete",
        libPath: "dist/lib/events/sendEventComplete/index.js",
        schema: {},
      },
      {
        name: "subscribe-ruleset-items",
        displayName: "Subscribe ruleset items",
        libPath: "dist/lib/events/subscribeRulesetItems/index.js",
        viewPath: "events/subscribeRulesetItems.html",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          instanceName: {
            type: "string",
            minLength: 1,
          },
          surfaces: {
            anyOf: [
              {
                type: "array",
                minItems: 1,
                items: {
                  type: "string",
                  minLength: 1,
                },
              },
              {
                type: "string",
                pattern: "^%[^%]+%$",
              },
            ],
          },
          schemas: {
            anyOf: [
              {
                type: "array",
                minItems: 1,
                items: {
                  type: "string",
                  minLength: 1,
                },
              },
              {
                type: "string",
                pattern: "^%[^%]+%$",
              },
            ],
          },
        },
      },
    ],
    dataElements: [
      {
        displayName: "Media: Quality of Experience data",
        name: "qoe-details-data",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            bitrate: {
              oneOf: [
                {
                  type: "integer",
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
            droppedFrames: {
              oneOf: [
                {
                  type: "integer",
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
            framesPerSecond: {
              oneOf: [
                {
                  type: "integer",
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
            timeToStart: {
              oneOf: [
                {
                  type: "integer",
                },
                {
                  type: "string",
                  pattern: "^%[^%]+%$",
                },
              ],
            },
          },
          additionalProperties: false,
        },
        libPath: "dist/lib/dataElements/qoeDetailsData/index.js",
        viewPath: "dataElements/qoeDetailsDataElement.html",
      },
      {
        displayName: "Event merge ID",
        name: "event-merge-id",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            cacheId: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["cacheId"],
          additionalProperties: false,
        },
        libPath: "dist/lib/dataElements/eventMergeId/index.js",
        viewPath: "dataElements/eventMergeId.html",
      },
      {
        displayName: "Identity map",
        name: "identity-map",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          additionalProperties: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                },
                authenticatedState: {
                  type: "string",
                  enum: ["loggedOut", "authenticated", "ambiguous"],
                },
                primary: {
                  type: "boolean",
                },
              },
              additionalProperties: false,
            },
          },
        },
        libPath: "dist/lib/dataElements/identityMap/index.js",
        viewPath: "dataElements/identityMap.html",
      },
      {
        displayName: "XDM object",
        name: "xdm-object",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          properties: {
            sandbox: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["name"],
              additionalProperties: false,
            },
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  minLength: 1,
                },
                version: {
                  type: "string",
                  minLength: 1,
                },
              },
              required: ["id", "version"],
              additionalProperties: false,
            },
            data: {
              type: "object",
            },
          },
          required: ["schema", "data"],
          additionalProperties: false,
        },
        transforms: [
          {
            type: "remove",
            propertyPath: "schema",
          },
        ],
        libPath: "dist/lib/dataElements/xdmObject/index.js",
        viewPath: "dataElements/xdmObject.html",
      },
      {
        displayName: "Variable",
        name: "variable",
        schema: {
          $schema: "http://json-schema.org/draft-04/schema#",
          type: "object",
          anyOf: [
            {
              properties: {
                cacheId: {
                  type: "string",
                  minLength: 1,
                },
                sandbox: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["name"],
                  additionalProperties: false,
                },
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      minLength: 1,
                    },
                    version: {
                      type: "string",
                      minLength: 1,
                    },
                  },
                  required: ["id", "version"],
                  additionalProperties: false,
                },
              },
              required: ["sandbox", "schema"],
              additionalProperties: false,
            },
            {
              properties: {
                cacheId: {
                  type: "string",
                  minLength: 1,
                },
                solutions: {
                  type: "array",
                  minItems: 1,
                  items: {
                    enum: [
                      "analytics",
                      "target",
                      "audiencemanager",
                      "audienceManager",
                    ],
                  },
                  required: ["name"],
                  additionalProperties: false,
                },
              },
              required: ["solutions"],
              additionalProperties: false,
            },
          ],
        },
        transforms: [
          {
            type: "add",
            propertyPath: "dataElementId",
            reservedKey: "originId",
          },
          {
            type: "remove",
            propertyPath: "schema",
          },
          {
            type: "remove",
            propertyPath: "sandbox",
          },
        ],
        libPath: "dist/lib/dataElements/variable/index.js",
        viewPath: "dataElements/variable.html",
      },
    ],
    preprocessingVariables: createPreprocessingVariables(),
    main: "dist/lib/instanceManager/index.js",
  };

  return extensionManifest;
};

export default createExtensionManifest;
