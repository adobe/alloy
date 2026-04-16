/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  ProgressCircle,
  Flex,
  Switch,
  InlineAlert,
  Heading,
  Content,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import { object, string } from "yup";
import FormElementContainer from "../components/formElementContainer";
import ExtensionView from "../components/extensionView";
import validate from "../components/objectEditor/helpers/validate";
import Editor from "../components/objectEditor/editor";
import useChanged from "../utils/useChanged";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import FormikPagedComboBox from "../components/formikReactSpectrum3/formikPagedComboBox";
import DEFAULT_SANDBOX_NAME from "../components/objectEditor/constants/defaultSandboxName";
import fetchSandboxes from "../utils/fetchSandboxes";
import fetchSchemasMeta from "../utils/fetchSchemasMeta";
import fetchSchema from "../utils/fetchSchema";

import getInitialFormState from "../components/objectEditor/helpers/getInitialFormState";
import getValueFromFormState from "../components/objectEditor/helpers/getValueFromFormState";
import UserReportableError from "../errors/userReportableError";
import sandboxItems from "../components/sandboxItems";
import useAbortPreviousRequestsAndCreateSignal from "../utils/useAbortPreviousRequestsAndCreateSignal";

const initializeSandboxes = async ({
  context,
  initialValues,
  sandboxName,
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

  if (sandboxName && !sandboxes.find((s) => s.name === sandboxName)) {
    // Previously used sandbox no longer exists; clear it so the user can select a new one
    initialValues.sandboxName = "";
    context.missingSavedSandbox = true;
  }

  if (!initialValues.sandboxName) {
    let defaultSandbox;
    defaultSandbox = sandboxes.find((sandbox) => sandbox.isDefault);
    if (!defaultSandbox && sandboxes.length === 1) {
      defaultSandbox = sandboxes[0];
    }
    if (defaultSandbox) {
      initialValues.sandboxName = defaultSandbox.name;
    }
  }

  context.sandboxes = sandboxes;
};

const initializeSelectedSchema = async ({
  initialValues,
  schemaId,
  schemaVersion,
  context,
  orgId,
  imsAccess,
}) => {
  try {
    const { sandboxName } = initialValues;
    if (schemaId && schemaVersion && sandboxName) {
      const schema = await fetchSchema({
        orgId,
        imsAccess,
        schemaId,
        schemaVersion,
        sandboxName,
      });
      const { $id, title, version } = schema;
      initialValues.selectedSchema = { $id, title, version };
      context.schema = schema;
      return;
    }
  } catch {
    // Previously selected schema cannot be found; clear it so the user can choose a new one
    initialValues.selectedSchema = null;
    context.schema = null;
    context.missingSavedSchema = true;
    return;
  }
  initialValues.selectedSchema = null;
};

const initializeSchemas = async ({
  initialValues,
  context,
  orgId,
  imsAccess,
}) => {
  const { sandboxName } = initialValues;
  let schemasFirstPage;
  let schemasFirstPageCursor;
  try {
    ({ results: schemasFirstPage, nextPage: schemasFirstPageCursor } =
      await fetchSchemasMeta({
        orgId,
        imsAccess,
        sandboxName,
      }));
  } catch {
    schemasFirstPage = [];
    schemasFirstPageCursor = null;
  }

  if (schemasFirstPage.length === 1 && !schemasFirstPageCursor) {
    const { $id, title, version } = schemasFirstPage[0];
    initialValues.selectedSchema = { $id, title, version };

    try {
      const schema = await fetchSchema({
        orgId,
        imsAccess,
        schemaId: $id,
        schemaVersion: version,
        sandboxName,
      });
      context.schema = schema;
    } catch {
      initialValues.selectedSchema = null;
      context.schema = null;
      context.missingSavedSchema = true;
    }
  }

  context.schemasFirstPage = schemasFirstPage;
  context.schemasFirstPageCursor = schemasFirstPageCursor;
};

const getInitialValues =
  (context) =>
  async ({ initInfo }) => {
    const {
      company: { orgId },
      tokens: { imsAccess },
    } = initInfo;
    const {
      sandbox: { name: sandboxName } = {},
      schema: { id: schemaId, version: schemaVersion } = {},
      data = {},
    } = initInfo.settings || {};

    const initialValues = {
      sandboxName: sandboxName || "",
    };

    // settings.sandbox may not exist because sandboxes were introduced sometime
    // after the XDM Object data element type was released to production. For
    // this reason, we have to check to see if settings.sandbox exists. When
    // Platform added support for sandboxes, they moved all existing schemas
    // to a default "prod" sandbox, which is why we can fall back to
    // DEFAULT_SANDBOX_NAME here.
    if (schemaId && schemaVersion && !sandboxName) {
      initialValues.sandboxName = DEFAULT_SANDBOX_NAME;
    }

    const args = {
      initialValues,
      context,
      sandboxName,
      schemaId,
      schemaVersion,
      orgId,
      imsAccess,
    };

    await initializeSandboxes(args);
    await Promise.all([
      initializeSelectedSchema(args),
      initializeSchemas(args),
    ]);

    if (context.schema) {
      const initialFormState = getInitialFormState({
        schema: context.schema,
        value: data,
      });
      Object.assign(initialValues, initialFormState);
    }
    return initialValues;
  };

const getSettings =
  (context) =>
  ({ values }) => {
    const { sandboxName, selectedSchema } = values || {};

    return {
      sandbox: {
        name: sandboxName,
      },
      schema: {
        id: selectedSchema?.$id,
        version: selectedSchema?.version,
      },
      data: context.schema
        ? getValueFromFormState({
            formStateNode: { ...values, schema: context.schema },
          }) || {}
        : {},
    };
  };

const formikStateValidationSchema = object().shape({
  sandboxName: string().required("Please select a sandbox."),
  selectedSchema: object().nullable().required("Please select a schema."),
});

const validateFormikState =
  (context) =>
  ({ values }) => {
    // We can't and don't need to do validation on the formik values
    // if the editor isn't even renderable. validateNonFormikState
    // will ensure that the view is properly marked invalid in this
    // case.
    const { schema } = context;
    if (!schema) {
      return {};
    }

    return validate(values);
  };

const validateNonFormikState = (context) => () => {
  const { schema } = context;
  if (!schema) {
    context.showEditorNotReadyValidationError = true;
    return false;
  }
  return true;
};

const getSchemaKey = (item) => item && `${item.$id}_${item.version}`;
const getSchemaLabel = (item) => item?.title;

const XdmObject = ({ initInfo, context, formikProps }) => {
  const {
    company: { orgId },
    tokens: { imsAccess },
  } = initInfo;
  const settings = initInfo.settings || {};
  const { resetForm, values } = formikProps;

  const { sandboxes, schema, schemasFirstPage, schemasFirstPageCursor } =
    context;

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hasSchema, setHasSchema] = useState(schema != null);
  const [showDisplayNames, setShowDisplayNames] = useState(false);

  const abortPreviousRequestsAndCreateSignal =
    useAbortPreviousRequestsAndCreateSignal();

  const [{ value: selectedSandboxName }] = useField("sandboxName");
  const [{ value: selectedSchema }, , { setValue: setSelectedSchema }] =
    useField("selectedSchema");

  useChanged(() => {
    setHasSchema(false);
    context.schema = null;
    setSelectedNodeId(null);
    setSelectedSchema(null);
    context.missingSavedSandbox = false;
    context.missingSavedSchema = false;
  }, [selectedSandboxName]);

  useChanged(() => {
    async function setNewSchema() {
      setHasSchema(false);
      context.schema = null;
      setSelectedNodeId(null);

      const signal = abortPreviousRequestsAndCreateSignal();
      const newSchema = await fetchSchema({
        orgId,
        imsAccess,
        schemaId: selectedSchema.$id,
        schemaVersion: selectedSchema.version,
        sandboxName: selectedSandboxName,
        signal,
      });
      if (newSchema) {
        context.schema = newSchema;
        const initialFormState = getInitialFormState(
          values && values.schema
            ? {
                schema: newSchema,
                existingFormStateNode: values,
              }
            : {
                schema: newSchema,
                value: settings?.data,
              },
        );
        resetForm({
          values: {
            ...initialFormState,
            selectedSchema,
            sandboxName: selectedSandboxName,
          },
        });
        setHasSchema(true);
      }
    }

    setNewSchema();
    context.missingSavedSandbox = false;
    context.missingSavedSchema = false;
  }, [selectedSchema?.$id]);

  const loadSchemas = async ({ filterText, cursor, signal }) => {
    let results;
    let nextPage;
    try {
      ({ results, nextPage } = await fetchSchemasMeta({
        orgId,
        imsAccess,
        sandboxName: selectedSandboxName,
        search: filterText,
        start: cursor,
        signal,
      }));
    } catch (e) {
      if (e.name === "AbortError") {
        // usePagedComboBox expects us to throw an error
        // if we can't produce a valid return object.
        throw e;
      }
      results = [];
      nextPage = null;
    }
    return {
      items: results,
      cursor: nextPage,
    };
  };

  let editorAreaContent = null;

  if (selectedSchema && !hasSchema) {
    editorAreaContent = (
      <Flex alignItems="center" justifyContent="center" height="size-2000">
        <ProgressCircle size="L" aria-label="Loading..." isIndeterminate />
      </Flex>
    );
  } else if (hasSchema) {
    editorAreaContent = (
      <Editor
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        schema={schema}
        previouslySavedSchemaInfo={settings && settings.schema}
        componentName="XDM object data element"
        showDisplayNames={showDisplayNames}
      />
    );
  }

  return (
    <div>
      <FormElementContainer>
        <Flex alignItems="center" gap="size-100" marginBottom="size-200">
          <Switch
            isSelected={showDisplayNames}
            onChange={setShowDisplayNames}
            data-test-id="displayNamesSwitch"
          >
            Show display names for fields
          </Switch>
        </Flex>
        {(context.missingSavedSandbox || context.missingSavedSchema) && (
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
          label="Sandbox"
          name="sandboxName"
          data-test-id="sandboxField"
          description="Choose a sandbox containing the schema you wish to use."
          items={sandboxes}
          width="size-5000"
          placeholder={
            context.missingSavedSandbox
              ? "Saved sandbox unavailable"
              : "Select a sandbox"
          }
        >
          {sandboxItems}
        </FormikPicker>

        <FormikPagedComboBox
          data-test-id="schemaField"
          name="selectedSchema"
          label="Schema"
          width="size-5000"
          loadItems={loadSchemas}
          getKey={getSchemaKey}
          getLabel={getSchemaLabel}
          dependencies={[selectedSandboxName]}
          firstPage={schemasFirstPage}
          firstPageCursor={schemasFirstPageCursor}
          alertTitle="No schemas found"
          alertDescription="No schemas were found in this sandbox. Please add a schema first or choose a sandbox with at least one schema."
          placeholder={
            context.missingSavedSchema
              ? "Saved schema unavailable"
              : "Select a schema"
          }
        />
      </FormElementContainer>
      {editorAreaContent}
    </div>
  );
};

XdmObject.propTypes = {
  initInfo: PropTypes.object,
  formikProps: PropTypes.object,
  context: PropTypes.object,
};

const XdmObjectView = () => {
  const { current: context } = useRef({});

  return (
    <ExtensionView
      getInitialValues={getInitialValues(context)}
      getSettings={getSettings(context)}
      formikStateValidationSchema={formikStateValidationSchema}
      validateFormikState={validateFormikState(context)}
      validateNonFormikState={validateNonFormikState(context)}
      render={({ initInfo, formikProps }) => {
        return (
          <XdmObject
            initInfo={initInfo}
            formikProps={formikProps}
            context={context}
          />
        );
      }}
    />
  );
};

export default XdmObjectView;
