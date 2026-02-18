/*
Copyright 2024 Adobe. All rights reserved.
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
 * Focuses the first field with a validation error after form submission.
 * This hook leverages ARIA attributes (aria-invalid="true") that are
 * automatically set by the Formik-wrapped React Spectrum components.
 *
 * Handles async UI transitions (tab switches, accordion expansions) by
 * polling for the invalid field to appear in the DOM before focusing.
 *
 * Usage:
 * Simply add this hook to any component wrapped in a Formik context:
 *
 * const MyFormComponent = () => {
 *   useFocusFirstError();
 *   // ... rest of component
 * };
 */
export default () => {
  const { submitCount, isSubmitting, errors } = useFormikContext();
  const previousSubmitCountRef = useRef(0);
  const timeoutIdRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Only process when:
    // 1. A new submit attempt has been made (submitCount changed)
    // 2. Form is no longer submitting (validation complete)
    // 3. There are validation errors
    if (
      submitCount !== previousSubmitCountRef.current &&
      !isSubmitting &&
      errors &&
      Object.keys(errors).length > 0
    ) {
      previousSubmitCountRef.current = submitCount;

      /**
       * Attempts to find and focus the first invalid field.
       * Polls for the field to be visible in the DOM since tab/accordion
       * transitions may not be complete when this runs.
       *
       * @param {number} attempt - Current attempt number
       * @param {number} maxAttempts - Maximum number of polling attempts
       */
      const tryFocusInvalidField = (attempt = 0, maxAttempts = 60) => {
        // Find the first invalid field using ARIA attributes
        // All Formik-wrapped components set aria-invalid="true" when validationState="invalid"
        const firstInvalidField = document.querySelector(
          '[aria-invalid="true"]',
        );

        if (firstInvalidField) {
          // Check if the field is actually visible (not in a hidden tab/accordion)
          const isVisible =
            firstInvalidField.offsetWidth > 0 &&
            firstInvalidField.offsetHeight > 0;

          if (isVisible) {
            // For NumberField and other components, we need to find the actual input element
            // The aria-invalid might be on a wrapper or the input itself
            let focusableElement = firstInvalidField;

            // If the element with aria-invalid is not an input, look for an input inside it
            if (
              firstInvalidField.tagName !== "INPUT" &&
              firstInvalidField.tagName !== "TEXTAREA" &&
              firstInvalidField.tagName !== "SELECT"
            ) {
              const input = firstInvalidField.querySelector(
                "input, textarea, select",
              );
              if (input) {
                focusableElement = input;
              }
            }

            focusableElement.focus();
            // Scroll the field into view if it's not visible in viewport
            focusableElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            return;
          }
        }

        // If field not found or not visible yet, retry
        if (attempt < maxAttempts) {
          timeoutIdRef.current = setTimeout(() => {
            tryFocusInvalidField(attempt + 1, maxAttempts);
          }, 50); // Poll every 50ms (total max wait: 3 seconds)
        }
      };

      // Clear any pending timeout/raf from previous attempts
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Wait for React to complete its render cycle before starting to poll.
      // This is especially important when tabs switch backwards (right to left)
      // as React may need to unmount/remount components.
      // We use requestAnimationFrame to wait for the browser's next paint,
      // then add a small delay to ensure React's state updates have propagated.
      rafIdRef.current = requestAnimationFrame(() => {
        timeoutIdRef.current = setTimeout(() => {
          tryFocusInvalidField();
        }, 150); // Wait 150ms for state updates + remounting
      });
    }
  }, [submitCount, isSubmitting, errors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
};
