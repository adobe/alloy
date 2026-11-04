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
import { all, isEmpty, parentOf, rule, shape, when } from "../forms/validation";
import { useFieldValue } from "../utils/useFieldValue";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import SectionHeader from "../components/sectionHeader";
import InfoMessage from "../components/infoMessage";
import FormElementContainer from "../components/formElementContainer";
import FormTextField from "../forms/fields/TextField";
import FormNumberField from "../forms/fields/NumberField";
import isNonEmptyString from "../utils/isNonEmptyString";

const getDefaultSettings = () => ({
  channel: "",
  playerName: "",
  appVersion: "",
  adPingInterval: 10,
  mainPingInterval: 10,
});

// Intervals are only checked once a channel and player name are set, and
// only when they are whole numbers rather than data elements.
const pingInterval = (min, max, minMessage, maxMessage) =>
  when(
    (value, ctx) => {
      const { channel, playerName } = parentOf(ctx);
      return Boolean(channel && playerName) && /^\d+$/.test(String(value));
    },
    all(
      rule((value) => Number(value) >= min, minMessage),
      rule((value) => Number(value) <= max, maxMessage),
    ),
  );

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
  instanceValidationSchema: shape({
    streamingMedia: when(
      (value, ctx) => ctx.root.components?.streamingMedia === true,
      shape({
        channel: rule(
          (value, ctx) => !parentOf(ctx).playerName || !isEmpty(value),
          "Please provide a channel name for streaming media.",
        ),
        playerName: rule(
          (value, ctx) => !parentOf(ctx).channel || !isEmpty(value),
          "Please provide a player name for streaming media.",
        ),
        adPingInterval: pingInterval(
          1,
          10,
          "The Ad Ping Interval must be greater than 1 second.",
          "The Ad Ping Interval must be less than 10 seconds.",
        ),
        mainPingInterval: pingInterval(
          10,
          60,
          "The Main Ping Interval must be greater than 10 seconds.",
          "The Main Ping Interval must be less than 60 seconds.",
        ),
      }),
    ),
  }),
};

const StreamingMediaSection = ({ instanceFieldName }) => {
  const mediaChannel = useFieldValue(
    `${instanceFieldName}.streamingMedia.channel`,
  );
  const playerName = useFieldValue(
    `${instanceFieldName}.streamingMedia.playerName`,
  );
  const streamingMediaComponentEnabled = useFieldValue(
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
          <FormTextField
            data-test-id="mediaChannelField"
            label="Channel"
            name={`${instanceFieldName}.streamingMedia.channel`}
            description="Distribution station/channels or where the content is played. Any string value is accepted here."
            width="size-5000"
            isRequired={mediaRequiredFieldsProvided()}
          />
          <FormTextField
            data-test-id="mediaPlayerNameField"
            label="Player Name"
            name={`${instanceFieldName}.streamingMedia.playerName`}
            description="The streaming media player name that will be used in every media session."
            width="size-5000"
            isRequired={mediaRequiredFieldsProvided()}
          />
          <FormTextField
            data-test-id="mediaVersionField"
            label="Application version"
            name={`${instanceFieldName}.streamingMedia.appVersion`}
            description="The SDK version used by the player. This could have any custom value that makes sense for your player."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
          <FormNumberField
            data-test-id="mediaMainPingIntervalField"
            label="Main ping interval"
            name={`${instanceFieldName}.streamingMedia.mainPingInterval`}
            description="The ping interval frequency (in seconds) for main content."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
          <FormNumberField
            data-test-id="mediaAdPingIntervalField"
            label="Ad ping interval"
            name={`${instanceFieldName}.streamingMedia.adPingInterval`}
            description="The ping interval frequency (in seconds) for ad content."
            width="size-5000"
            isDisabled={!mediaRequiredFieldsProvided()}
          />
        </FormElementContainer>
      ) : (
        <InfoMessage
          title="Streaming media component disabled"
          styles={style({ width: 480 })}
        >
          The streaming media custom build component is disabled. Enable it
          above to configure streaming media settings.
        </InfoMessage>
      )}
    </>
  );
};

StreamingMediaSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default StreamingMediaSection;
