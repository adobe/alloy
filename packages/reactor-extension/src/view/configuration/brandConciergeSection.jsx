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

import PropTypes from "prop-types";
import { object, boolean, number } from "yup";
import { useField } from "formik";
import { View, InlineAlert, Content } from "@adobe/react-spectrum";
import SectionHeader from "../components/sectionHeader";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import FormikNumberField from "../components/formikReactSpectrum3/formikNumberField";
import FormElementContainer from "../components/formElementContainer";
import Heading from "../components/typography/heading";
import BetaBadge from "../components/betaBadge";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";

const STREAM_TIMEOUT_MS = 10000;
const STREAM_TIMEOUT_SECONDS = STREAM_TIMEOUT_MS / 1000;

const getDefaultSettings = () => ({
  conversation: {
    stickyConversationSession: false,
    streamTimeout: STREAM_TIMEOUT_SECONDS,
  },
});

export const bridge = {
  getInstanceDefaults: () => ({
    conversation: getDefaultSettings(),
  }),

  getInitialInstanceValues: ({ instanceSettings }) => {
    const conversation = {};

    copyPropertiesWithDefaultFallback({
      toObj: conversation,
      fromObj: instanceSettings.conversation || {},
      defaultsObj: getDefaultSettings().conversation,
      keys: ["stickyConversationSession"],
    });

    // Convert streamTimeout from milliseconds to seconds for display
    const streamTimeoutMs =
      instanceSettings.conversation?.streamTimeout ?? STREAM_TIMEOUT_MS;
    conversation.streamTimeout = streamTimeoutMs / 1000;

    return { conversation };
  },

  getInstanceSettings: ({ instanceValues, components }) => {
    const instanceSettings = {};

    if (components.brandConcierge && instanceValues.conversation) {
      const conversation = {};

      copyPropertiesIfValueDifferentThanDefault({
        toObj: conversation,
        fromObj: instanceValues.conversation,
        defaultsObj: getDefaultSettings().conversation,
        keys: ["stickyConversationSession"],
      });

      // Convert streamTimeout from seconds to milliseconds for storage
      const streamTimeoutSeconds =
        instanceValues.conversation.streamTimeout ?? STREAM_TIMEOUT_SECONDS;
      const streamTimeoutMs = streamTimeoutSeconds * 1000;

      if (streamTimeoutMs !== STREAM_TIMEOUT_MS) {
        conversation.streamTimeout = streamTimeoutMs;
      }

      if (Object.keys(conversation).length > 0) {
        instanceSettings.conversation = conversation;
      }
    }

    return instanceSettings;
  },

  instanceValidationSchema: object().shape({
    conversation: object().when("$components.brandConcierge", {
      is: true,
      then: (conciergeSchema) =>
        conciergeSchema.shape({
          stickyConversationSession: boolean(),
          streamTimeout: number()
            .min(10, "The stream timeout must be at least 10 seconds.")
            .default(STREAM_TIMEOUT_SECONDS),
        }),
    }),
  }),
};

const BrandConciergeSection = ({ instanceFieldName }) => {
  const [{ value: brandConciergeComponentEnabled }] = useField(
    "components.brandConcierge",
  );

  if (!brandConciergeComponentEnabled) {
    return (
      <>
        <SectionHeader>
          Brand Concierge <BetaBadge />
        </SectionHeader>
        <View width="size-6000">
          <InlineAlert variant="info">
            <Heading>Brand Concierge component disabled</Heading>
            <Content>
              The Brand Concierge custom build component is disabled. Enable it
              above to configure Brand Concierge settings.
            </Content>
          </InlineAlert>
        </View>
      </>
    );
  }

  return (
    <>
      <SectionHeader>
        Brand Concierge <BetaBadge />
      </SectionHeader>
      <FormElementContainer>
        <FormikCheckbox
          data-test-id="stickyConversationSessionField"
          name={`${instanceFieldName}.conversation.stickyConversationSession`}
          description="Persist Adobe Brand Concierge sessions across page loads using a session cookie."
          width="size-5000"
        >
          Sticky conversation session
        </FormikCheckbox>
        <FormikNumberField
          data-test-id="streamTimeoutDataTestId"
          label="Stream timeout (seconds)"
          name={`${instanceFieldName}.conversation.streamTimeout`}
          description="If the conversation stream chunks are not returned within this timeout duration, a timeout error will be triggered."
          width="size-5000"
        />
      </FormElementContainer>
    </>
  );
};

BrandConciergeSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default BrandConciergeSection;
