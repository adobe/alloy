/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

require("dotenv").config({
  path: `.env`
});

const { DESKTOP_SCREEN_WIDTH } = require("./conf/globals");

module.exports = {
  siteMetadata: {
    home: {
      title: "Home",
      path: "/index.md"
    },
    versions: [
        {
          title: "Consent",
          path: "/alloy/consent/index.md"
        },
        {
          title: "Personalization",
          path: "/alloy/personalization/index.md"
        },
        {
          title: "Event Merge",
          path: "/alloy/eventmerge/index.md"
        },
        {
          title: "Links",
          path: "/alloy/links/index.md"
        },
        {
          title: "Large Payload",
          path: "/alloy/largepayload/index.md"
        },
        {
          title: "Multiple Orgs",
          path: "/alloy/multipleorgs/index.md"
        },
        {
          title: "Legacy Visitor ID",
          path: "/alloy/legacyvisitor/index.md"
        }
      ],
    pages: [
        {
          title: "Sandbox Pages",
          path: "/index.md"
        }
    ],
  },
  plugins: [
    `gatsby-plugin-preact`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-mdx-embed`,
    `@adobe/parliament-site-search-index`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/Layout/index.js`)
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `src/pages`
      }
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        defaultLayouts: {
          default: require.resolve(`./src/components/MDXFilter/index.js`)
        },
        rehypePlugins: [require(`rehype-slug`)],
        plugins: [
          `gatsby-transformer-remark`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-images-remote`
        ],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-transformer-remark`
          },
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              ignoreFileExtensions: [
                `png`,
                `jpg`,
                `jpeg`,
                `bmp`,
                `tiff`,
                `md`,
                `mdx`
              ]
            }
          },
          {
            resolve: `gatsby-remark-images-remote`,
            options: {
              maxWidth: DESKTOP_SCREEN_WIDTH,
              linkImagesToOriginal: false,
              withWebp: { quality: 80 },
              disableBgImage: true,
              backgroundColor: "none"
            }
          }
        ]
      }
    },

  ]
};
