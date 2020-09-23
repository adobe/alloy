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

// The __VERSION__ keyword will be replace at alloy build time with the package.json version.
// The __EXTENSION_VERSION__ keyword will be replaced at extension build time with the
// launch extension's package.json version.
// see babel-plugin-version

/* #if _REACTOR
const alloyVersion = "__VERSION__";
const extensionVersion = "__EXTENSION_VERSION__";
export default `${alloyVersion}+${extensionVersion}`;
//#else */
export default "__VERSION__";
// #endif
