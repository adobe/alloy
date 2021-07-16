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

const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http")
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"]
      })
    ]
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type Link {
      title: String
      path: String
    }

    type Menu {
      title: String
      description: String
      path: String
    }

    type TopPage {
      title: String
      path: String
      menu: [Menu]
    }

    type Version {
      title: String
      path: String
      selected: Boolean
    }

    type Home {
      title: String
      path: String
      hidden: Boolean
    }

    type SiteSiteMetadata {
      home: Home
      pages: [TopPage]
      subPages: [SubPage]
      versions: [Version]
      docs: Link
    }

    type SubPage {
      title: String
      path: String
      header: Boolean
      pages: [NestedSubPage1]
    }

    type NestedSubPage1 {
      title: String
      path: String
      pages: [NestedSubPage2]
    }

    type NestedSubPage2 {
      title: String
      path: String
      pages: [NestedSubPage3]
    }

    type NestedSubPage3 {
      title: String
      path: String
      pages: [NestedSubPage4]
    }

    type NestedSubPage4 {
      title: String
      path: String
      pages: [NestedSubPage5]
    }

    type NestedSubPage5 {
      title: String
      path: String
      pages: [Link]
    }

    type MdxFrontmatter {
      title: String
      description: String
      contributors: [String]
      keywords: [String]
    }
  `;

  createTypes(typeDefs);
};
