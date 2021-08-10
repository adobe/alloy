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

import React, { useState, useEffect, createElement } from "react";
import { Helmet } from "react-helmet";
import { Global, css } from "@emotion/react";
import loadable from "@loadable/component";
import { useStaticQuery, graphql } from "gatsby";
import {
  rootFix,
  rootFixPages,
  findSelectedPages,
  findSubPages,
  trailingSlashFix,
  normalizePagePath,
  DESKTOP_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
  SIDENAV_WIDTH
} from "../../utils";
import "@spectrum-css/vars/dist/spectrum-global.css";
import "@spectrum-css/vars/dist/spectrum-medium.css";
import "@spectrum-css/vars/dist/spectrum-large.css";
import "@spectrum-css/vars/dist/spectrum-light.css";
import "@spectrum-css/vars/dist/spectrum-dark.css";
import "@spectrum-css/vars/dist/spectrum-lightest.css";
import "@spectrum-css/vars/dist/spectrum-darkest.css";
import "@spectrum-css/sidenav";
import "@adobe/focus-ring-polyfill";
import { Provider } from "../Context";
import { GlobalHeader } from "../GlobalHeader";
import { ContentSecurityPolicy } from "../ContentSecurityPolicy";
import { Basecode } from "../Basecode";
import { ProgressCircle } from "../ProgressCircle";
import nextId from "react-id-generator";

// Page source can come from OpenAPI or Iframe
const pageSrc = {
  openAPI: {
    src: null,
    block: null,
    frontMatter: "openAPISpec"
  },
  frame: {
    src: null,
    block: null,
    frontMatter: "frameSrc"
  }
};

let SideNav;

const toggleSideNav = setShowSideNav => {
  setShowSideNav(showSideNav => !showSideNav);
};

const addScript = url =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = val => resolve(val);
    script.onerror = err => reject(err);
    script.onabort = err => reject(err);

    document.head.appendChild(script);
  });

const updatePageSrc = (type, frontMatter, setIsLoading) => {
  const page = pageSrc[type];

  page.has = frontMatter?.[page.frontMatter];
  if (typeof page.has !== "undefined" && page.src !== page.has) {
    page.src = page.has;
  }

  if (page.src && !page.block) {
    setIsLoading(true);
    // Import statements have to be hardcoded
    if (type === "openAPI") {
      page.block = loadable(() => import("../OpenAPIBlock"));
    } else if (type === "frame") {
      page.block = loadable(() => import("../Frame"));
    }

    page.block.load().then(() => {
      setIsLoading(false);
    });
  }
};

