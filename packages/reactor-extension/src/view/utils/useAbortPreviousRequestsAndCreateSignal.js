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

import { useRef } from "react";

/**
 * React hook for creating a new abort controller signal. If
 * a previous abort controller signal was created, it will
 * be aborted. This is useful to cancel stale requests to
 * avoid problematic race conditions.
 */
const useAbortPreviousRequestsAndCreateSignal = () => {
  const abortControllerRef = useRef();

  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    return abortControllerRef.current.signal;
  };
};

export default useAbortPreviousRequestsAndCreateSignal;
