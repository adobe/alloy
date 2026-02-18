/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  Item,
  InlineAlert,
  Heading,
  Content,
  Link,
  Flex,
  View,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import { useState } from "react";
import PropTypes from "prop-types";
import UserReportableError from "../../../errors/userReportableError";
import fetchSandboxes from "../../../utils/fetchSandboxes";
import fetchSchema from "../../../utils/fetchSchema";
import fetchSchemasMeta from "../../../utils/fetchSchemasMeta";
import FormikPicker from "../../../components/formikReactSpectrum3/formikPicker";
import FormikPagedComboBox from "../../../components/formikReactSpectrum3/formikPagedComboBox";
import FieldSubset from "../../../components/fieldSubset";
import FormElementContainer from "../../../components/formElementContainer";
import RefreshButton from "../../../components/refreshButton";
import { DATA } from "../constants/variableTypes";

const initializeSandboxes = async ({
  initialValues,
  context,
  settings: { sandbox: { name: sandbox } = {} },
  orgId,
  imsAccess,
}) => {
  const { results: sandboxes } = await fetchSandboxes({ orgId, imsAccess });

  if (!(sandboxes && sandboxes.length)) {
    throw new UserReportableError(
      "You do not have access to any sandboxes. Please contact your administrator to be assigned appropriate rights.",
      {
        additionalInfoUrl: "https://adobe.ly/3gHkqLF",
      },
    );
  }

  if (sandbox && !sandboxes.find((s) => s.name === sandbox)) {
    // Previously selected sandbox not found; clear so the user can select a new one
    initialValues.sandbox = "";
    context.missingSavedSandbox = true;
  }
  context.sandboxes = sandboxes;
  // Auto select a sandbox in some cases
  if (!initialValues.sandbox) {
    const defaultSandbox =
      (sandboxes.length === 1 && sandboxes[0]) ||
      sandboxes.find(({ isDefault }) => isDefault);
    if (defaultSandbox) {
      initialValues.sandbox = defaultSandbox.name;
    }
  }
};

const initializeSelectedSchema = async ({
  initialValues,
  settings: {
    sandbox: { name: sandbox } = {},
    schema: { id: schemaId, version: schemaVersion } = {},
  },
  orgId,
  imsAccess,
  context,
}) => {
  if (schemaId && schemaVersion && sandbox) {
    try {
      const { $id, title, version } = await fetchSchema({
        orgId,
        imsAccess,
        schemaId,
        schemaVersion,
        sandboxName: sandbox,
      });
      initialValues.schema = { $id, title, version };
      return;
    } catch {
      // Previously selected schema not found; allow user to pick a new one
      initialValues.schema = null;
      context.missingSavedSchema = true;
      return;
    }
  }
  initialValues.schema = null;
};

const initializeSchemas = async ({
  initialValues,
  settings: { schema: { id: schemaId } = {} },
  context,
  orgId,
  imsAccess,
}) => {
  if (initialValues.sandbox) {
    try {
      const { results: schemasFirstPage, nextPage: schemasFirstPageCursor } =
        await fetchSchemasMeta({
          orgId,
          imsAccess,
          sandboxName: initialValues.sandbox,
        });

      context.schemasFirstPage = schemasFirstPage;
      context.schemasFirstPageCursor = schemasFirstPageCursor;
      if (!schemaId && schemasFirstPage.length === 1) {
        initialValues.schema = schemasFirstPage[0];
      }
    } catch {
      context.schemasFirstPage = [];
      context.schemasFirstPageCursor = null;
    }
  }
};

export const bridge = {
  async getInitialValues({ initInfo, context }) {
    const {
      company: { orgId },
      tokens: { imsAccess },
    } = initInfo;
    const settings = initInfo.settings || {};

    const initialValues = {
      sandbox: settings.sandbox?.name || "",
    };

    const args = {
      initialValues,
      context,
      settings,
      orgId,
      imsAccess,
    };

    await initializeSandboxes(args);
    await Promise.all([
      initializeSelectedSchema(args),
      initializeSchemas(args),
    ]);

    return initialValues;
  },
  getSettings({ values }) {
    const { sandbox, schema, type } = values;

    if (type === DATA) {
      return {};
    }

    return {
      sandbox: { name: sandbox },
      schema: {
        id: schema?.$id,
        version: schema?.version,
      },
    };
  },
  validateFormikState: ({ type, sandbox, schema }) => {
    const result = {};

    if (type === DATA) {
      return result;
    }

    if (!sandbox) {
      result.sandbox = "Please select a sandbox.";
    }

    if (!schema || Object.keys(schema).length === 0) {
      result.schema = "Please select a schema.";
    }

    return result;
  },
};

