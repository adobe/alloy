/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { Identity } from '../../utils/request/types.js' */

/**
 * @typedef {Object} PushSubscription
 * @property {string} endpoint - The push service endpoint URL
 * @property {Object} keys - The subscription keys object
 * @property {string|null} keys.p256dh - The P-256 ECDH public key as an ArrayBuffer, or null if not available
 * @property {string|null} keys.auth - The authentication secret as an ArrayBuffer, or null if not available
 */

/**
 * @typedef {Object} CustomerJourneyManagement
 * @property {Object} messageExecution
 * @property {string} messageExecution.messageExecutionID
 * @property {string} messageExecution.messageID
 * @property {string} messageExecution.messageType
 * @property {string} messageExecution.campaignID
 * @property {string} messageExecution.campaignVersionID
 * @property {string} messageExecution.batchInstanceID
 * @property {Object} [pushChannelContext]
 * @property {"web"} [pushChannelContext.platform]
 * @property {Object} [messageProfile]
 * @property {Object} [messageProfile.channel]
 * @property {string} [messageProfile.channel._id]
 */

/**
 * @typedef {Object} Decisioning
 * @property {Object[]} propositions
 * @property {Object} propositions[].scopeDetails
 * @property {string} propositions[].scopeDetails.correlationID
 */

/**
 * @typedef {Object} XdmTrackingContext
 * @property {Object} _experience
 * @property {CustomerJourneyManagement} _experience.customerJourneyManagement
 * @property {Decisioning} _experience.decisioning
 */

/**
 * @typedef {Object} PushNotificationData
 * @property {Object} web
 * @property {string} web.title
 * @property {string} web.body
 * @property {string|null} web.media
 * @property {Object} web.interaction
 * @property {string} web.interaction.type
 * @property {string|null} web.interaction.uri
 * @property {Object} web.actions
 * @property {Object[]} web.actions.buttons
 * @property {string} web.actions.buttons[].label
 * @property {string} web.actions.buttons[].type
 * @property {string} web.actions.buttons[].uri
 * @property {string} web.priority
 * @property {Object} web._xdm
 * @property {XdmTrackingContext} web._xdm.mixins
 */

/**
 * @typedef {Object} TrackingDataPayload
 * @property {Object[]} events
 * @property {Object} events[].xdm
 * @property {Object} events[].xdm.identityMap
 * @property {Object[]} events[].xdm.identityMap.ECID
 * @property {string} events[].xdm.identityMap.ECID[].id
 * @property {string} events[].xdm.timestamp
 * @property {Object} events[].xdm.pushNotificationTracking
 * @property {string} events[].xdm.pushNotificationTracking.pushProviderMessageID
 * @property {string} events[].xdm.pushNotificationTracking.pushProvider
 * @property {Object} [events[].xdm.pushNotificationTracking.customAction]
 * @property {string} [events[].xdm.pushNotificationTracking.customAction.actionID]
 * @property {Object} events[].xdm.application
 * @property {Object} events[].xdm.application.launches
 * @property {number} events[].xdm.application.launches.value
 * @property {string} events[].xdm.eventType
 * @property {Object} events[].xdm._experience
 * @property {CustomerJourneyManagement} events[].xdm._experience.customerJourneyManagement
 * @property {Decisioning} events[].xdm._experience.decisioning
 * @property {Object} events[].meta
 * @property {Object} events[].meta.collect
 * @property {string} events[].meta.collect.datasetId
 */

/**
 * @typedef {Object} ServiceWorkerLogger
 * @property {string} namespace
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} error
 */

export const Types = {};
