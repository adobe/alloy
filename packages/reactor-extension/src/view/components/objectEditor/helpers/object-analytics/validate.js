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

import { setBy } from "@tanstack/react-form";
import { getErrors, shape } from "../../../../forms/validation";
import analyticsForm from "./analyticsForm";

const validator = shape(analyticsForm.validationShape);

export default ({ formStateNode }) => {
  const errors = Object.entries(getErrors(validator, formStateNode)).reduce(
    (nested, [path, message]) => setBy(nested, path, message),
    {},
  );
  return Object.keys(errors).length > 0 ? errors : undefined;
};
