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
import { object, boolean, number, string, array } from "yup";
import { useField, FieldArray } from "formik";
import {
  View,
  InlineAlert,
  Content,
  Flex,
  Button,
  ActionButton,
  Radio,
} from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import SectionHeader from "../components/sectionHeader";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import FormikNumberField from "../components/formikReactSpectrum3/formikNumberField";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../components/dataElementSelector";
import FormElementContainer from "../components/formElementContainer";
import Heading from "../components/typography/heading";
import BetaBadge from "../components/betaBadge";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";

const STREAM_TIMEOUT_MS = 10000;
const STREAM_TIMEOUT_SECONDS = STREAM_TIMEOUT_MS / 1000;

// Whether transferCookies is entered as individual cookie names (FORM) or as a
// single data element that resolves to the whole array (DATA_ELEMENT).
const FORM = "form";
const DATA_ELEMENT = "dataElement";

const TRANSFER_COOKIES_DESCRIPTION =
  "Additional first-party cookie names to always transfer to Brand Concierge conversation requests, in addition to the ones transferred by default.";

const getDefaultSettings = () => ({
  conversation: {
    region: "",
    stickyConversationSession: false,
    streamTimeout: STREAM_TIMEOUT_SECONDS,
    collectSources: false,
    // Seed one empty field so the UI always renders at least one transfer
    // cookie input. An untouched empty field is trimmed and dropped in
    // getInstanceSettings, so this does not emit a transferCookies setting.
    transferCookies: [""],
    // Form-only state: not persisted to settings. transferCookies is stored as
    // an array (FORM) or as a data element string (DATA_ELEMENT).
    transferCookiesInputMethod: FORM,
    transferCookiesDataElement: "",
  },
});

export const bridge = {
  // getDefaultSettings already returns the { conversation: {...} } instance
  // shape, so return it directly. Wrapping it again would double-nest under
  // conversation.conversation and the fields would never reach the form.
  getInstanceDefaults: () => getDefaultSettings(),

  getInitialInstanceValues: ({ instanceSettings }) => {
    const conversation = {};

    copyPropertiesWithDefaultFallback({
      toObj: conversation,
      fromObj: instanceSettings.conversation || {},
      defaultsObj: getDefaultSettings().conversation,
      keys: ["region", "stickyConversationSession", "collectSources"],
    });

    // Convert streamTimeout from milliseconds to seconds for display
    const streamTimeoutMs =
      instanceSettings.conversation?.streamTimeout ?? STREAM_TIMEOUT_MS;
    conversation.streamTimeout = streamTimeoutMs / 1000;

    // transferCookies is stored either as an array of cookie names, or as a
    // single data element string that resolves to the whole array. Pick the
    // input method from the stored shape, and always keep at least one empty
    // field for the individual-cookie view.
    const savedTransferCookies = instanceSettings.conversation?.transferCookies;
    if (typeof savedTransferCookies === "string") {
      conversation.transferCookiesInputMethod = DATA_ELEMENT;
      conversation.transferCookiesDataElement = savedTransferCookies;
      conversation.transferCookies = [""];
    } else {
      conversation.transferCookiesInputMethod = FORM;
      conversation.transferCookiesDataElement = "";
      conversation.transferCookies =
        Array.isArray(savedTransferCookies) && savedTransferCookies.length > 0
          ? savedTransferCookies
          : [""];
    }

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
        keys: ["region", "stickyConversationSession", "collectSources"],
      });

      // Convert streamTimeout from seconds to milliseconds for storage
      const streamTimeoutSeconds =
        instanceValues.conversation.streamTimeout ?? STREAM_TIMEOUT_SECONDS;
      const streamTimeoutMs = streamTimeoutSeconds * 1000;

      if (streamTimeoutMs !== STREAM_TIMEOUT_MS) {
        conversation.streamTimeout = streamTimeoutMs;
      }

      if (
        instanceValues.conversation.transferCookiesInputMethod === DATA_ELEMENT
      ) {
        // Store the whole array as a single data element string.
        const dataElement = (
          instanceValues.conversation.transferCookiesDataElement || ""
        ).trim();
        if (dataElement) {
          conversation.transferCookies = dataElement;
        }
      } else {
        // Trim and drop any empty cookie names before saving.
        const transferCookies = (
          instanceValues.conversation.transferCookies || []
        )
          .map((cookieName) => cookieName.trim())
          .filter((cookieName) => cookieName.length > 0);
        if (transferCookies.length > 0) {
          conversation.transferCookies = transferCookies;
        }
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
          region: string().test(
            "valid-region",
            "Please enter a valid region (e.g. va7, or2, irl1).",
            (value) => !value || /^[a-z]{2,4}[0-9]{1,2}$/i.test(value),
          ),
          stickyConversationSession: boolean(),
          streamTimeout: number()
            .min(10, "The stream timeout must be at least 10 seconds.")
            .default(STREAM_TIMEOUT_SECONDS),
          collectSources: boolean(),
          transferCookies: array().of(string()),
          transferCookiesInputMethod: string(),
          transferCookiesDataElement: string().when(
            "transferCookiesInputMethod",
            {
              is: DATA_ELEMENT,
              then: (schema) =>
                schema.matches(
                  singleDataElementRegex,
                  "Please provide a single data element, for example %myDataElement%.",
                ),
            },
          ),
        }),
    }),
  }),
};

