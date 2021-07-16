/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from "react";
import globalTheme from "../../theme";

import { Hero } from "../Hero";
import { DiscoverBlock } from "../DiscoverBlock";
import { Resources } from "../Resources";
import { InlineAlert } from "../InlineAlert";
import { CodeBlock } from "../CodeBlock";
import { Variant } from "../Variant";
import { TitleBlock } from "../TitleBlock";
import { TextBlock } from "../TextBlock";
import { AnnouncementBlock } from "../AnnouncementBlock";
import { SummaryBlock } from "../SummaryBlock";
import { ProductCard } from "../ProductCard";
import { ResourceCard } from "../ResourceCard";
import { JsDocParameters } from "../JsDocParameters";
import { ProductCardGrid } from "../ProductCardGrid";

export const MDXBlocks = {
  Hero,
  DiscoverBlock,
  Resources,
  InlineAlert,
  CodeBlock: ({ theme, ...props }) => (
    <CodeBlock theme={theme ?? globalTheme.code} {...props} />
  ),
  Variant,
  TitleBlock,
  TextBlock,
  AnnouncementBlock,
  SummaryBlock,
  ProductCard,
  ResourceCard,
  JsDocParameters,
  ProductCardGrid
};
