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
import { object } from "yup";
import {
  Item,
  Flex,
  ProgressCircle,
  Heading,
  Divider,
  Text,
  InlineAlert,
  Content,
  Link,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";
import ExtensionView from "../components/extensionView";
import FormElementContainer from "../components/formElementContainer";
import CodeField from "../components/codeField";
import getValueFromFormState from "../components/objectEditor/helpers/getValueFromFormState";
import fetchDataElements from "../utils/fetchDataElements";
import fetchSchema from "../utils/fetchSchema";
import Editor from "../components/objectEditor/editor";
import getInitialFormState from "../components/objectEditor/helpers/getInitialFormState";
import FormikPagedComboBox from "../components/formikReactSpectrum3/formikPagedComboBox";
import useReportAsyncError from "../utils/useReportAsyncError";
import fetchDataElement from "../utils/fetchDataElement";
import useChanged from "../utils/useChanged";
import useAbortPreviousRequestsAndCreateSignal from "../utils/useAbortPreviousRequestsAndCreateSignal";
import generateSchemaFromSolutions from "../components/objectEditor/helpers/generateSchemaFromSolutions";
import validate from "../components/objectEditor/helpers/validate";
import { ARRAY, OBJECT } from "../components/objectEditor/constants/schemaType";
import isObjectJsonEditorEmpty from "../components/objectEditor/helpers/object-json/isEditorEmpty";
import isAnalyticsEditorEmpty from "../components/objectEditor/helpers/object-analytics/isEditorEmpty";
import {
  ADOBE_ANALYTICS,
  ADOBE_AUDIENCE_MANAGER,
  ADOBE_TARGET,
} from "../constants/solutions";
import deepAssign from "../utils/deepAssign";

const isDataVariable = (data) => data?.settings?.solutions?.length > 0;

const getInitialFormStateFromDataElement = async ({
  dataElement,
  context,
  orgId,
  imsAccess,
  transforms = {},
  data = {},
  existingFormStateNode,
  signal,
}) => {
  let value;
  if (context.originalData) {
    value = structuredClone(context.originalData);
    deepAssign(value, data);
  } else {
    value = data;
  }

  if (
    dataElement.settings &&
    dataElement.settings.schema &&
    dataElement.settings.schema.id &&
    dataElement.settings.schema.version &&
    dataElement.settings.sandbox &&
    dataElement.settings.sandbox.name
  ) {
    let schema;
    try {
      schema = await fetchSchema({
        orgId,
        imsAccess,
        schemaId: dataElement.settings.schema.id,
        schemaVersion: dataElement.settings.schema.version,
        sandboxName: dataElement.settings.sandbox.name,
        signal,
      });
    } catch {
      context.schemaLoadFailed = true;
      // If schema cannot be fetched (e.g., missing or access issue),
      // allow the user to continue and select a different data element by bailing out gracefully.
      return {};
    }
    if (!signal || !signal.aborted) {
      if (!schema) {
        return {};
      }
      const newSchema = {
        type: "object",
        properties: {
          xdm: schema,
        },
        $id: schema.$id,
        version: schema.version,
      };
      context.schema = newSchema;
      context.dataElementId = dataElement.id;
      context.schemaLoadFailed = false;
      return getInitialFormState({
        schema: newSchema,
        value,
        updateMode: true,
        transforms,
        existingFormStateNode,
      });
    }
  }
  if (isDataVariable(dataElement)) {
    const schema = generateSchemaFromSolutions(dataElement.settings.solutions);
    context.schema = schema;
    context.dataElementId = dataElement.id;

    // Temporary fix to support the audienceManager property that should have been lowercased.
    // eslint-disable-next-line no-underscore-dangle
    const adobe = data?.data?.__adobe || {};
    if (adobe.audienceManager) {
      adobe.audiencemanager = adobe.audienceManager;
      delete adobe.audienceManager;
    }
    return getInitialFormState({
      schema,
      value,
      updateMode: true,
      transforms,
      existingFormStateNode,
    });
  }

  return {};
};

const getInitialValues =
  (context) =>
  async ({ initInfo }) => {
    const {
      propertySettings: { id: propertyId } = {},
      company: { orgId },
      tokens: { imsAccess },
    } = initInfo;
    const {
      dataElementId,
      transforms = {},
      schema: previouslySavedSchemaInfo,
      customCode = "",
    } = initInfo.settings || {};

    let { data = {} } = initInfo.settings || {};

    const initialValues = {
      data,
      customCode,
    };

    const {
      results: dataElementsFirstPage,
      nextPage: dataElementsFirstPageCursor,
    } = await fetchDataElements({
      orgId,
      imsAccess,
      propertyId,
    });

    context.dataElementsFirstPage = dataElementsFirstPage;
    context.dataElementsFirstPageCursor = dataElementsFirstPageCursor;

    let dataElement;
    if (dataElementId) {
      try {
        context.previouslySavedSchemaInfo = previouslySavedSchemaInfo;
        dataElement = await fetchDataElement({
          orgId,
          imsAccess,
          dataElementId,
        });
      } catch {
        // Ignore the error and let the user select the data element.
        // We null out the schema because in the sandbox init can be called multiple times.
        context.schema = null;
        context.dataElementId = null;
      }
    }
    if (
      !dataElement &&
      dataElementsFirstPage.length === 1 &&
      dataElementsFirstPageCursor === null
    ) {
      dataElement = dataElementsFirstPage[0];
    }

    initialValues.dataElement = dataElement;

    context.originalData = { xdm: data, data };

    if (dataElement) {
      const prefix = isDataVariable(dataElement) ? "data" : "xdm";
      const prefixedTransforms = Object.keys(transforms).reduce((memo, key) => {
        // The key for a root element transform is "".
        memo[key === "" ? prefix : `${prefix}.${key}`] = transforms[key];
        return memo;
      }, {});

      data = { [prefix]: data };

      const initialFormState = await getInitialFormStateFromDataElement({
        dataElement,
        context,
        orgId,
        imsAccess,
        data,
        transforms: prefixedTransforms,
      });

      return { ...initialValues, ...initialFormState };
    }

    return initialValues;
  };

const getSettings =
  (context) =>
  ({ values }) => {
    const { dataElement } = values;
    const { id: dataElementId } = dataElement || {};
    const transforms = {};

    const { xdm, data } =
      getValueFromFormState({ formStateNode: values, transforms }) || {};

    const dataTransforms = Object.keys(transforms).reduce((memo, key) => {
      const period = key.indexOf(".");
      memo[key.substring(period === -1 ? key.length : period + 1)] =
        transforms[key];
      return memo;
    }, {});

    const schema = {
      id: context.schema?.$id,
      version: context.schema?.version,
    };

    const response = {
      dataElementId,
      data: xdm || data || {},
    };

    if (schema.id) {
      response.schema = schema;
    }

    if (Object.keys(dataTransforms).length > 0) {
      response.transforms = dataTransforms;
    }

    if (values.customCode) {
      response.customCode = values.customCode;
    }

    return response;
  };

const validationSchema = object().shape({
  dataElement: object().required("Please specify a data element."),
});

const validateFormikState =
  (context) =>
  ({ values }) => {
    const { schema } = context;
    if (!schema) {
      return {};
    }

    return validate(values);
  };

const findFirstNodeIdForDepth = (formStateNode, depth) => {
  const {
    schema: { type, properties: schemaProperties } = {},
    properties,
    items,
    id,
  } = formStateNode;
  if (depth > 0) {
    if (type === OBJECT && properties) {
      const sortedEditors = Object.keys(schemaProperties).sort();
      const editorsContainingValues = sortedEditors.filter((k) => {
        const map = {
          [ADOBE_ANALYTICS]: isAnalyticsEditorEmpty,
          [ADOBE_TARGET]: isObjectJsonEditorEmpty,
          [ADOBE_AUDIENCE_MANAGER]: isObjectJsonEditorEmpty,
        };

        if (map[k]) {
          return map[k](properties[k]);
        }

        return false;
      });

      let firstProperty;

      if (editorsContainingValues.length > 0) {
        firstProperty = editorsContainingValues[0];
      } else {
        [firstProperty] = sortedEditors;
      }

      if (firstProperty) {
        return findFirstNodeIdForDepth(properties[firstProperty], depth - 1);
      }
    }
    if (type === ARRAY && items) {
      const [firstItem] = items;
      if (firstItem) {
        return findFirstNodeIdForDepth(firstItem, depth - 1);
      }
    }
  }
  return id;
};

const UpdateVariable = ({
  initInfo,
  formikProps: { resetForm, values },
  context,
}) => {
  const {
    schema,
    dataElementsFirstPage,
    dataElementsFirstPageCursor,
    previouslySavedSchemaInfo,
  } = context;

  const [{ value: dataElement }] = useField("dataElement");
  const [{ value: customCode }] = useField("customCode");
  const [hasSchema, setHasSchema] = useState(schema != null);
  const [selectedNodeId, setSelectedNodeId] = useState(() => {
    if (dataElement?.settings?.solutions) {
      return findFirstNodeIdForDepth(values, 3);
    }
    return null;
  });
  const abortPreviousRequestsAndCreateSignal =
    useAbortPreviousRequestsAndCreateSignal();

  const {
    propertySettings: { id: propertyId } = {},
    company: { id: companyId, orgId },
    tokens: { imsAccess },
  } = initInfo;

  useChanged(
    useReportAsyncError(() => {
      async function reloadDataElement() {
        setHasSchema(false);
        setSelectedNodeId(null);
        context.schemaLoadFailed = false;

        if (dataElement) {
          const transforms = {};
          const signal = abortPreviousRequestsAndCreateSignal();
          const initialFormState = await getInitialFormStateFromDataElement({
            dataElement,
            context,
            orgId,
            imsAccess,
            transforms,
            existingFormStateNode: values,
            signal,
          });

          if (!signal.aborted) {
            resetForm({
              values: { ...initialFormState, dataElement, customCode },
            });
            if (context.schema) {
              setHasSchema(true);
            }
          }

          if (isDataVariable(dataElement)) {
            setSelectedNodeId(findFirstNodeIdForDepth(initialFormState, 3));
          }
        }
      }
      reloadDataElement();
    }),
    [dataElement],
  );

  const isSchemaMatched = context.dataElementId === dataElement?.id;

  const loadItems = useReportAsyncError(
    async ({ filterText, cursor, signal }) => {
      const { results, nextPage } = await fetchDataElements({
        orgId,
        imsAccess,
        propertyId,
        search: filterText,
        page: cursor || 1,
        signal,
      });

      return {
        items: results,
        cursor: nextPage,
      };
    },
  );

  return (
    <FormElementContainer direction="column">
      {dataElementsFirstPage.length === 0 && (
        <InlineAlert
          variant="negative"
          data-test-id="noDataElements"
          width="size-5000"
        >
          <Heading size="XXS">Error</Heading>
          <Content>
            No `variable` type data elements are available.{" "}
            <Link
              href={`https://experience.adobe.com/#/data-collection/tags/companies/${companyId}/properties/${propertyId}/dataElements/new`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Create a `variable` type data element first
            </Link>
            .
          </Content>
        </InlineAlert>
      )}
      {dataElementsFirstPage.length > 0 && (
        <>
          <Link
            href="https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/web-sdk/action-types#update-variable"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about the Update Variable action
          </Link>
          <FormikPagedComboBox
            data-test-id="dataElementField"
            name="dataElement"
            label="Data element"
            description="Please specify the data element you would like to update. Only `variable` type data elements are available."
            width="size-5000"
            isRequired
            loadItems={loadItems}
            getKey={(item) => item?.name}
            getLabel={(item) => item?.name}
            firstPage={dataElementsFirstPage}
            firstPageCursor={dataElementsFirstPageCursor}
          >
            {(item) => <Item key={item.name}>{item.name}</Item>}
          </FormikPagedComboBox>
        </>
      )}
      {context.schemaLoadFailed && dataElement && (
        <InlineAlert
          variant="info"
          data-test-id="dataElementSchemaMissingAlert"
          width="size-5000"
        >
          <Heading size="XXS">
            The schema associated with this data element could not be loaded.
          </Heading>
          <Content>
            Either choose a new data element or update the selected data element
            with a valid schema.
          </Content>
        </InlineAlert>
      )}
      {hasSchema && isSchemaMatched && (
        <>
          <Heading size="M" margin="0">
            Variable Editor
          </Heading>
          <Divider margin={0} size="M" />

          <Editor
            key={isDataVariable(dataElement) ? "data" : "xdm"}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            schema={schema}
            previouslySavedSchemaInfo={previouslySavedSchemaInfo}
            initialExpandedDepth={dataElement.settings.solutions ? 2 : 1}
            componentName="update variable action"
            verticalLayout={isDataVariable(dataElement)}
          />

          <Heading size="M" margin="0">
            Custom Code
          </Heading>
          <Divider margin={0} size="M" />

          <CodeField
            data-test-id="onBeforeEventSendEditButton"
            aria-label="Custom Code"
            buttonLabelSuffix="custom code"
            name="customCode"
            description={
              <Text>
                Use this editor to set additional properties on the variable
                object using custom code. The custom code will be executed after
                the properties defined inside the variable editor are applied to
                the variable. <br />
                <br />
                The following variables are available for use within your custom
                code:
                <ul style={{ margin: 0 }}>
                  <li>content - The variable object.</li>
                  <li>
                    event - The underlying event object that caused this rule to
                    fire.
                  </li>
                </ul>
              </Text>
            }
            language="javascript"
            placeholder={
              "// Modify content as necessary. There is no need to wrap the code in a function or return a value." +
              "\n\n// For example if you are updating an XDM Variable Data Element, you can set the page name by writing:" +
              "\n\n// content.web = content.web || {};" +
              "\n// content.web.webPageDetails = content.web.webPageDetails || {};" +
              '\n// content.web.webPageDetails.name = "Home";' +
              "\n\n// If you are updating a Data Variable Data Element you can update an Analytics page name by writing:" +
              "\n\n// content.__adobe = content.__adobe || { };" +
              "\n// content.__adobe.analytics = content.__adobe.analytics || { };" +
              '\n// content.__adobe.analytics.eVar5 = "Test";'
            }
          />
        </>
      )}
      {!(hasSchema && isSchemaMatched) &&
        dataElement &&
        !context.schemaLoadFailed && (
          <Flex alignItems="center" justifyContent="center" height="size-2000">
            <ProgressCircle size="L" aria-label="Loading..." isIndeterminate />
          </Flex>
        )}
    </FormElementContainer>
  );
};

UpdateVariable.propTypes = {
  context: PropTypes.object,
  initInfo: PropTypes.object,
  formikProps: PropTypes.object,
};

const UpdateVariableView = () => {
  const { current: context } = useRef({});

  return (
    <ExtensionView
      getInitialValues={getInitialValues(context)}
      getSettings={getSettings(context)}
      formikStateValidationSchema={validationSchema}
      validateFormikState={validateFormikState(context)}
      render={(props) => {
        return <UpdateVariable context={context} {...props} />;
      }}
    />
  );
};

export default UpdateVariableView;
