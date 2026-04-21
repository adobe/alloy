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

/**
 * The user is providing a value for the whole node.
 * @type {string}
 */
export const WHOLE = "whole";

/**
 * The user is providing a value for the individual parts
 * of the node. In the case of an object, the object's properties
 * are the parts. In the case of an array, the array's items
 * are the parts. This population strategy is only available when
 * the node represents an object or an array and a schema has been
 * provided for the object's properties or the array's items.
 * @type {string}
 */
export const PARTS = "parts";
