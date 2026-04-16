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

const anyErrorsTouched = (errors, touched) => {
  if (errors === undefined || touched === undefined) {
    return false;
  }
  if (Array.isArray(errors)) {
    return errors.some((error, index) =>
      anyErrorsTouched(error, touched[index]),
    );
  }
  if (typeof errors === "object") {
    return Object.keys(errors).some((key) =>
      anyErrorsTouched(errors[key], touched[key]),
    );
  }

  return true;
};

export default anyErrorsTouched;
