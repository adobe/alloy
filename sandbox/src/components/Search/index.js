/**
 *  Copyright 2020 Adobe. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 */

import React, { cloneElement } from "react";
import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { navigate, withPrefix } from "gatsby";
import { Index } from "elasticlunr";
import { SearchField } from "../SearchField";
import { Item, Menu, Section } from "../Menu";
import { Popover } from "../Popover";

const SearchResults = ({ results, setIsOpen }) => {
  const docsResultMenuItems = [];
  const apiResultMenuItems = [];

  results.forEach(result => {
    const item = (
      <Item
        key={result.id}
        href={withPrefix(result.path)}
        onKeyPress={event => {
          if (event.key === "enter") {
            setIsOpen(false);
          }
        }}
        onClick={() => {
          setIsOpen(false);
        }}
      >
        {result.title}
      </Item>
    );

    if (result.type === "apis") {
      apiResultMenuItems.push(item);
    } else {
      docsResultMenuItems.push(item);
    }
  });

  const hasDocResults = docsResultMenuItems.length > 0;
  const hasOpenAPIResults = apiResultMenuItems.length > 0;

  if (hasDocResults || hasOpenAPIResults) {
    return (
      <Menu>
        {hasDocResults && (
          <Section title="docs">
            {cloneElement(docsResultMenuItems[0], {
              isHighlighted: true
            })}

            {docsResultMenuItems.slice(1)}
          </Section>
        )}

        {hasDocResults && hasOpenAPIResults && <Item isDivider />}

        {hasOpenAPIResults && (
          <Section title="API References">
            {hasDocResults ? (
              apiResultMenuItems
            ) : (
              <>
                {cloneElement(apiResultMenuItems[0], {
                  isHighlighted: true
                })}

                {apiResultMenuItems.slice(1)}
              </>
            )}
          </Section>
        )}
      </Menu>
    );
  }

  return (
    <div
      css={css`
        margin-top: var(--spectrum-global-dimension-size-800);
        margin-bottom: var(--spectrum-global-dimension-size-800);
      `}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `}
      >
        <h4
          className="spectrum-Heading spectrum-Heading--sizeS"
          css={css`
            margin-bottom: var(--spectrum-global-dimension-size-100);
          `}
        >
          No Results Found
        </h4>
        <em>Try another search term</em>
      </div>
    </div>
  );
};

const Search = ({ searchIndex = {}, ...props }) => {
  const searchRef = useRef(null);
  const [index] = useState(Index.load(searchIndex));
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOutside = event => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const search = searchTerm => {
    const searchResults = index
      .search(searchTerm, { expand: true })
      .map(({ ref }) => index.documentStore.getDoc(ref));

    setResults(searchResults);
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={searchRef}
      css={css`
        position: relative;
      `}
      {...props}
    >
      <SearchField
        css={css`
          width: 100%;
        `}
        onClear={() => {
          setIsOpen(false);
        }}
        onChange={searchTerm => {
          searchTerm.length > 0 ? search(searchTerm) : setIsOpen(false);
        }}
        onSubmit={() => {
          if (results.length > 0) {
            navigate(results[0].path);
            setIsOpen(false);
          }
        }}
      />
      <Popover
        isOpen={isOpen}
        css={css`
          position: absolute;
          top: var(--spectrum-global-dimension-size-800);
          width: var(--spectrum-global-dimension-size-3600);
        `}
      >
        <SearchResults results={results} setIsOpen={setIsOpen} />
      </Popover>
    </div>
  );
};

Search.propTypes = {
  searchIndex: PropTypes.object
};

export { Search };
