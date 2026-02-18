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

import PropTypes from "prop-types";
import { number, object, string, lazy } from "yup";
import { useField } from "formik";
import { InlineAlert, View, Heading, Content } from "@adobe/react-spectrum";
import SectionHeader from "../components/sectionHeader";
import FormElementContainer from "../components/formElementContainer";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikNumberField from "../components/formikReactSpectrum3/formikNumberField";
import isNonEmptyString from "../utils/isNonEmptyString";

const getDefaultSettings = () => ({
  channel: "",
  playerName: "",
  appVersion: "",
  adPingInterval: 10,
  mainPingInterval: 10,
});

export const bridge = {
  getInstanceDefaults: () => ({
    streamingMedia: getDefaultSettings(),
  }),

  getInitialInstanceValues: ({ instanceSettings }) => {
    if (!instanceSettings.streamingMedia) {
      return bridge.getInstanceDefaults();
    }

    const defaultSettings = getDefaultSettings();
    const streamingMedia = Object.keys(defaultSettings).reduce((acc, k) => {
      if (instanceSettings.streamingMedia[k] !== undefined) {
        acc[k] = instanceSettings.streamingMedia[k];
      } else {
        acc[k] = defaultSettings[k] || "";
      }

      return acc;
    }, {});

    return { streamingMedia };
  },

  getInstanceSettings: ({ instanceValues, components }) => {
    const instanceSettings = {};

    if (components.streamingMedia) {
      const {
        streamingMedia: {
          channel,
          playerName,
          appVersion,
          adPingInterval,
          mainPingInterval,
        },
      } = instanceValues;

      const streamingMedia = { channel, playerName };
      if (appVersion !== "") {
        streamingMedia.appVersion = appVersion;
      }

      if (adPingInterval !== 10) {
        streamingMedia.adPingInterval = adPingInterval;
      }

      if (mainPingInterval !== 10) {
        streamingMedia.mainPingInterval = mainPingInterval;
      }

      if (channel && playerName) {
        instanceSettings.streamingMedia = streamingMedia;
      }
    }
    return instanceSettings;
  },
  instanceValidationSchema: object().shape({
    streamingMedia: object().when("$components.streamingMedia", {
      is: true,
      then: (mediaSchema) =>
        mediaSchema.shape(
          {
            channel: string().when("playerName", {
              is: (playerName) => playerName,
              then: (schema) =>
                schema.required(
                  "Please provide a channel name for streaming media.",
                ),
            }),
            playerName: string().when("channel", {
              is: (channel) => channel,
              then: (schema) =>
                schema.required(
                  "Please provide a player name for streaming media.",
                ),
            }),
            adPingInterval: lazy((value) =>
              /^\d+$/.exec(value)
                ? number().when(["channel", "playerName"], {
                    is: (channel, playerName) => channel && playerName,
                    then: (schema) =>
                      schema
                        .min(
                          1,
                          "The Ad Ping Interval must be greater than 1 second.",
                        )
                        .max(
                          10,
                          "The Ad Ping Interval must be less than 10 seconds.",
                        )
                        .default(10),
                  })
                : string(),
            ),
            mainPingInterval: lazy((value) =>
              /^\d+$/.exec(value)
                ? number().when(["channel", "playerName"], {
                    is: (channel, playerName) => channel && playerName,
                    then: (schema) =>
                      schema
                        .min(
                          10,
                          "The Main Ping Interval must be greater than 10 seconds.",
                        )
                        .max(
                          60,
                          "The Main Ping Interval must be less than 60 seconds.",
                        )
                        .default(10),
                  })
                : string(),
            ),
          },
          ["channel", "playerName"],
        ),
    }),
  }),
};

const StreamingMediaSection = ({ instanceFieldName }) => {
  const [{ value: mediaChannel }] = useField(
    `${instanceFieldName}.streamingMedia.channel`,
  );
  const [{ value: playerName }] = useField(
    `${instanceFieldName}.streamingMedia.playerName`,
  );
  const [{ value: streamingMediaComponentEnabled }] = useField(
    "components.streamingMedia",
  );

  const mediaRequiredFieldsProvided = () => {
    if (isNonEmptyString(mediaChannel) || isNonEmptyString(playerName)) {
      return true;
    }
    return false;
  };
  return (
    <>
      <SectionHeader>Streaming media</SectionHeader>
      {streamingMediaComponentEnabled ? (
        <FormElementContainer>
          <FormikTextField
            data-test-id="mediaChannelField"
            label="Channel"
            name={`${instanceFieldName}.streamingMedia.channel`}
            description="Distribution station/channels or where the content is played. Any string value is accepted here."
            width="size-5000"
            isRequired={mediaRequiredFieldsProvided()}
          />
          <FormikTextField
            data-test-id="mediaPlayerNameField"
            label="Player Name"
            name={`${instanceFieldName}.streamingMedia.playerName`}
            description="The streaming media player name that will be used in every media session."
            width="size-5000"
            isRequired={mediaRequiredFieldsProvided()}
          />
          <FormikTextField
            data-test-id="mediaVersionField"
            label="Application version"
            name={`${instanceFieldName}.streamingMedia.appVersion`}
            description="The SDK version used by the player. This could have any custom value that makes sense for your player."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
          <FormikNumberField
            data-test-id="mediaMainPingIntervalField"
            label="Main ping interval"
            name={`${instanceFieldName}.streamingMedia.mainPingInterval`}
            description="The ping interval frequency (in seconds) for main content."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
          <FormikNumberField
            data-test-id="mediaAdPingIntervalField"
            label="Ad ping interval"
            name={`${instanceFieldName}.streamingMedia.adPingInterval`}
            description="The ping interval frequency (in seconds) for ad content."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
        </FormElementContainer>
      ) : (
        <View width="size-6000">
          <InlineAlert variant="info">
            <Heading>Streaming media component disabled</Heading>
            <Content>
              The streaming media custom build component is disabled. Enable it
              above to configure streaming media settings.
            </Content>
          </InlineAlert>
        </View>
      )}
    </>
  );
};

StreamingMediaSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default StreamingMediaSection;