export default ({ children, pageContext, location, ...otherProps }) => {
  console.log(pageContext, location, otherProps);
  const [ims, setIms] = useState(null);
  const [isLoadingIms, setIsLoadingIms] = useState(true);
  
    // Load and initialize IMS
  useEffect(() => {
    const IMS_SRC = process.env.GATSBY_IMS_SRC;
    const IMS_CONFIG = process.env.GATSBY_IMS_CONFIG;

    if (IMS_SRC && IMS_CONFIG) {
      (async () => {
        try {
          await addScript(`${IMS_SRC}`);
          let IMS_CONFIG_JSON = JSON.parse(IMS_CONFIG);
          IMS_CONFIG_JSON.onReady = () => {
            setIms(window.adobeIMS);
          };
          window.adobeImsFactory.createIMSLib(IMS_CONFIG_JSON);
          window.adobeIMS.initialize();
        } catch (e) {
          console.error(`AIO: IMS error.`);
        } finally {
          setIsLoadingIms(false);
        }
      })();
    } else {
      console.warn("AIO: IMS config missing.");
      setIsLoadingIms(false);
    }
  }, []);

  // Load all data once and pass it to the Provider
  const data = useStaticQuery(
    graphql`
      query {
        allMdx {
          nodes {
            tableOfContents
            fileAbsolutePath
          }
        }
        allSitePage {
          nodes {
            component
            path
          }
        }
        site {
          pathPrefix
          siteMetadata {
            home {
              title
              path
              hidden
            }
            docs {
              title
              path
            }
            versions {
              title
              path
              selected
            }
            pages {
              title
              path
              menu {
                title
                description
                path
              }
            }
            subPages {
              title
              path
              header
              pages {
                title
                path
                pages {
                  title
                  path
                  pages {
                    title
                    path
                    pages {
                      title
                      path
                      pages {
                        title
                        path
                      }
                    }
                  }
                }
              }
            }
          }
        }
        ParliamentSearchIndex
      }
    `
  );

  const { allMdx, allSitePage, site, ParliamentSearchIndex } = data;
  const { siteMetadata, pathPrefix } = site;
  const { home, versions, pages, subPages, docs } = siteMetadata;

  const [showSideNav, setShowSideNav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Unify all paths
  location.pathname = trailingSlashFix(decodeURIComponent(location.pathname));

  pages.forEach(page => {
    normalizePagePath(page);

    if (page.menu) {
      page.menu.forEach(menu => {
        normalizePagePath(menu);
      });
    }
  });

  if (versions) {
    versions.forEach(version => {
      normalizePagePath(version);
    });
  }

  normalizePagePath(home);
  normalizePagePath(docs);

  const normalizeSubPages = page => {
    normalizePagePath(page);

    if (page.pages) {
      page.pages.forEach(subPage => {
        normalizeSubPages(subPage);
      });
    }
  };

  if (subPages) {
    subPages.forEach(subPage => {
      normalizeSubPages(subPage);
    });
  }

  const pathWithRootFix = rootFix(location.pathname);
  const pagesWithRootFix = rootFixPages(pages);
  const sideNavSelectedPages = findSelectedPages(pathWithRootFix, subPages);
  const sideNavSelectedSubPages = findSubPages(
    pathWithRootFix,
    pagesWithRootFix,
    subPages
  );
  const hasSideNav = sideNavSelectedSubPages.length > 0;

  if (hasSideNav && !SideNav) {
    SideNav = loadable(() => import("../SideNav"));
  }

  const frontMatter = pageContext?.frontmatter;

  const layoutId = nextId();
  const sideNavId = nextId();

  // Update OpenAPI spec and Frame src
  updatePageSrc("openAPI", frontMatter, setIsLoading);
  updatePageSrc("frame", frontMatter, setIsLoading);

  return (
    <>
      <Helmet>
        <noscript>{`
          <style>
            #${layoutId} {
              grid-template-columns: 0 auto;
            }
            
            #${sideNavId} {
              display: none !important;
            }
            
            .gatsby-resp-image-image {
              opacity: 1 !important;
            }
          </style>
        `}</noscript>
      </Helmet>

      <Global
        styles={css`
          @font-face {
            font-family: "adobe-clean";
            src: url("https://use.typekit.net/af/cb695f/000000000000000000017701/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3")
                format("woff2"),
              url("https://use.typekit.net/af/cb695f/000000000000000000017701/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3")
                format("woff"),
              url("https://use.typekit.net/af/cb695f/000000000000000000017701/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3")
                format("opentype");
            font-display: swap;
            font-style: normal;
            font-weight: 400;
          }

          @font-face {
            font-family: "adobe-clean";
            src: url("https://use.typekit.net/af/74ffb1/000000000000000000017702/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3")
                format("woff2"),
              url("https://use.typekit.net/af/74ffb1/000000000000000000017702/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3")
                format("woff"),
              url("https://use.typekit.net/af/74ffb1/000000000000000000017702/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3")
                format("opentype");
            font-display: swap;
            font-style: italic;
            font-weight: 400;
          }

          @font-face {
            font-family: "adobe-clean";
            src: url("https://use.typekit.net/af/eaf09c/000000000000000000017703/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3")
                format("woff2"),
              url("https://use.typekit.net/af/eaf09c/000000000000000000017703/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3")
                format("woff"),
              url("https://use.typekit.net/af/eaf09c/000000000000000000017703/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3")
                format("opentype");
            font-display: swap;
            font-style: normal;
            font-weight: 700;
          }

          @font-face {
            font-family: "adobe-clean";
            src: url("https://use.typekit.net/af/40207f/0000000000000000000176ff/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n3&v=3")
                format("woff2"),
              url("https://use.typekit.net/af/40207f/0000000000000000000176ff/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n3&v=3")
                format("woff"),
              url("https://use.typekit.net/af/40207f/0000000000000000000176ff/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n3&v=3")
                format("opentype");
            font-display: swap;
            font-style: normal;
            font-weight: 300;
          }

          @font-face {
            font-family: "adobe-clean-serif";
            src: url("https://use.typekit.net/af/505d17/00000000000000003b9aee44/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3")
                format("woff2"),
              url("https://use.typekit.net/af/505d17/00000000000000003b9aee44/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3")
                format("woff"),
              url("https://use.typekit.net/af/505d17/00000000000000003b9aee44/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3")
                format("opentype");
            font-display: swap;
            font-style: normal;
            font-weight: 900;
          }

          html,
          body {
            margin: 0;
            text-size-adjust: none;
            overscroll-behavior: auto contain;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          *[hidden] {
            display: none !important;
          }
        `}
      />
      <Provider
        value={{
          ims,
          location,
          pageContext,
          hasSideNav,
          siteMetadata,
          pathPrefix,
          allSitePage,
          allMdx
        }}
      >
        <ContentSecurityPolicy
          title={frontMatter?.title}
          description={frontMatter?.description}
        />
        { (!pageContext.frontmatter.includeBasecode || pageContext.frontmatter.includeBasecode) && <Basecode /> }
        <div
          dir="ltr"
          className="spectrum spectrum--medium spectrum--large spectrum--light"
          color-scheme="light"
          css={css`
            min-height: 100vh;
            background-color: var(--spectrum-global-color-gray-50);
          `}
        >
          <>
            <div
              id={layoutId}
              css={css`
                display: grid;
                grid-template-areas: "header header" "sidenav main";
                grid-template-rows: var(--spectrum-global-dimension-size-800);
                grid-template-columns: ${hasSideNav
                  ? `${SIDENAV_WIDTH} auto`
                  : "0 auto"};

                @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                  grid-template-columns: 0px auto;
                }

                @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                  grid-template-rows: var(
                    --spectrum-global-dimension-size-1200
                  );
                }
              `}
            >
              <div
                css={css`
                  grid-area: header;
                  position: fixed;
                  height: var(--spectrum-global-dimension-size-800);
                  left: 0;
                  right: 0;
                  background-color: var(--spectrum-global-color-gray-50);
                  z-index: 2;

                  @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                    height: var(--spectrum-global-dimension-size-600);
                  }
                `}
              >
                <GlobalHeader
                  ims={ims}
                  isLoadingIms={isLoadingIms}
                  home={home}
                  versions={versions}
                  pages={pages}
                  docs={docs}
                  location={location}
                  hasSideNav={hasSideNav}
                  toggleSideNav={() => {
                    toggleSideNav(setShowSideNav);
                  }}
                />
              </div>
              <div
                id={sideNavId}
                hidden={!hasSideNav}
                css={css`
                  grid-area: sidenav;
                  position: fixed;
                  z-index: 1;
                  width: ${SIDENAV_WIDTH};
                  height: 100%;
                  background-color: var(--spectrum-global-color-gray-75);

                  @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                    transition: transform
                      var(--spectrum-global-animation-duration-200) ease-in-out;
                    transform: translateX(${showSideNav ? "0" : "-100%"});
                  }
                `}
              >
                {SideNav && (
                  <SideNav
                    selectedPages={sideNavSelectedPages}
                    selectedSubPages={sideNavSelectedSubPages}
                    searchIndex={ParliamentSearchIndex}
                    setShowSideNav={setShowSideNav}
                  />
                )}
              </div>
              <div
                css={css`
                  grid-area: main;
                `}
              >
                <main hidden={!pageSrc["openAPI"].has}>
                  {pageSrc["openAPI"].src &&
                    pageSrc["openAPI"].block &&
                    createElement(pageSrc["openAPI"].block, {
                      src: pageSrc["openAPI"].src
                    })}
                </main>

                <main hidden={!pageSrc["frame"].has}>
                  {pageSrc["frame"].src &&
                    pageSrc["frame"].block &&
                    createElement(pageSrc["frame"].block, {
                      src: pageSrc["frame"].src,
                      height: frontMatter?.frameHeight,
                      location
                    })}
                </main>

                {!pageSrc["openAPI"].has && !pageSrc["frame"].has && children}
              </div>
            </div>

            <div
              css={css`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: ${isLoading ? "grid" : "none"};
                place-items: center center;
              `}
            >
              <ProgressCircle size="L" />
            </div>

            <div
              css={css`
                display: none;

                @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                  display: block;
                  transition: opacity 160ms ease-in;
                  background-color: rgba(0, 0, 0, 0.4);
                  pointer-events: none;
                  opacity: 0;
                  position: fixed;
                  top: 0;
                  left: 0;
                  height: 100%;
                  width: 100%;

                  ${showSideNav &&
                    `
                    pointer-events: auto;
                    opacity: 1;
                  `}
                }
              `}
              onClick={() => {
                toggleSideNav(setShowSideNav);
              }}
            />
          </>
        </div>
      </Provider>
    </>
  );
};
