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

import React, { cloneElement, Children, useContext } from "react";
import { withPrefix } from "gatsby";
import { css } from "@emotion/react";
import { AnchorButton } from "../AnchorButton";
import "@spectrum-css/typography";
import PropTypes from "prop-types";
import {
  getElementChild,
  cloneChildren,
  DESKTOP_SCREEN_WIDTH,
  TABLET_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
  DEFAULT_HOME,
  findSelectedTopPage,
  rootFixPages,
  rootFix
} from "../../utils";
import Context from "../Context";
import { Breadcrumbs } from "../Breadcrumbs";
import classNames from "classnames";

const setImageLoading = child => {
  if (child?.props?.mdxType === "img") {
    return cloneElement(child, {
      loading: "eager"
    });
  }

  return child;
};

const HeroButtons = ({
  buttons,
  variants = ["cta", "primary"],
  quiets = [true, true],
  className
}) =>
  buttons ? (
    <div>
      <div
        className={className}
        css={css`
          display: flex;
          flex-wrap: wrap;
          gap: var(--spectrum-global-dimension-size-200);
        `}
      >
        {Children.map(buttons.props.children, (item, i) => {
          let variant = variants[0];
          let quiet = quiets[0];

          if (i > 0) {
            variant = variants[1];
            quiet = quiets[1];
          }

          const link = getElementChild(item);

          return (
            <div key={i}>
              <AnchorButton
                isQuiet={quiet}
                href={link.props.href}
                variant={variant}
              >
                {link.props.children}
              </AnchorButton>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

const HeroImage = ({ image, styles }) =>
  image
    ? cloneElement(image, {
        children: cloneChildren(image.props.children, setImageLoading),
        css: css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          margin-top: 0;
          ${styles}

          .gatsby-resp-image-wrapper {
            max-width: none !important;
            width: 100% !important;
            height: 100% !important;
          }

          .gatsby-resp-image-image {
            object-fit: cover;
          }
        `
      })
    : null;

const HeroTexts = ({ texts }) => {
  const textKeys = Object.keys(texts).filter(key => key.startsWith("text"));
  return textKeys.map(textKey =>
    cloneElement(texts[textKey], {
      className: "spectrum-Body spectrum-Body--sizeL",
      css: css`
        &.spectrum-Body--sizeL {
          margin-top: 0 !important;

          &:last-of-type {
            margin-bottom: 0 !important;
          }
        }
      `
    })
  );
};

const HeroHeading = ({ heading, variant }) =>
  heading
    ? cloneElement(heading, {
        // force h1 to support gdocs
        mdxType: "h1",
        originalType: "h1",
        className:
          variant === "default"
            ? "spectrum-Heading--sizeXL"
            : "spectrum-Heading--sizeXXL spectrum-Heading--serif",
        css: css`
          margin-top: 0;
          margin-bottom: var(--spectrum-global-dimension-size-200);

          & + p {
            margin-bottom: var(--spectrum-global-dimension-size-200);
          }
        `
      })
    : null;

const Hero = ({
  className,
  background,
  theme = "dark",
  heading,
  image,
  icon,
  buttons,
  variant = "default",
  width = DESKTOP_SCREEN_WIDTH,
  ...props
}) => {
  const { siteMetadata, location } = useContext(Context);

  if (!variant || variant === "default") {
    const { home, pages } = siteMetadata;
    const pathWithRootFix = rootFix(location.pathname);
    const pagesWithRootFix = rootFixPages(pages);
    const selectedTopPage = findSelectedTopPage(
      pathWithRootFix,
      pagesWithRootFix
    );

    return (
      <section
        className={classNames(className, `spectrum--${theme}`)}
        css={css`
          position: relative;
          height: var(--spectrum-global-dimension-size-3400);
          margin-bottom: var(--spectrum-global-dimension-size-400);
          background-color: ${background ?? "rgb( 29, 125, 238)"};
          width: 100%;
          display: flex;

          @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
            overflow: auto;
          }

          @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
            height: calc(100vh - var(--spectrum-global-dimension-size-1200));
          }
        `}
      >
        <HeroImage image={image} styles={`position: absolute;`} />
        <div
          css={css`
            margin: auto;
            display: flex;
            position: relative;
            height: 100%;
            max-width: ${width};
            flex-direction: row;
            width: 100%;
            align-items: center;

            & > p {
              margin-top: 0 !important;
            }
          `}
        >
          <div
            css={css`
              width: calc(5 * 100% / 12);
              position: absolute;
              display: flex;
              flex-direction: column;

              & > p {
                margin-top: var(
                  --spectrum-global-dimension-size-225
                ) !important;
                margin-bottom: 0 !important;
              }

              @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                width: auto;
                padding: 0 var(--spectrum-global-dimension-size-400);
              }
            `}
          >
            {home?.hidden !== true &&
              home?.title &&
              home?.href &&
              selectedTopPage && (
                <Breadcrumbs
                  selectedTopPage={DEFAULT_HOME}
                  selectedSubPages={[
                    { ...home, href: home.href },
                    {
                      ...selectedTopPage,
                      href: withPrefix(
                        selectedTopPage.href.replace("/_ROOT_/", "/")
                      )
                    }
                  ]}
                />
              )}

            <HeroHeading heading={heading} variant={variant} />

            <HeroTexts texts={props} />
          </div>
        </div>
      </section>
    );
  } else {
    const height =
      "calc(var(--spectrum-global-dimension-size-6000) + var(--spectrum-global-dimension-size-250))";

    if (variant === "fullwidth") {
      return (
        <section
          className={classNames(className, `spectrum--${theme}`)}
          css={css`
            position: relative;
            width: 100%;
            height: ${height};
            background: ${background ?? "var(--spectrum-global-color-gray-50)"};

            @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
              overflow: auto;
            }

            @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
              height: 100vh;

              .spectrum-Heading--sizeXXL {
                font-size: var(--spectrum-alias-heading-xl-text-size);
              }
            }
          `}
        >
          <HeroImage image={image} />

          <div
            css={css`
              height: 100%;
              position: absolute;
              top: 0;
              width: 100%;
              box-sizing: border-box;
              padding: 0
                calc(
                  var(--spectrum-global-dimension-size-3600) +
                    var(--spectrum-global-dimension-size-125)
                );
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;

              @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
                padding: 0 var(--spectrum-global-dimension-size-400);
              }
            `}
          >
            <HeroHeading heading={heading} variant={variant} />

            <HeroTexts texts={props} />

            <HeroButtons
              buttons={buttons}
              variants={["cta", "overBackground"]}
              css={css`
                margin-top: var(--spectrum-global-dimension-size-400);
              `}
            />
          </div>
        </section>
      );
    } else if (variant === "halfwidth") {
      return (
        <section
          className={classNames(className, `spectrum--lightest`)}
          css={css`
            background: ${background ?? "var(--spectrum-global-color-gray-50)"};
            width: 100%;
            height: ${height};
            overflow: hidden;

            @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
              height: auto;
              padding: var(--spectrum-global-dimension-size-400);
              box-sizing: border-box;
            }
          `}
        >
          <div
            css={css`
              display: flex;
              height: 100%;
              justify-content: center;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: calc(5 * 100% / 12);
                margin-left: var(--spectrum-global-dimension-size-800);
                margin-right: var(--spectrum-global-dimension-size-400);

                @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
                  width: 100%;
                  margin: 0;
                }
              `}
            >
              {icon &&
                cloneElement(icon, {
                  children: cloneChildren(icon.props.children, setImageLoading),
                  css: css`
                    height: var(--spectrum-global-dimension-size-600);
                    width: var(--spectrum-global-dimension-size-600);
                    margin-top: 0 !important;
                    margin-bottom: var(
                      --spectrum-global-dimension-size-300
                    ) !important;

                    .gatsby-resp-image-wrapper {
                      max-width: none !important;
                      width: 100% !important;
                      height: 100% !important;
                    }

                    .gatsby-resp-image-image {
                      height: 100%;
                      object-fit: contain;
                    }
                  `
                })}

              <HeroHeading heading={heading} isVariant />

              <HeroTexts texts={props} />

              <HeroButtons
                buttons={buttons}
                css={css`
                  margin-top: var(--spectrum-global-dimension-size-400);
                `}
              />
            </div>
            <div
              css={css`
                flex: 1;

                @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
                  display: none;
                }
              `}
            >
              <HeroImage image={image} />
            </div>
          </div>
        </section>
      );
    }
  }
};

Hero.propTypes = {
  background: PropTypes.string,
  heading: PropTypes.element,
  text: PropTypes.element,
  image: PropTypes.element,
  icon: PropTypes.element,
  buttons: PropTypes.element,
  variant: PropTypes.string,
  width: PropTypes.string,
  theme: PropTypes.string
};

HeroButtons.propTypes = {
  buttons: PropTypes.element,
  variants: PropTypes.array,
  quiets: PropTypes.array
};

HeroImage.propTypes = {
  image: PropTypes.element
};

export { Hero, HeroImage, HeroButtons };
