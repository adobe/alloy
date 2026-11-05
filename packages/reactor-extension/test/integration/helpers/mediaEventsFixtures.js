/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const extensionSettings = {
  components: {
    activityCollector: true,
    advertising: true,
    audiences: true,
    brandConcierge: true,
    consent: true,
    eventMerge: true,
    mediaAnalyticsBridge: true,
    personalization: true,
    pushNotifications: true,
    rulesEngine: true,
    streamingMedia: true,
  },
  instances: [
    {
      name: "alloy",
      orgId: "PARITY@AdobeOrg",
      edgeConfigId: "ds-prod",
      sandbox: "prod",
      streamingMedia: {
        channel: "Web",
        playerName: "Player",
        appVersion: "1.2",
      },
    },
    {
      name: "secondary",
      orgId: "SECOND@AdobeOrg",
      edgeConfigId: "ds-other",
      streamingMedia: {
        channel: "Other",
        playerName: "Other player",
        appVersion: "2.0",
      },
    },
  ],
};

export const extensionModes = [
  [
    "components disabled",
    {
      ...extensionSettings,
      components: Object.fromEntries(
        Object.keys(extensionSettings.components).map((name) => [name, false]),
      ),
    },
  ],
  [
    "self hosted",
    { ...extensionSettings, libraryCode: { type: "preinstalled" } },
  ],
];

export const mediaSettings = {
  minimal: { eventType: "media.play", playerId: "player" },
  session: {
    eventType: "media.sessionStart",
    instanceName: "secondary",
    playerId: "%player%",
    handleMediaSessionAutomatically: true,
    edgeConfigOverrides: Object.fromEntries(
      ["development", "staging", "production"].map((environment, index) => [
        environment,
        {
          enabled: true,
          datastreamId: `ds-${environment}`,
          sandbox: "prod",
          com_adobe_experience_platform: {
            datasets: { event: { datasetId: `dataset-${environment}` } },
            com_adobe_edge_ode: { enabled: false },
            com_adobe_edge_segmentation: { enabled: false },
            com_adobe_edge_destinations: { enabled: false },
            com_adobe_edge_ajo: { enabled: false },
          },
          com_adobe_analytics: {
            reportSuites: [`suite-${environment}`, "", "%suite%"],
          },
          com_adobe_identity: { idSyncContainerId: index + 1 },
          com_adobe_target: { propertyToken: `token-${environment}` },
          com_adobe_audiencemanager: { enabled: false },
          com_adobe_launch_ssf: { enabled: false },
        },
      ]),
    ),
    xdm: {
      mediaCollection: {
        playhead: "%playhead%",
        qoeDataDetails: "%qoe%",
        sessionDetails: {
          contentType: "vod",
          length: 120,
          name: "video-1",
          friendlyName: "Video",
          adLoad: "1",
          showType: "0",
          artist: "Artist",
          album: "Album",
          author: "Author",
          assetID: "asset",
          authorized: "true",
          dayPart: "morning",
          episode: "1",
          feed: "main",
          firstAirDate: "2025-01-01",
          firstDigitalDate: "2025-01-02",
          genre: "news",
          label: "label",
          rating: "PG",
          mvpd: "mvpd",
          network: "network",
          originator: "originator",
          publisher: "publisher",
          season: "1",
          show: "show",
          streamType: "video",
          streamFormat: "HD",
          station: "station",
        },
        customMetadata: [
          { name: "key", value: "%value%" },
          { name: "country", value: "US" },
        ],
      },
    },
  },
  ad: {
    eventType: "media.adStart",
    playerId: "player",
    xdm: {
      mediaCollection: {
        advertisingDetails: {
          name: "ad-1",
          length: 30,
          podPosition: 0,
          friendlyName: "Ad",
          advertiser: "Brand",
          campaignID: "campaign",
          creativeID: "creative",
          creativeURL: "https://example.com/ad",
          placementID: "placement",
          siteID: "site",
        },
      },
    },
  },
  adBreak: {
    eventType: "media.adBreakStart",
    playerId: "player",
    xdm: {
      mediaCollection: {
        advertisingPodDetails: { friendlyName: "Break", offset: 10, index: 1 },
      },
    },
  },
  chapter: {
    eventType: "media.chapterStart",
    playerId: "player",
    xdm: {
      mediaCollection: {
        chapterDetails: {
          friendlyName: "Chapter",
          length: 60,
          index: 1,
          offset: 0,
        },
      },
    },
  },
  error: {
    eventType: "media.error",
    playerId: "player",
    xdm: {
      mediaCollection: { errorDetails: { name: "Error", source: "player" } },
    },
  },
  states: {
    eventType: "media.statesUpdate",
    playerId: "player",
    xdm: {
      mediaCollection: {
        statesStart: [{ name: "fullscreen" }, { name: "custom" }],
        statesEnd: [{ name: "mute" }],
      },
    },
  },
  bitrate: {
    eventType: "media.bitrateChange",
    playerId: "player",
    xdm: { mediaCollection: { qoeDataDetails: "%qoe%" } },
  },
};