const BrandConciergeSection = ({ instanceFieldName }) => {
  const [{ value: brandConciergeComponentEnabled }] = useField(
    "components.brandConcierge",
  );
  const [{ value: transferCookies = [] }] = useField(
    `${instanceFieldName}.conversation.transferCookies`,
  );
  const [{ value: transferCookiesInputMethod }] = useField(
    `${instanceFieldName}.conversation.transferCookiesInputMethod`,
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
        <FormikTextField
          data-test-id="regionField"
          label="Region"
          name={`${instanceFieldName}.conversation.region`}
          description="The Brand Concierge region (e.g. va7, or2, irl1). Leave blank to use the default region."
          width="size-5000"
        />
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
        <FormikCheckbox
          data-test-id="collectSourcesDataTestId"
          label=""
          name={`${instanceFieldName}.conversation.collectSources`}
          description="Collects the sources if a user navigated to the page from a Brand Concierge conversation link click."
          width="size-5000"
        >
          Collect sources
        </FormikCheckbox>
        <View data-test-id="transferCookiesField">
          <FormikRadioGroup
            label="Transfer cookies"
            name={`${instanceFieldName}.conversation.transferCookiesInputMethod`}
            orientation="horizontal"
          >
            <Radio data-test-id="transferCookiesIndividualOption" value={FORM}>
              Specify each cookie individually
            </Radio>
            <Radio
              data-test-id="transferCookiesDataElementOption"
              value={DATA_ELEMENT}
            >
              Use a whole data element
            </Radio>
          </FormikRadioGroup>
          {transferCookiesInputMethod === DATA_ELEMENT ? (
            <DataElementSelector>
              <FormikTextField
                data-test-id="transferCookiesDataElementField"
                aria-label="Transfer cookies data element"
                name={`${instanceFieldName}.conversation.transferCookiesDataElement`}
                description={TRANSFER_COOKIES_DESCRIPTION}
                width="size-5000"
              />
            </DataElementSelector>
          ) : (
            <FieldArray
              name={`${instanceFieldName}.conversation.transferCookies`}
              render={(arrayHelpers) => (
                <Flex direction="column" gap="size-100">
                  {transferCookies.map((cookieName, index) => (
                    <Flex key={index} alignItems="start">
                      <DataElementSelector>
                        <FormikTextField
                          data-test-id={`transferCookie${index}Field`}
                          aria-label={`Transfer cookie ${index + 1}`}
                          name={`${instanceFieldName}.conversation.transferCookies.${index}`}
                          description={
                            index === transferCookies.length - 1
                              ? TRANSFER_COOKIES_DESCRIPTION
                              : undefined
                          }
                          width="size-4600"
                        />
                      </DataElementSelector>
                      <ActionButton
                        data-test-id={`deleteTransferCookie${index}Button`}
                        isQuiet
                        variant="secondary"
                        isDisabled={transferCookies.length <= 1}
                        onPress={() => {
                          arrayHelpers.remove(index);
                        }}
                        aria-label={`Remove transfer cookie ${index + 1}`}
                        marginStart="size-100"
                      >
                        <Delete />
                      </ActionButton>
                    </Flex>
                  ))}
                  <Button
                    variant="secondary"
                    data-test-id="addTransferCookieButton"
                    marginTop="size-100"
                    alignSelf="start"
                    onPress={() => {
                      arrayHelpers.push("");
                    }}
                  >
                    Add cookie
                  </Button>
                </Flex>
              )}
            />
          )}
        </View>
      </FormElementContainer>
    </>
  );
};

BrandConciergeSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default BrandConciergeSection;
