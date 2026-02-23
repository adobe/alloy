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

import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { useFormik, FormikProvider } from "formik";
import { object } from "yup";
import { ProgressCircle, View } from "@adobe/react-spectrum";
import useExtensionBridge from "../utils/useExtensionBridge";
import useReportAsyncError from "../utils/useReportAsyncError";
import FillParentAndCenterChildren from "./fillParentAndCenterChildren";

const ExtensionView = ({
  render,
  getInitialValues,
  getSettings,
  validateFormikState,
  formikStateValidationSchema,
  getFormikStateValidationSchema,
  validateNonFormikState,
}) => {
  const reportAsyncError = useReportAsyncError();
  const [initInfo, setInitInfo] = useState();
  const [canRenderView, setCanRenderView] = useState(false);
  const viewRegistrationRef = useRef();
  const formikPropsRef = useRef();
  const getInitialValuesPromiseRef = useRef();

  const getValidationSchema = () => {
    const {
      getFormikStateValidationSchema: getSchema,
      formikStateValidationSchema: schema,
    } = viewRegistrationRef.current ?? {};

    if (schema) {
      return schema;
    }
    if (getSchema && initInfo) {
      try {
        const newSchema = getSchema({ initInfo });
        viewRegistrationRef.current.formikStateValidationSchema = newSchema;
      } catch (e) {
        reportAsyncError(e);
      }
    }
    return object();
  };

  formikPropsRef.current = useFormik({
    onSubmit: () => {},
    validate: (values) => {
      let errors;

      // Formik swallows errors that occur during validation, but we want
      // to handle them in a proper manner.
      try {
        if (viewRegistrationRef.current?.validateFormikState) {
          errors = viewRegistrationRef.current.validateFormikState({ values });
        }
      } catch {
        reportAsyncError(
          new Error("An error occurred while validating the view."),
        );
      }

      return errors;
    },
    validationSchema: getValidationSchema(),
  });

  const myValidateFormikState = async () => {
    // The view hasn't yet initialized formik with initialValues.
    if (!formikPropsRef.current.values) {
      return false;
    }

    try {
      await formikPropsRef.current.submitForm();

      // The docs say that the promise submitForm returns
      // will be rejected if there are errors, but that is not the case.
      // Therefore, after the promise is resolved, we manually validate
      // to see if the form is valid.
      // https://github.com/jaredpalmer/formik/issues/1580
      formikPropsRef.current.setSubmitting(false);

      // Setting context to the values so you can use "$..." in when conditions
      const validationSchema = getValidationSchema();
      await validationSchema.validate(formikPropsRef.current.values, {
        abortEarly: false,
        context: formikPropsRef.current.values,
      });

      // validate the formik state
      const formikErrors = await formikPropsRef.current.validateForm();
      return Object.keys(formikErrors).length === 0;
    } catch {
      return false;
    }
  };

  const myValidateNonFormikState = async () => {
    if (!viewRegistrationRef.current) {
      // If the view hasn't registered yet, we don't want to consider
      // it valid.
      return false;
    }

    if (!viewRegistrationRef.current.validateNonFormikState) {
      return true;
    }

    return viewRegistrationRef.current.validateNonFormikState();
  };

  useExtensionBridge({
    init({ initInfo: _initInfo }) {
      setCanRenderView(false);
      setInitInfo(_initInfo);
    },
    async getSettings() {
      if (!viewRegistrationRef.current || !formikPropsRef?.current?.values) {
        return {};
      }

      try {
        return await viewRegistrationRef.current.getSettings({
          initInfo,
          values: formikPropsRef.current.values,
        });
      } catch (e) {
        // This will update the UI to show that an error has occurred.
        reportAsyncError(e);
        // Throwing the error will let Launch know not to save the settings.
        throw e;
      }
    },
    async validate() {
      if (getInitialValuesPromiseRef.current) {
        await getInitialValuesPromiseRef.current;
      }
      const results = await Promise.all([
        myValidateFormikState(),
        myValidateNonFormikState(),
      ]);
      return results.every((result) => result);
    },
  });

  const registerImperativeFormApi = (api) => {
    viewRegistrationRef.current = viewRegistrationRef.current || {};
    viewRegistrationRef.current.getSettings = api.getSettings;
    viewRegistrationRef.current.validateFormikState = api.validateFormikState;
    viewRegistrationRef.current.formikStateValidationSchema =
      api.formikStateValidationSchema;
    viewRegistrationRef.current.getFormikStateValidationSchema =
      api.getFormikStateValidationSchema;
    viewRegistrationRef.current.validateNonFormikState =
      api.validateNonFormikState;
  };

  if (getSettings) {
    useEffect(() => {
      registerImperativeFormApi({
        getSettings,
        validateFormikState,
        formikStateValidationSchema,
        getFormikStateValidationSchema,
        validateNonFormikState,
      });
    }, []);
  }
  if (getInitialValues) {
    useEffect(() => {
      async function getData() {
        if (initInfo) {
          try {
            const getInitialValuesPromise = getInitialValues({ initInfo });
            getInitialValuesPromiseRef.current = getInitialValuesPromise;
            formikPropsRef.current.resetForm({
              values: await getInitialValuesPromise,
            });
            setCanRenderView(true);
            window.loaded = true;
          } catch (e) {
            reportAsyncError(e);
          }
        }
      }

      getData();
    }, [initInfo]);
  }

  useEffect(() => {
    if (canRenderView) {
      window.dispatchEvent(new Event("extension-reactor-alloy:rendered"));
    }
  }, [canRenderView]);

  // Show the spinner until getInitialValues is done
  if (!canRenderView) {
    return (
      <FillParentAndCenterChildren>
        <ProgressCircle size="L" aria-label="Loading..." isIndeterminate />
      </FillParentAndCenterChildren>
    );
  }

  return (
    <View>
      <FormikProvider value={formikPropsRef.current}>
        {render({
          initInfo,
          formikProps: formikPropsRef.current,
          registerImperativeFormApi,
        })}
      </FormikProvider>
    </View>
  );
};

ExtensionView.propTypes = {
  render: PropTypes.func,
  getInitialValues: PropTypes.func,
  getSettings: PropTypes.func,
  validateFormikState: PropTypes.func,
  formikStateValidationSchema: PropTypes.object,
  getFormikStateValidationSchema: PropTypes.func,
  validateNonFormikState: PropTypes.func,
};

export default ExtensionView;
