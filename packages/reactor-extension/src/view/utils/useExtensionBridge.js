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
import { useRef, useEffect } from "react";

export default (currentViewMethods) => {
  const viewMethodsRef = useRef();
  viewMethodsRef.current = currentViewMethods;

  useEffect(() => {
    // We use "useRef" so that whenever Launch calls the init, getSettings, or validate
    // methods below, we can be sure we're executing the view methods from the most
    // recent render. If our init, getSettings, and validate functions below referenced
    // currentViewMethods directly (rather than viewMethods.current), currentViewMethods
    // would be captured via closure the first time useExtensionBridge is executed and
    // those references would never be updated on subsequent executions of
    // useExtensionBridge, since this effect only runs once.
    window.extensionBridge.register({
      init(initInfo) {
        return viewMethodsRef.current.init({
          initInfo,
        });
      },
      getSettings() {
        return viewMethodsRef.current.getSettings();
      },
      validate() {
        return viewMethodsRef.current.validate();
      },
    });
  }, []);
};
