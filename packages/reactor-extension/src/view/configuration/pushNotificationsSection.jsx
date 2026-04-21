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
import { object, string } from "yup";
import { useField } from "formik";
import { View, InlineAlert, Content, Link } from "@adobe/react-spectrum";
import SectionHeader from "../components/sectionHeader";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import Heading from "../components/typography/heading";
import BetaBadge from "../components/betaBadge";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";

const getDefaultSettings = () => ({
  vapidPublicKey: "",
  appId: "",
  trackingDatasetId: "",
});

export const bridge = {
  getInstanceDefaults: () => ({
    pushNotifications: getDefaultSettings(),
  }),

  getInitialInstanceValues: ({ instanceSettings }) => {
    const pushNotifications = {};
    copyPropertiesWithDefaultFallback({
      toObj: pushNotifications,
      fromObj: instanceSettings.pushNotifications || {},
      defaultsObj: getDefaultSettings(),
      keys: ["vapidPublicKey", "appId", "trackingDatasetId"],
    });

    return { pushNotifications };
  },

  getInstanceSettings: ({ instanceValues, components }) => {
    const instanceSettings = {};

    if (components.pushNotifications && instanceValues.pushNotifications) {
      const { pushNotifications } = instanceValues;
      const pushNotificationsSettings = {};

      copyPropertiesIfValueDifferentThanDefault({
        toObj: pushNotificationsSettings,
        fromObj: pushNotifications,
        defaultsObj: getDefaultSettings(),
        keys: ["vapidPublicKey", "appId", "trackingDatasetId"],
      });

      if (Object.keys(pushNotificationsSettings).length > 0) {
        instanceSettings.pushNotifications = pushNotificationsSettings;
      }
    }

    return instanceSettings;
  },

  instanceValidationSchema: object().shape({
    pushNotifications: object().when("$components.pushNotifications", {
      is: true,
      then: (schema) =>
        schema.shape({
          vapidPublicKey: string().required(
            "Please provide a VAPID public key.",
          ),
          appId: string().required("Please provide an Application ID."),
          trackingDatasetId: string().required(
            "Please provide a Tracking Dataset ID.",
          ),
        }),
    }),
  }),
};

const PushNotificationsSection = ({ instanceFieldName }) => {
  const [{ value: pushNotificationsComponentEnabled }] = useField(
    "components.pushNotifications",
  );

  if (!pushNotificationsComponentEnabled) {
    return (
      <>
        <SectionHeader>
          Push Notifications <BetaBadge />
        </SectionHeader>
        <View width="size-6000">
          <InlineAlert variant="info">
            <Heading>Push Notifications component disabled</Heading>
            <Content>
              The Push Notifications custom build component is disabled. Enable
              it above to configure push notification settings.
            </Content>
          </InlineAlert>
        </View>
      </>
    );
  }

  return (
    <>
      <SectionHeader>
        Push Notifications <BetaBadge />
      </SectionHeader>
      <Content width="size-5000" marginBottom="size-200">
        Push notifications require a service worker to function when your site
        isn&lsquo;t actively open. The service worker runs in the background and
        handles incoming notifications. See the documentation for{" "}
        <Link
          href="https://experienceleague.adobe.com/en/docs/experience-platform/collection/js/commands/configure/pushnotifications#install-the-service-worker"
          target="_blank"
          rel="noopener noreferrer"
        >
          installing the service worker JavaScript
        </Link>
        .
      </Content>
      <FormElementContainer>
        <DataElementSelector>
          <FormikTextField
            data-test-id="vapidPublicKeyField"
            label="VAPID Public Key"
            name={`${instanceFieldName}.pushNotifications.vapidPublicKey`}
            description="The VAPID public key for push notification authentication."
            width="size-5000"
            isRequired
          />
        </DataElementSelector>
      </FormElementContainer>
      <FormElementContainer>
        <DataElementSelector>
          <FormikTextField
            data-test-id="appIdField"
            label="Application ID"
            name={`${instanceFieldName}.pushNotifications.appId`}
            description="The App ID for push notification identification."
            width="size-5000"
            isRequired
          />
        </DataElementSelector>
      </FormElementContainer>
      <FormElementContainer>
        <DataElementSelector>
          <FormikTextField
            data-test-id="trackingDatasetIdField"
            label="Tracking Dataset ID"
            name={`${instanceFieldName}.pushNotifications.trackingDatasetId`}
            description="The Dataset ID for push notification tracking and analytics."
            width="size-5000"
            isRequired
          />
        </DataElementSelector>
      </FormElementContainer>
    </>
  );
};

PushNotificationsSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default PushNotificationsSection;
