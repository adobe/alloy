/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useEffect, useRef } from "react";
import { useStore } from "@tanstack/react-form";
import { selectErrorTree, useFormContext } from "../forms/formContext";

/**
 * A react hook which calls the callback after a user attempts to
 * submit the form (rather than just changes a field value)
 * and validation completes.
 *
 * @param {Function} callback A function to call whenever the user
 * attempts to submit the form and validation completes.
 */
export default (callback) => {
  const form = useFormContext();
  const submitCount = useStore(form.store, (state) => state.submissionAttempts);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const previousProcessedSubmitCountRef = useRef(0);
  useEffect(() => {
    // A submission increments submissionAttempts, then sets isSubmitting
    // while validating. Waiting for isSubmitting to clear calls back once per
    // submission, after its validation has finished. A submission that stops
    // early because the form is already invalid never sets isSubmitting.
    if (
      submitCount !== previousProcessedSubmitCountRef.current &&
      !isSubmitting
    ) {
      previousProcessedSubmitCountRef.current = submitCount;
      callback(selectErrorTree(form.state));
    }
  }, [submitCount, isSubmitting]);
};
