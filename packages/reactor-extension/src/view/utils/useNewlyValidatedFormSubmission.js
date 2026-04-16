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
import { useFormikContext } from "formik";

/**
 * A react hook which calls the callback after a user attempts to
 * submit a formik form (rather than just changes a field value)
 * and validation completes.
 *
 * @param {Function} callback A function to call whenever the user
 * attempts to submit a formik form and validation completes.
 */
export default (callback) => {
  const { submitCount, isSubmitting, errors } = useFormikContext();
  const previousProcessedSubmitCountRef = useRef(0);
  useEffect(() => {
    // Let's consider our state before form submission:
    // submitCount=0, isSubmitting=false, isValidating=false
    // When form submission occurs, formik props change multiple
    // times during the submission process as follows:
    // 1. submitCount=1, isSubmitting=true, isValidating=false
    // 2. submitCount=1, isSubmitting=true, isValidating=true
    // 3. submitCount=1, isSubmitting=true, isValidating=false
    // 4. submitCount=1, isSubmitting=false, isValidating=false
    // We want to call the callback on every form submission soon
    // after validation is finished, so the simplest way is to wait
    // until step 4, which we can do without actually tracking isValidating.
    if (
      submitCount !== previousProcessedSubmitCountRef.current &&
      !isSubmitting
    ) {
      previousProcessedSubmitCountRef.current = submitCount;
      callback(errors);
    }
  }, [submitCount, isSubmitting]);
};