const getKey = (item) => item && `${item.$id}_${item.version}`;
const getLabel = (item) => item?.title;

const XdmVariable = ({
  context: {
    sandboxes,
    schemasFirstPage,
    schemasFirstPageCursor,
    missingSavedSandbox,
    missingSavedSchema,
  },
  initInfo,
}) => {
  const {
    company: { orgId },
    tokens: { imsAccess },
  } = initInfo;

  const [{ value: sandbox }] = useField("sandbox");
  const [schemasData, setSchemasData] = useState({
    firstPage: schemasFirstPage,
    firstPageCursor: schemasFirstPageCursor,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadItems = async ({ filterText, cursor, signal }) => {
    try {
      const { results, nextPage } = await fetchSchemasMeta({
        orgId,
        imsAccess,
        sandboxName: sandbox,
        search: filterText,
        start: cursor,
        signal,
      });
      return {
        items: results,
        cursor: nextPage,
      };
    } catch (e) {
      if (e.name === "AbortError") {
        throw e;
      }
      return {
        items: [],
        cursor: null,
      };
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshSchemas = () => {
    setIsRefreshing(true);
    setSchemasData({
      firstPage: [],
      firstPageCursor: null,
    });
  };

  return (
    <FieldSubset>
      <FormElementContainer>
        <Content>
          <Link
            href="https://experience.adobe.com/#/data-collection/platform/workflow/schema-create"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create a schema
          </Link>
          {" ("}
          <Link
            href="https://experience.adobe.com/#/data-collection/platform/workflow/ml-schema-create"
            target="_blank"
            rel="noopener noreferrer"
          >
            with ML assistance
          </Link>
          {") "}
          first, or choose an existing one below.
        </Content>
        {(missingSavedSandbox || missingSavedSchema) && (
          <InlineAlert
            variant="notice"
            width="size-5000"
            marginBottom="size-200"
            data-test-id="schemaMissingAlert"
          >
            <Heading size="XXS">Could not load saved configuration</Heading>
            <Content>
              The previously saved sandbox or schema could not be retrieved. You
              can cancel to keep this data element configured as before, or
              choose a new sandbox and schema.
            </Content>
          </InlineAlert>
        )}
        <FormikPicker
          data-test-id="sandboxField"
          name="sandbox"
          label="Sandbox"
          items={sandboxes}
          width="size-5000"
          description="Choose a sandbox containing the schema you wish to use."
          placeholder={
            missingSavedSandbox
              ? "Saved sandbox unavailable"
              : "Select a sandbox"
          }
        >
          {(item) => {
            const region = item.region ? ` (${item.region.toUpperCase()})` : "";
            const label = `${item.type.toUpperCase()} ${item.title}${region}`;
            return <Item key={item.name}>{label}</Item>;
          }}
        </FormikPicker>

        {sandbox && (
          <Flex direction="row" gap="size-100">
            <View>
              <FormikPagedComboBox
                data-test-id="schemaField"
                name="schema"
                label="Schema"
                width="size-5000"
                description="Choose an XDM schema for this variable."
                loadItems={loadItems}
                getKey={getKey}
                getLabel={getLabel}
                dependencies={[sandbox, isRefreshing]}
                firstPage={schemasData.firstPage}
                firstPageCursor={schemasData.firstPageCursor}
                alertTitle="No schemas found"
                alertDescription="No schemas were found in this sandbox. Please add a schema first or choose a sandbox with at least one schema."
                placeholder={
                  missingSavedSchema
                    ? "Saved schema unavailable"
                    : "Select a schema"
                }
              />
            </View>
            <Flex direction="row" marginTop="size-300">
              <RefreshButton
                onPress={handleRefreshSchemas}
                isDisabled={isRefreshing}
                tooltipText="Refresh schema list"
                ariaLabel="Refresh schemas"
              />
            </Flex>
          </Flex>
        )}
      </FormElementContainer>
    </FieldSubset>
  );
};

XdmVariable.propTypes = {
  initInfo: PropTypes.object,
  context: PropTypes.object,
};

export default XdmVariable;
