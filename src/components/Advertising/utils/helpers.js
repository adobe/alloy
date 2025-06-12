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
const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    skwcid: urlParams.get("skwcid"),
    efid: urlParams.get("ef_id"),
  };
};

const shouldThrottle = (lastTime, throttleMinutes) => {
  if (!lastTime) return false;
  const elapsedMinutes = (Date.now() - lastTime) / (60 * 1000);
  return elapsedMinutes < throttleMinutes;
};
export { getUrlParams, shouldThrottle };
