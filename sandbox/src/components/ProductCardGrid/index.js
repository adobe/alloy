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

// TODO reuse ProductCard

import React, { useState, useEffect } from "react";
import { css } from "@emotion/react";
import { AnchorButton } from "../AnchorButton";
import { Checkbox } from "../Checkbox";
import { Picker } from "../Picker";
import "@spectrum-css/typography";
import "@spectrum-css/card";
import { Image } from "../Image";
import { DESKTOP_SCREEN_WIDTH } from "../../utils";
import PropTypes from "prop-types";

const filterByClouds = (
  products,
  cloudFilter,
  additionalFilter,
  setFilteredProducts
) => {
  const filteredProducts = products.filter(({ cloud }) =>
    cloudFilter.some(selectedCloud => cloud === selectedCloud)
  );
  const selectedFilter = additionalFilters.find(
    ({ value }) => value === additionalFilter
  );

  setFilteredProducts(
    selectedFilter.filter(filteredProducts, selectedFilter.ids)
  );
};

const filterByName = products =>
  products.sort(({ name: nameA }, { name: nameB }) =>
    nameA.localeCompare(nameB)
  );

const filterByLastUpdated = products =>
  products.sort(
    ({ lastUpdated: lastUpdatedA }, { lastUpdated: lastUpdatedB }) => {
      if (new Date(lastUpdatedB) > new Date(lastUpdatedA)) {
        return 1;
      } else if (new Date(lastUpdatedB) < new Date(lastUpdatedA)) {
        return -1;
      }
      return 0;
    }
  );

const filterById = (products, ids = []) => {
  const filteredProducts = [];
  ids.forEach(productId => {
    const product = products.find(({ id }) => id === productId);
    if (product) {
      filteredProducts.push(product);
    }
  });
  return filteredProducts;
};

const additionalFilters = [
  {
    title: "Last updated",
    value: "last_updated",
    filter: filterByLastUpdated
  },
  {
    title: "Name",
    value: "name",
    filter: filterByName
  },
  {
    title: "Custom",
    value: "id",
    filter: filterById
  }
];

