/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { InlineAlert, Heading, Content } from "@adobe/react-spectrum";
import BetaBadge from "../components/betaBadge";

/** @typedef {import("./form").Form} Form */
/**
 * This create a notice as part of a form
 * @param {object} options - Options for the notice
 * @param {string} options.title - The title of the notice
 * @param {string} options.description - The description of the notice
 * @param {boolean} [options.beta] - Whether or not this is a beta feature.
 * @returns {Form} A notice form element.
 */
export default function notice({ title, description, beta }) {
  return {
    Component: () => {
      return (
        <InlineAlert variant="info" width="size-5000">
          <Heading size="XXS">
            {title} {beta && <BetaBadge />}
          </Heading>
          <Content>{description}</Content>
        </InlineAlert>
      );
    },
  };
}
