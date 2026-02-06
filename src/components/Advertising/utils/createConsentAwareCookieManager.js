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

/**
 * Wraps an advertising cookie manager so that cookie writes are gated on
 * user consent.
 *
 * - Consent "in"      → writes go through immediately.
 * - Consent "pending"  → writes are queued and flushed once consent is
 *                        granted, or discarded if consent is denied.
 * - Consent "out"      → writes are silently discarded.
 *
 * Consent state is evaluated at **call time** (not construction time) because
 * the Advertising component may be created before the Consent component has
 * called `consent.initializeConsent()`.
 *
 * Reads always check the pending-write queue first so that values written
 * during the "pending" window are still visible to callers within the same
 * page session.
 *
 * @param {Object} options
 * @param {Object} options.baseCookieManager - The underlying cookie manager
 *   ({ setValue, getValue }).
 * @param {Object} options.consent - The Alloy consent manager.
 * @returns {{ setValue: Function, getValue: Function }}
 */
export default ({ baseCookieManager, consent }) => {
  const pendingWrites = new Map();
  let consentListenerAttached = false;
  // Once the awaitConsent() promise settles we cache the outcome so
  // subsequent setValue calls do not need to re-evaluate.
  let resolvedConsentState = null; // null | "in" | "out"

  const attachConsentListener = () => {
    if (consentListenerAttached) {
      return;
    }
    consentListenerAttached = true;

    consent
      .awaitConsent()
      .then(() => {
        resolvedConsentState = "in";
        // Flush every queued write in insertion order.
        pendingWrites.forEach(({ value, options }, key) => {
          baseCookieManager.setValue(key, value, options);
        });
        pendingWrites.clear();
      })
      .catch(() => {
        resolvedConsentState = "out";
        // Consent denied – discard all pending writes.
        pendingWrites.clear();
      });
  };

  return {
    /**
     * Returns the value for `key`. If a write for this key is still
     * pending (queued while consent was pending), the queued value is
     * returned so that callers see a consistent view.
     */
    getValue(key) {
      if (pendingWrites.has(key)) {
        return pendingWrites.get(key).value;
      }
      return baseCookieManager.getValue(key);
    },

    /**
     * Writes `value` for `key`. The actual cookie write is deferred
     * until consent is granted. If consent has already been denied the
     * write is silently discarded.
     */
    setValue(key, value, options) {
      // Fast path: if the consent promise has already settled, use the
      // cached result without re-evaluating.
      if (resolvedConsentState === "in") {
        return baseCookieManager.setValue(key, value, options);
      }
      if (resolvedConsentState === "out") {
        return false;
      }

      // Check the live consent state. This is evaluated at call time
      // rather than at construction time because the Consent component
      // may not have been initialized yet when this wrapper was created.
      const { state } = consent.current();

      if (state === "in") {
        return baseCookieManager.setValue(key, value, options);
      }
      if (state === "out") {
        return false;
      }

      // state === "pending" – queue the write and ensure we have a
      // listener that will flush or discard when consent settles.
      attachConsentListener();
      pendingWrites.set(key, { value, options });
      return true;
    },
  };
};