const ProductCardGrid = ({
  clouds = [],
  products = [],
  interaction = false,
  orderBy = "last_updated",
  filterByCloud = [],
  filterByIds = []
}) => {
  if (filterByIds.length) {
    orderBy = "id";
  }

  const defaultFilter = additionalFilters.find(
    ({ value }) => value === orderBy
  );
  defaultFilter.ids = filterByIds;

  const [additionalFilter, setAdditionalFilter] = useState(defaultFilter.value);
  const [filteredProducts, setFilteredProducts] = useState(
    defaultFilter.filter(products, defaultFilter.ids)
  );
  const [cloudFilter, setCloudFilter] = useState(filterByCloud);

  useEffect(() => {
    filterByClouds(
      products,
      cloudFilter.length ? cloudFilter : clouds,
      additionalFilter,
      setFilteredProducts
    );
  }, [cloudFilter, additionalFilter]);

  const height =
    "calc(var(--spectrum-global-dimension-size-4600) - var(--spectrum-global-dimension-size-500))";
  const width =
    "calc(var(--spectrum-global-dimension-size-4600) - var(--spectrum-global-dimension-size-800))";

  return (
    <section
      className={`spectrum--light`}
      css={css`
        max-width: ${DESKTOP_SCREEN_WIDTH};
        margin: var(--spectrum-global-dimension-size-400) auto;
      `}
    >
      {interaction && (
        <div
          css={css`
            display: flex;
            align-items: center;
            height: var(--spectrum-global-dimension-size-800);
            justify-content: flex-end;
            margin-right: var(--spectrum-global-dimension-size-400);
          `}
        >
          <Picker
            isQuiet
            items={additionalFilters.slice(0, 2).map(filter => {
              return filter.value === orderBy
                ? {
                    selected: true,
                    ...filter
                  }
                : filter;
            })}
            aria-label="Filter by name or last updated product"
            onChange={index => {
              setAdditionalFilter(additionalFilters[index].value);
            }}
          />
        </div>
      )}
      <div
        css={css`
          display: flex;
          @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
            align-items: flex-start;
            flex-wrap: wrap;
          }
        `}
      >
        {interaction && (
          <div
            css={css`
              display: flex;
              align-items: flex-end;
              width: var(--spectrum-global-dimension-size-3000);
              flex-direction: column;
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: flex-start;
                flex-direction: column;
              `}
            >
              <h4
                className="spectrum-Heading spectrum-Heading--sizeXS"
                css={css`
                  margin-bottom: var(--spectrum-global-dimension-size-100);
                `}
              >
                Filter by
              </h4>

              <div
                css={css`
                  margin-top: var(--spectrum-global-dimension-size-100);
                  display: flex;
                  flex-direction: column;
                `}
              >
                {clouds.map((cloud, i) => (
                  <Checkbox
                    key={i}
                    value={cloud}
                    onChange={checked => {
                      if (checked) {
                        setCloudFilter([...cloudFilter, cloud]);
                      } else {
                        setCloudFilter(
                          cloudFilter.filter(filter => filter !== cloud)
                        );
                      }
                    }}
                    css={css`
                      margin-bottom: var(--spectrum-global-dimension-size-100);
                    `}
                  >
                    {cloud}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
        )}
        <div
          css={css`
            flex: 1;
          `}
        >
          <div
            css={css`
              display: grid;
              grid-template-columns: repeat(auto-fit, ${width});
              grid-auto-rows: ${height};
              justify-content: center;
              gap: var(--spectrum-global-dimension-size-400);

              @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                margin-top: var(--spectrum-global-dimension-size-400);
                display: flex;
                flex-wrap: wrap;
              }
            `}
          >
            {filteredProducts.map(product => (
              <div
                key={product.id}
                role="figure"
                tabIndex="0"
                className="spectrum-Card"
                css={css`
                  width: ${width};
                  height: ${height};

                  &:hover {
                    border-color: var(--spectrum-global-color-gray-200);
                  }

                  @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                    width: 0;
                  }
                `}
              >
                <div
                  className="spectrum-Card-body"
                  css={css`
                    height: var(--spectrum-global-dimension-size-3000);
                    overflow: auto;
                    text-align: left;
                  `}
                >
                  <div>
                    {product.icon && (
                      <div
                        css={css`
                          height: var(--spectrum-global-dimension-size-600);
                          width: var(--spectrum-global-dimension-size-600);
                          margin-bottom: var(
                            --spectrum-global-dimension-size-200
                          );
                        `}
                      >
                        <Image src={product.icon} aria-hidden="true" alt="" />
                      </div>
                    )}
                  </div>
                  <div
                    className="spectrum-Card-header spectrum-Heading spectrum-Heading--sizeXXS"
                    css={css`
                      margin-top: 0 !important;
                      margin-bottom: var(
                        --spectrum-global-dimension-size-100
                      ) !important;
                    `}
                  >
                    <div
                      className="spectrum-Card-title"
                      css={css`
                        font-size: var(--spectrum-global-dimension-size-200);
                      `}
                    >
                      <strong>{product.name}</strong>
                    </div>
                  </div>
                  <div
                    className="spectrum-Card-content spectrum-Body spectrum-Body--sizeS"
                    css={css`
                      height: auto;
                      margin-bottom: 0 !important;
                    `}
                  >
                    {product.description}
                  </div>
                </div>
                <div className="spectrum-Card-footer">
                  <div
                    css={css`
                      display: flex;
                      justify-content: flex-end;
                      flex-wrap: wrap;
                      --gap: var(--spectrum-global-dimension-size-200);
                      margin: calc(-1 * var(--gap)) 0 0 calc(-1 * var(--gap));
                      width: calc(100% + var(--gap));

                      @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                        justify-content: center;
                      }
                    `}
                  >
                    {product.discover && (
                      <div
                        css={css`
                          margin: var(--gap) 0 0 var(--gap);
                        `}
                      >
                        <AnchorButton
                          isQuiet
                          href={product.discover}
                          variant="secondary"
                        >
                          Learn more
                        </AnchorButton>
                      </div>
                    )}

                    {product.docs && (
                      <div
                        css={css`
                          margin: var(--gap) 0 0 var(--gap);
                        `}
                      >
                        <AnchorButton href={product.docs} variant="primary">
                          View docs
                        </AnchorButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

ProductCardGrid.propTypes = {
  clouds: PropTypes.array,
  products: PropTypes.array,
  orderBy: PropTypes.string,
  filterBy: PropTypes.array,
  interaction: PropTypes.bool
};

export { ProductCardGrid };
