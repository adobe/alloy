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

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "../Link";
import { css } from "@emotion/react";
import classNames from "classnames";
import { layoutColumns, DESKTOP_SCREEN_WIDTH } from "../../utils";
import "@spectrum-css/typography";

// Builds a ToC based on the current rendered document
const readTableOfContents = (headings, setTableOfContentsItems) => {
  const newTableOfContentsItems = [
    {
      items: []
    }
  ];

  headings.forEach((heading, index) => {
    if (heading.previousElementSibling && heading.previousElementSibling.id) {
      const title = heading.textContent.trim().slice(0, -1);
      const url = heading.querySelector("a").getAttribute("href");

      if (heading.tagName === "H2") {
        if (index === 0) {
          newTableOfContentsItems[0].title = title;
          newTableOfContentsItems[0].url = url;
        } else {
          newTableOfContentsItems.push({
            title,
            url,
            items: []
          });
        }
      } else if (heading.tagName === "H3") {
        newTableOfContentsItems[newTableOfContentsItems.length - 1].items.push({
          title,
          url
        });
      }
    }
  });

  setTableOfContentsItems(newTableOfContentsItems);
};

const OnThisPage = ({ tableOfContents }) => {
  const [activeHeadingLink, setActiveHeadingLink] = useState("");
  const [tableOfContentsItems, setTableOfContentsItems] = useState(
    tableOfContents?.items?.[0]?.items
  );

  // To support transclusion with headings
  useEffect(() => {
    const headings = document.querySelectorAll("h2, h3");

    if (!tableOfContentsItems) {
      readTableOfContents(headings, setTableOfContentsItems);
    } else {
      const allHeadings2and3Ids = [];

      tableOfContentsItems.forEach(heading2 => {
        if (heading2.url) {
          allHeadings2and3Ids.push(heading2.url.substr(1));
        }

        if (heading2.items) {
          heading2.items.forEach(heading3 => {
            if (heading3.url) {
              allHeadings2and3Ids.push(heading3.url.substr(1));
            }
          });
        }
      });

      const found = Array.from(headings).some(heading => {
        // Identify headings with anchors
        if (
          heading.previousElementSibling &&
          heading.previousElementSibling.id
        ) {
          return !allHeadings2and3Ids.includes(
            heading.previousElementSibling.id
          );
        }

        return false;
      });

      if (found) {
        readTableOfContents(headings, setTableOfContentsItems);
      }
    }
  }, []);

  // Highlights the visible sections on the page based on scrolling
  useEffect(() => {
    const observers = [];
    let activeHeadingLinks = [];
    const headingLinks = Array.from(
      document.querySelectorAll("h2 span a, h3 span a")
    );
    const findActiveHeadingLink = () => {
      let activeHref = null;

      headingLinks.some(headingLink => {
        const href = headingLink.getAttribute("href");
        return activeHeadingLinks.some(activeSection => {
          if (activeSection === href) {
            activeHref = href;
            return true;
          }

          return false;
        });
      });

      return activeHref;
    };

    headingLinks.forEach(headingLink => {
      const observer = new window.IntersectionObserver(entries => {
        for (const entry of entries) {
          const href = headingLink.getAttribute("href");
          activeHeadingLinks = activeHeadingLinks.filter(
            activeHref => activeHref !== href
          );

          if (entry.isIntersecting) {
            activeHeadingLinks.push(href);
          }
        }

        const activeHeadingLink = findActiveHeadingLink();
        if (activeHeadingLink) {
          setActiveHeadingLink(findActiveHeadingLink());
        }
      });

      observer.observe(headingLink);
      observers.push(observer);
    });

    return () => {
      headingLinks.forEach(i => observers?.[i]?.disconnect());
    };
  }, []);

  const Outline = () => (
    <nav role="navigation" aria-label="Article Outline">
      <h4
        className="spectrum-Detail spectrum-Detail--sizeL"
        css={css`
          color: var(--spectrum-global-color-gray-600);
          margin-bottom: var(--spectrum-global-dimension-size-250);
        `}
      >
        On this page
      </h4>
      <ol
        className="spectrum-Body spectrum-Body--sizeM"
        css={css`
          list-style: none;
          padding: 0;

          & span.is-active a {
            font-weight: bold;
            color: var(--spectrum-global-color-gray-900);
          }
        `}
      >
        {tableOfContentsItems.map((section, index) => (
          <li
            key={index}
            css={css`
              margin-top: var(--spectrum-global-dimension-size-150);
            `}
          >
            <span
              className={classNames({
                "is-active": activeHeadingLink === section.url
              })}
            >
              <Link isQuiet={true}>
                <a href={section.url}>{section.title}</a>
              </Link>
            </span>
            {section?.items?.length > 0 && (
              <ul
                css={css`
                  list-style: none;
                  padding-left: var(--spectrum-global-dimension-size-200);
                `}
              >
                {section.items.map((subSection, subIndex) => (
                  <li key={subIndex}>
                    <span
                      className={classNames({
                        "is-active": activeHeadingLink === subSection.url
                      })}
                    >
                      <Link isQuiet={true}>
                        <a href={subSection.url}>{subSection.title}</a>
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <aside
      css={css`
        position: sticky;
        bottom: 0;
        margin-top: var(--spectrum-global-dimension-size-1600);
        top: calc(
          var(--spectrum-global-dimension-size-800) +
            var(--spectrum-global-dimension-size-400)
        );
        left: ${layoutColumns(12)};
        width: ${layoutColumns(2)};
        margin-left: var(--spectrum-global-dimension-size-400);
        transition: opacity var(--spectrum-global-animation-duration-100)
          ease-in-out;
        height: calc(100vh - var(--spectrum-global-dimension-size-1600));
        overflow: auto;
        box-sizing: border-box;
        padding-bottom: var(--spectrum-global-dimension-size-200);

        @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
          display: none;
        }
      `}
    >
      <Outline />
    </aside>
  );
};

OnThisPage.propTypes = {
  tableOfContents: PropTypes.object
};

export { OnThisPage };
