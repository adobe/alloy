/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createContext, useContext, useEffect, useRef, useState } from "react";

export const CommitOnBlurContext = createContext(false);

export default (value, name, onChange) => {
  const commitOnBlur = useContext(CommitOnBlurContext);
  const [draft, setDraft] = useState(value);
  const draftRef = useRef(value);

  const updateDraft = (nextValue) => {
    draftRef.current = nextValue;
    setDraft(nextValue);
    if (!commitOnBlur) {
      onChange(nextValue);
    }
  };

  useEffect(() => {
    draftRef.current = value;
    setDraft(value);
  }, [value, name]);

  // React Aria can invoke blur with an older render's handler.
  return [draft, updateDraft, draftRef];
};
