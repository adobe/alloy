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

import React, { Children, cloneElement } from "react";
import { withPrefix } from "gatsby";
import globals from "../../conf/globals";

const cleanMarkdownExtension = pathname => {
  return pathname
    .replace("/src/pages/", "/")
    .replace("/index.md/", "")
    .replace("/index.md", "")
    .replace("index.md", "")
    .replace(".md/", "")
    .replace(".md", "");
};

const gdocsRelativeLinkFix = href => {
  // Support gdoc relative links
  if (href && href.startsWith("#!")) {
    href = href.substr(2);
  }

  return href;
};

const trailingSlashFix = pathname => {
  if (!pathname.endsWith("/")) {
    return `${pathname}/`;
  }

  return pathname;
};

const normalizePagePath = page => {
  if (page?.path) {
    if (isExternalLink(page.path)) {
      page.href = page.path;
    } else {
      const { pathname, search, hash } = new URL(
        page.path,
        "https://example.com"
      );
      const normalizedPath = trailingSlashFix(cleanMarkdownExtension(pathname));

      page.pathname = decodeURIComponent(normalizedPath);
      page.href = `${normalizedPath}${search}${hash}`;
    }
  }
};

const rootFix = pathname => {
  if (pathname === withPrefix("/")) {
    return withPrefix("/_ROOT_/");
  }

  return pathname;
};

const rootFixPages = pages => {
  const rootFixedPages = JSON.parse(JSON.stringify(pages));

  return rootFixedPages.map(page => {
    if (page.pathname === "/") {
      page.pathname = "/_ROOT_/";
      page.href = `/_ROOT_/${page.href.slice(1)}`;
    } else if (page.menu) {
      page.menu = rootFixPages(page.menu);
    }

    return page;
  });
};

const layoutColumns = (columns, gutters = []) =>
  `calc(${columns} * var(--spectrum-global-dimension-static-grid-fixed-max-width) / var(--spectrum-global-dimension-static-grid-columns)${
    gutters.length > 0 ? ` - ${gutters.join(" - ")}` : ""
  })`;

const findSelectedTopPage = (pathname, pages) =>
  pages.find(
    page =>
      pathname.startsWith(withPrefix(page.pathname)) ||
      (page.menu &&
        page.menu.some(menuPage =>
          pathname.startsWith(withPrefix(menuPage.pathname))
        ))
  );

const findSubPages = (pathname, pages, subPages) => {
  if (subPages == null) {
    return [];
  }

  const selectedTopPage = findSelectedTopPage(pathname, pages);
  return subPages.filter(page =>
    withPrefix(page.pathname).startsWith(withPrefix(selectedTopPage?.pathname))
  );
};

const findSelectedPage = (pathname, pages) => {
  if (pages == null) {
    return [];
  }

  return pages?.find(page => pathname === withPrefix(page.pathname));
};

const findSelectedPages = (pathname, pages) => {
  if (pages == null) {
    return [];
  }

  let selectedPages = [];
  let level = 1;

  const find = page => {
    let subPages = [];
    if (page.pathname && pathname.startsWith(withPrefix(page.pathname))) {
      page.level = level;
      subPages.push(page);
    }

    if (page.pages) {
      level++;
      page.pages.forEach(subPage => {
        subPages = [...subPages, ...find(subPage)];
      });
    }

    return subPages;
  };

  pages.forEach(page => {
    const subPages = find(page);
    if (subPages.length) {
      selectedPages.push(subPages);
    }
  });

  return selectedPages.length ? selectedPages.pop() : [];
};

const flattenPages = pages => {
  if (pages == null) {
    return [];
  }

  let flat = [];
  const find = page => {
    flat.push(page);

    if (page.pages) {
      page.pages.forEach(find);
    }
  };

  pages.forEach(find);

  flat = flat.flat();
  return flat.filter(
    (page, index) =>
      page.pathname && page.pathname !== flat[index + 1]?.pathname
  );
};

const findSelectedPageNextPrev = (pathname, pages) => {
  const flat = flattenPages(pages);
  const selectedPage = flat.find(
    page => withPrefix(page.pathname) === pathname
  );

  return {
    nextPage: flat[flat.indexOf(selectedPage) + 1],
    previousPage: flat[flat.indexOf(selectedPage) - 1]
  };
};

const findSelectedPageSiblings = (pathname, pages) => {
  let siblings = [];

  if (pages == null) {
    return siblings;
  }

  const find = page => {
    if (page.pages) {
      const selectedPage = page.pages.find(
        subPage => withPrefix(subPage.pathname) === pathname
      );
      if (selectedPage) {
        siblings = [...page.pages];
      } else {
        page.pages.forEach(find);
      }
    }
  };

  pages.forEach(page => {
    find(page);
  });

  return siblings;
};

const isInternalLink = (pathname, location, allPaths) => {
  if (!pathname) {
    return false;
  }

  const base = new URL(location.pathname, "https://example.com");
  const requestedPath = decodeURI(
    trailingSlashFix(cleanMarkdownExtension(new URL(pathname, base).pathname))
  );

  return allPaths.some(path => path === requestedPath);
};

const fixInternalLink = (pathname, location, pathPrefix) => {
  const base = new URL(location.pathname, "https://example.com");
  const url = new URL(pathname, base);

  return `${trailingSlashFix(
    cleanMarkdownExtension(url.pathname.replace(pathPrefix, ""))
  )}${url.search}${url.hash}`;
};

const isExternalLink = url => {
  url = String(url).replace("#", "");

  let isExternal = true;
  try {
    new URL(url);
  } catch (e) {
    isExternal = false;
  }

  return isExternal;
};

const getExternalLinkProps = (url = null) =>
  url === null ||
  (isExternalLink(url) && !new URL(url).searchParams.has("aio_internal"))
    ? {
        target: "_blank",
        rel: "noopener noreferrer nofollow"
      }
    : {};

const getElementChild = element =>
  React.Children.toArray(element.props.children)[0];

const cloneChildren = (children, changeProps) => {
  return Children.map(children, child => {
    if (child?.props?.children) {
      child = cloneElement(child, {
        children: cloneChildren(child.props.children, changeProps)
      });
    }

    return changeProps(child);
  });
};

const DEFAULT_HOME = {
  title: "Products",
  href: "/apis/"
};
const SIDENAV_WIDTH = globals.SIDENAV_WIDTH;
const MOBILE_SCREEN_WIDTH = globals.MOBILE_SCREEN_WIDTH;
const TABLET_SCREEN_WIDTH = globals.TABLET_SCREEN_WIDTH;
const DESKTOP_SCREEN_WIDTH = globals.DESKTOP_SCREEN_WIDTH;

export {
  normalizePagePath,
  cleanMarkdownExtension,
  gdocsRelativeLinkFix,
  trailingSlashFix,
  rootFix,
  rootFixPages,
  layoutColumns,
  findSelectedTopPage,
  findSubPages,
  findSelectedPage,
  findSelectedPages,
  flattenPages,
  findSelectedPageNextPrev,
  findSelectedPageSiblings,
  isInternalLink,
  fixInternalLink,
  isExternalLink,
  getExternalLinkProps,
  getElementChild,
  cloneChildren,
  DEFAULT_HOME,
  SIDENAV_WIDTH,
  MOBILE_SCREEN_WIDTH,
  TABLET_SCREEN_WIDTH,
  DESKTOP_SCREEN_WIDTH
};
