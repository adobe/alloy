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

import { useForm } from "@tanstack/react-form";
import { object } from "yup";
import { ProgressCircle } from "@react-spectrum/s2";
import useExtensionBridge from "../utils/useExtensionBridge";
import useReportAsyncError from "../utils/useReportAsyncError";
import FillParentAndCenterChildren from "./fillParentAndCenterChildren";
import {
  formContext,
  getFieldValidatorErrors,
  submitForm,
  validateOnChangeBlurAndSubmit,
} from "../forms/formContext";
import { getFormErrors, isValidAgainstSchema } from "../forms/yupValidation";

const ExtensionView = ({
  render,
  getInitialValues,
  getSettings,
  validateFormState,
  validationSchema,
  getValidationSchema,
  validateNonFormState,
}) => {
  const reportAsyncError = useReportAsyncError();
  const [initInfo, setInitInfo] = useState();
  const [canRenderView, setCanRenderView] = useState(false);
  const viewRegistrationRef = useRef();
  const getInitialValuesPromiseRef = useRef();
  const hasValuesRef = useRef(false);

  const resolveValidationSchema = () => {
    const { getValidationSchema: getSchema, validationSchema: schema } =
      viewRegistrationRef.current ?? {};

    if (schema) {
      return schema;
    }
    if (getSchema && initInfo) {
      try {
        const newSchema = getSchema({ initInfo });
        viewRegistrationRef.current.validationSchema = newSchema;
      } catch (e) {
        reportAsyncError(e);
      }
    }
    return object();
  };

  const getErrors = (values) => {
    try {
      return {
        ...getFieldValidatorErrors(form, values),
        ...getFormErrors({
          schema: resolveValidationSchema(),
          validate: viewRegistrationRef.current?.validateFormState,
          values,
        }),
      };
    } catch {
      reportAsyncError(
        new Error("An error occurred while validating the view."),
      );
      return {};
    }
  };

  const form = useForm({
    validationLogic: validateOnChangeBlurAndSubmit,
    validators: {
      onDynamic: ({ value }) => {
        const errors = getErrors(value);
        return Object.keys(errors).length > 0
          ? { form: errors, fields: {} }
          : undefined;
      },
    },
  });

  const myValidateFormState = async () => {
    // The view hasn't yet initialized the form with initial values.
    if (!hasValuesRef.current) {
      return false;
    }

    await submitForm(form);

    // Setting context to the values so you can use "$..." in when conditions
    return (
      isValidAgainstSchema(resolveValidationSchema(), form.state.values) &&
      Object.keys(getErrors(form.state.values)).length === 0
    );
  };

  const myValidateNonFormState = async () => {
    if (!viewRegistrationRef.current) {
      // If the view hasn't registered yet, we don't want to consider
      // it valid.
      return false;
    }

    if (!viewRegistrationRef.current.validateNonFormState) {
      return true;
    }

    return viewRegistrationRef.current.validateNonFormState();
  };

  useExtensionBridge({
    init({ initInfo: _initInfo }) {
      setCanRenderView(false);
      setInitInfo(_initInfo);
    },
    async getSettings() {
      if (!viewRegistrationRef.current || !hasValuesRef.current) {
        return {};
      }

      try {
        return await viewRegistrationRef.current.getSettings({
          initInfo,
          values: form.state.values,
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
        myValidateFormState(),
        myValidateNonFormState(),
      ]);
      return results.every((result) => result);
    },
  });

  const registerImperativeFormApi = (api) => {
    viewRegistrationRef.current = viewRegistrationRef.current || {};
    viewRegistrationRef.current.getSettings = api.getSettings;
    viewRegistrationRef.current.validateFormState = api.validateFormState;
    viewRegistrationRef.current.validationSchema = api.validationSchema;
    viewRegistrationRef.current.getValidationSchema = api.getValidationSchema;
    viewRegistrationRef.current.validateNonFormState = api.validateNonFormState;
  };

  if (getSettings) {
    useEffect(() => {
      registerImperativeFormApi({
        getSettings,
        validateFormState,
        validationSchema,
        getValidationSchema,
        validateNonFormState,
      });
    }, []);
  }
  if (getInitialValues) {
    useEffect(() => {
      const getData = async () => {
        if (initInfo) {
          try {
            const getInitialValuesPromise = getInitialValues({ initInfo });
            getInitialValuesPromiseRef.current = getInitialValuesPromise;
            form.reset(await getInitialValuesPromise);
            hasValuesRef.current = true;
            setCanRenderView(true);
            window.loaded = true;
          } catch (e) {
            reportAsyncError(e);
          }
        }
      };

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
    <div>
      <formContext.Provider value={form}>
        {render({
          initInfo,
          form,
          registerImperativeFormApi,
        })}
      </formContext.Provider>
    </div>
  );
};

ExtensionView.propTypes = {
  render: PropTypes.func,
  getInitialValues: PropTypes.func,
  getSettings: PropTypes.func,
  validateFormState: PropTypes.func,
  validationSchema: PropTypes.object,
  getValidationSchema: PropTypes.func,
  validateNonFormState: PropTypes.func,
};

export default ExtensionView;
