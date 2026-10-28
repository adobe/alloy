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
import { Link, Content, InlineAlert, Heading } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { object, string } from "yup";
import SectionHeader from "../components/sectionHeader";
import FormElementContainer from "../components/formElementContainer";
import DatastreamField from "../components/datastreamField";
import { useFieldValue } from "../utils/useFieldValue";

const ENVIRONMENT_FIELDS = [
  {
    environment: "production",
    idKey: "edgeConfigId",
    sandboxKey: "sandbox",
  },
  {
    environment: "staging",
    idKey: "stagingEdgeConfigId",
    sandboxKey: "stagingSandbox",
  },
  {
    environment: "development",
    idKey: "developmentEdgeConfigId",
    sandboxKey: "developmentSandbox",
  },
];

const SETTINGS_KEYS = ENVIRONMENT_FIELDS.flatMap(({ idKey, sandboxKey }) => [
  idKey,
  sandboxKey,
]);

export const bridge = {
  getInstanceDefaults: () =>
    Object.fromEntries(SETTINGS_KEYS.map((key) => [key, ""])),
  getInitialInstanceValues: ({ instanceSettings }) =>
    Object.fromEntries(
      SETTINGS_KEYS.map((key) => [key, instanceSettings[key] ?? ""]),
    ),
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};
    ENVIRONMENT_FIELDS.forEach(({ idKey, sandboxKey }) => {
      if (instanceValues[idKey]) {
        instanceSettings[idKey] = instanceValues[idKey];
        if (instanceValues[sandboxKey]) {
          instanceSettings[sandboxKey] = instanceValues[sandboxKey];
        }
      }
    });
    return instanceSettings;
  },
  instanceValidationSchema: object()
    .shape({
      edgeConfigId: string().required("Please specify a datastream."),
    })
    // TestCafe doesn't allow this to be an arrow function because of
    // how it scopes "this".
    .test("uniqueEdgeConfigId", function (instance, testContext) {
      const { path: instancePath, parent: instances } = testContext;
      const { edgeConfigId } = instance;

      if (!edgeConfigId) {
        return true;
      }

      const firstInstanceWithSameEdgeConfigId = instances.find(
        (candidateInstance) => candidateInstance.edgeConfigId === edgeConfigId,
      );

      return (
        firstInstanceWithSameEdgeConfigId === instance ||
        this.createError({
          path: `${instancePath}.edgeConfigId`,
          message:
            "Please provide a value unique from those used for other instances.",
        })
      );
    }),
};

const EdgeConfigurationsSection = ({
  instanceFieldName,
  instanceIndex,
  initInfo,
  datastreamCatalog,
}) => {
  const instanceOrgId = useFieldValue(`${instanceFieldName}.orgId`);
  // Datastreams can only be listed for the user's active org, so suggesting
  // them for an instance configured for another org would be misleading.
  const catalog =
    instanceIndex === 0 || instanceOrgId === initInfo.company.orgId
      ? datastreamCatalog
      : { ...datastreamCatalog, groups: [], isLoading: false, error: null };
  const isCatalogUnavailable =
    !catalog.isLoading &&
    (Boolean(catalog.error) ||
      (catalog.groups.length > 0 &&
        catalog.groups.every((group) => group.error)));

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
        {isCatalogUnavailable && (
          <InlineAlert
            data-test-id="datastreamSuggestionsUnavailableAlert"
            variant="informative"
            styles={style({ width: 400 })}
          >
            <Heading>Datastream suggestions are unavailable</Heading>
            <Content>
              You can still enter datastream IDs or data elements. To choose
              datastreams from a list, see{" "}
              <Link
                href="https://experienceleague.adobe.com/docs/experience-platform/collection/permissions.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                data collection permission management
              </Link>
              .
            </Content>
          </InlineAlert>
        )}
        {ENVIRONMENT_FIELDS.map(({ environment, idKey, sandboxKey }) => (
          <DatastreamField
            key={environment}
            data-test-id={`${environment}DatastreamField`}
            name={`${instanceFieldName}.${idKey}`}
            sandboxName={`${instanceFieldName}.${sandboxKey}`}
            catalog={catalog}
            label={`${environment[0].toUpperCase()}${environment.slice(1)} datastream`}
            description={`Choose a datastream or enter its ID or a data element.${
              environment === "production"
                ? ""
                : " When empty, the production datastream is used."
            }`}
            isRequired={environment === "production"}
          />
        ))}
      </FormElementContainer>
    </>
  );
};

EdgeConfigurationsSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  instanceIndex: PropTypes.number.isRequired,
  initInfo: PropTypes.object.isRequired,
  datastreamCatalog: PropTypes.object.isRequired,
};

export default EdgeConfigurationsSection;
