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

import React, { Fragment, useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import nextId from "react-id-generator";
import { withPrefix } from "gatsby";
import { GatsbyLink } from "../GatsbyLink";
import {
  findSelectedTopPage,
  rootFix,
  rootFixPages,
  getExternalLinkProps,
  DESKTOP_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
  DEFAULT_HOME
} from "../../utils";
import { css } from "@emotion/react";
import { AnchorButton } from "../AnchorButton";
import { Button } from "../Button";
import { ProgressCircle } from "../ProgressCircle";
import { Adobe, ChevronDown, TripleGripper } from "../Icons";
import { ActionButton, Text as ActionButtonLabel } from "../ActionButton";
import { PickerButton } from "../Picker";
import { Menu, Item as MenuItem } from "../Menu";
import { Popover } from "../Popover";
import { Image } from "../Image";
import { Link } from "../Link";
import {
  Tabs,
  Item as TabsItem,
  Label as TabsItemLabel,
  TabsIndicator,
  positionIndicator,
  animateIndicator
} from "../Tabs";
import "@spectrum-css/typography";
import "@spectrum-css/assetlist";
import { Divider } from "../Divider";
import DEFAULT_AVATAR from "./avatar.svg";

const getSelectedTabIndex = (location, pages) => {
  const pathWithRootFix = rootFix(location.pathname);
  const pagesWithRootFix = rootFixPages(pages);

  let selectedIndex = pagesWithRootFix.indexOf(
    findSelectedTopPage(pathWithRootFix, pagesWithRootFix)
  );

  // Assume first item is selected
  if (selectedIndex === -1) {
    selectedIndex = 0;
  }

  return selectedIndex;
};

const getAvatar = async userId => {
  try {
    const req = await fetch(
      `https://cc-api-behance.adobe.io/v2/users/${userId}?api_key=SUSI2`
    );
    const res = await req.json();
    return res?.user?.images?.["138"] ?? DEFAULT_AVATAR;
  } catch (e) {
    console.warn(e);
    return DEFAULT_AVATAR;
  }
};

const GlobalHeader = ({
  ims,
  isLoadingIms,
  home,
  versions,
  pages,
  docs,
  location,
  toggleSideNav,
  hasSideNav
}) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    getSelectedTabIndex(location, pages)
  );
  const tabsRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const selectedTabIndicatorRef = useRef(null);
  // Don't animate the tab indicator by default
  const [isAnimated, setIsAnimated] = useState(false);
  const versionPopoverRef = useRef(null);
  const profilePopoverRef = useRef(null);
  const [openVersion, setOpenVersion] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(-1);
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const POPOVER_ANIMATION_DELAY = 200;
  const versionPopoverId = nextId();
  const profilePopoverId = nextId();
  const hasHome = home?.hidden !== true;

  const positionSelectedTabIndicator = index => {
    const selectedTab = pages[index].tabRef;

    if (selectedTab) {
      positionIndicator(selectedTabIndicatorRef, selectedTab);
    }
  };

  useEffect(() => {
    const index = getSelectedTabIndex(location, pages);
    setSelectedTabIndex(index);

    animateIndicator(selectedTabIndicatorRef, isAnimated);
    positionSelectedTabIndicator(index);
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      if (ims && ims.isSignedInUser()) {
        const profile = await ims.getProfile();
        setProfile(profile);
        setAvatar(await getAvatar(profile.userId));
        setIsLoadingProfile(false);
      } else if (!isLoadingIms) {
        setIsLoadingProfile(false);
      }
    })();
  }, [ims]);

  useEffect(() => {
    if (versionPopoverRef.current) {
      if (openVersion) {
        const { top, left } = versionPopoverRef.current.getBoundingClientRect();

        versionPopoverRef.current.style.left = `calc(${left}px + var(--spectrum-global-dimension-size-160))`;
        versionPopoverRef.current.style.top = `${top}px`;
        versionPopoverRef.current.style.position = "fixed";
      } else {
        // Wait for animation to finish
        setTimeout(() => {
          versionPopoverRef.current.style = "";
        }, POPOVER_ANIMATION_DELAY);
      }
    }
  }, [openVersion]);

  useEffect(() => {
    if (openMenuIndex !== -1) {
      const menuRef = pages[openMenuIndex].menuRef;

      const { top, left } = menuRef.current.getBoundingClientRect();

      menuRef.current.style.left = `${left}px`;
      menuRef.current.style.top = `${top}px`;
      menuRef.current.style.position = "fixed";
    } else {
      pages.forEach(page => {
        const menuRef = page.menuRef;
        if (menuRef) {
          // Wait for animation to finish
          setTimeout(() => {
            menuRef.current.style = "";
          }, POPOVER_ANIMATION_DELAY);
        }
      });
    }
  }, [openMenuIndex]);

  useEffect(() => {
    // Clicking outside of menu should close menu
    const onClick = event => {
      if (
        versionPopoverRef.current &&
        !versionPopoverRef.current.contains(event.target)
      ) {
        setOpenVersion(false);
      }

      if (
        profilePopoverRef?.current &&
        !profilePopoverRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }

      pages.some(page => {
        if (
          page?.menuRef?.current &&
          !page.menuRef.current.contains(event.target)
        ) {
          setOpenMenuIndex(-1);
        }
      });
    };

    document.addEventListener("click", onClick);

    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setOpenVersion(false);
      setOpenMenuIndex(-1);
    };

    tabsContainerRef.current.addEventListener("scroll", onScroll, {
      passive: true
    });

    return () =>
      tabsContainerRef.current.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      role="banner"
      css={css`
        height: 100%;
        border-bottom: var(--spectrum-global-dimension-size-10) solid
          var(--spectrum-global-color-gray-200);
        box-sizing: border-box;

        @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
          border-bottom: none;
        }
      `}
    >
      <nav
        css={css`
          height: 100%;
        `}
        role="navigation"
        aria-label="Global"
      >
        <div
          css={css`
            display: grid;
            grid-template-areas: "title navigation optional";
            grid-template-columns: minmax(auto, min-content) auto minmax(
                auto,
                min-content
              );
            align-items: center;
            margin-left: var(--spectrum-global-dimension-size-400);
            margin-right: var(--spectrum-global-dimension-size-200);
            height: 100%;

            @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
              grid-template-columns: minmax(auto, min-content) auto 0 0;
              margin-right: 0;
              margin-left: 0;
              height: calc(100% + var(--spectrum-global-dimension-size-10));
              overflow: hidden;
            }
          `}
        >
          <div
            css={css`
              height: 100%;
              grid-area: title;

              @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                padding-left: ${!hasSideNav
                  ? "var(--spectrum-global-dimension-size-200)"
                  : "0"};
              }
            `}
          >
            <div
              css={css`
                display: flex;
                height: 100%;
                align-items: center;
              `}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <div
                  css={css`
                    display: none;

                    @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                      display: ${hasSideNav ? "block" : "none"};
                      margin: 0 var(--spectrum-global-dimension-size-100);
                    }
                  `}
                >
                  <ActionButton
                    isQuiet
                    onClick={() => {
                      toggleSideNav && toggleSideNav();
                    }}
                  >
                    <TripleGripper />
                  </ActionButton>
                </div>
                <a
                  href="/"
                  css={css`
                    text-decoration: none;
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <Adobe
                      css={css`
                        width: calc(
                          var(--spectrum-global-dimension-size-250) +
                            var(--spectrum-global-dimension-size-25)
                        );
                        height: var(--spectrum-global-dimension-size-225);
                        display: block;
                        margin-right: var(--spectrum-global-dimension-size-100);
                      `}
                    />
                    <strong
                      className="spectrum-Heading spectrum-Heading--sizeXXS"
                      css={css`
                        color: black;
                        font-size: var(--spectrum-global-dimension-size-200);
                        font-weight: 700;
                        white-space: nowrap;
                      `}
                    >
                      Alloy Web SDK
                    </strong>
                  </div>
                </a>
              </div>

              {hasHome && (
                <div
                  css={css`
                    margin-left: var(--spectrum-global-dimension-size-300);
                    height: calc(
                      100% + var(--spectrum-global-dimension-size-10)
                    );
                    border-left: var(--spectrum-global-dimension-size-10) solid
                      var(--spectrum-global-color-gray-200);
                    border-right: var(--spectrum-global-dimension-size-10) solid
                      var(--spectrum-global-color-gray-200);

                    @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                      display: none;
                    }
                  `}
                >
                  <Link isQuiet variant="secondary">
                    <a
                      css={css`
                        display: flex;
                        height: calc(
                          100% - var(--spectrum-global-dimension-size-10)
                        );
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                        padding: 0 var(--spectrum-global-dimension-size-300);
                        white-space: nowrap;
                        color: var(--spectrum-global-color-gray-700);
                        transition: background-color
                            var(--spectrum-global-animation-duration-100)
                            ease-out,
                          color var(--spectrum-global-animation-duration-100)
                            ease-out;

                        &:hover {
                          background-color: var(
                            --spectrum-global-color-gray-75
                          );
                          color: var(--spectrum-global-color-gray-900);
                          text-decoration: none;
                        }
                      `}
                      href={home?.href || DEFAULT_HOME.href}
                      {...getExternalLinkProps(home?.href || DEFAULT_HOME.href)}
                    >
                      {home?.title || DEFAULT_HOME.title}
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div
            ref={tabsContainerRef}
            css={css`
              grid-area: navigation;
              margin-left: ${hasHome
                ? "var(--spectrum-global-dimension-size-200)"
                : "var(--spectrum-global-dimension-size-300)"};

              @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                overflow-x: auto;
                overflow-x: overlay;
                overflow-y: hidden;
                -ms-overflow-style: none;
                scrollbar-width: none;

                &::-webkit-scrollbar {
                  display: none;
                }

                margin-right: var(--spectrum-global-dimension-size-2000);
              }

              @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                position: fixed;
                top: calc(
                  var(--spectrum-global-dimension-size-600) -
                    var(--spectrum-global-dimension-size-10)
                );
                height: var(--spectrum-global-dimension-size-600);
                left: 0;
                right: 0;
                margin-left: 0;
                margin-right: 0;
                background-color: var(--spectrum-global-color-gray-50);
                border-bottom: var(--spectrum-global-dimension-size-10) solid
                  var(--spectrum-global-color-gray-200);
              }
            `}
          >
            <div
              css={css`
                display: none;

                @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                  display: block;
                  pointer-events: none;
                  position: fixed;
                  top: var(--spectrum-global-dimension-size-600);
                  height: calc(
                    var(--spectrum-global-dimension-size-600) -
                      var(--spectrum-global-dimension-size-25)
                  );
                  right: 0;
                  width: var(--spectrum-global-dimension-size-300);
                  background: -webkit-linear-gradient(
                    0deg,
                    rgba(255, 255, 255, 0),
                    white
                  );
                  z-index: 1;
                }
              `}
            />

            <Tabs
              css={css`
                @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                  padding-bottom: var(--spectrum-global-dimension-size-400);
                  margin-top: var(--spectrum-global-dimension-size-400);
                }

                @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                  padding-bottom: 0;
                  margin-top: 0;
                }
              `}
              ref={tabsRef}
              onFontsReady={() => {
                positionSelectedTabIndicator(selectedTabIndex);
                setIsAnimated(true);
              }}
            >
              {hasHome && (
                <div
                  css={css`
                    display: none;
                    margin-right: var(--spectrum-global-dimension-size-300);

                    @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                      display: block;
                    }
                  `}
                >
                  <TabsItem
                    elementType={GatsbyLink}
                    to={home?.href || DEFAULT_HOME.href}
                    {...getExternalLinkProps(home?.href || DEFAULT_HOME.href)}
                  >
                    <TabsItemLabel>
                      {home?.title || DEFAULT_HOME.title}
                    </TabsItemLabel>
                  </TabsItem>
                </div>
              )}
              {pages.map((page, i) => {
                const isSelectedTab = selectedTabIndex === i;
                const menuPopoverId = nextId();

                const setTabRef = element => {
                  page.tabRef = { current: element };
                };

                const setTabMenuRef = element => {
                  page.menuRef = { current: element };
                };

                return (
                  <Fragment key={i}>
                    {page.href ? (
                      <TabsItem
                        elementType={GatsbyLink}
                        {...getExternalLinkProps(page.href)}
                        ref={setTabRef}
                        to={withPrefix(page.href)}
                        selected={isSelectedTab}
                      >
                        <TabsItemLabel>{page.title}</TabsItemLabel>
                      </TabsItem>
                    ) : (
                      <TabsItem
                        css={css`
                          ${openMenuIndex === i &&
                            `
                          &:after {
                            content: '';
                            position: absolute;
                            z-index: -1;
                            height: var(--spectrum-global-dimension-size-800);
                            width: calc(100% + var(--spectrum-global-dimension-size-250));
                            left: calc(-1 * var(--spectrum-global-dimension-size-125));
                            top: calc(-1 * var(--spectrum-global-dimension-size-100));
                            background-color: var(--spectrum-global-color-gray-100);
                          }
                        `}
                        `}
                        ref={setTabRef}
                        selected={isSelectedTab}
                        aria-controls={menuPopoverId}
                        onClick={event => {
                          event.stopImmediatePropagation();

                          setOpenVersion(false);
                          setOpenProfile(false);
                          setOpenMenuIndex(openMenuIndex === i ? -1 : i);
                        }}
                      >
                        <TabsItemLabel>{page.title}</TabsItemLabel>
                        <ChevronDown
                          css={css`
                            width: var(
                              --spectrum-global-dimension-size-125
                            ) !important;
                            height: var(
                              --spectrum-global-dimension-size-125
                            ) !important;
                            margin-left: var(
                              --spectrum-global-dimension-size-100
                            );
                            transition: transform
                              var(--spectrum-global-animation-duration-100)
                              ease-in-out;
                            ${openMenuIndex === i &&
                              `transform: rotate(-90deg);`}
                          `}
                        />
                        <Popover
                          ref={setTabMenuRef}
                          id={menuPopoverId}
                          css={css`
                            margin-left: calc(-1 * var(--spectrum-global-dimension-size-65));
                            margin-top: var(--spectrum-global-dimension-size-25);
                            border-top-left-radius: 0;
                            border-top-right-radius: 0;
                            ${page.menu.some(menu => menu.description) &&
                              `width: var(--spectrum-global-dimension-size-2400);`}

                            @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                              margin-top: calc(-1 * var(--spectrum-global-dimension-size-40));
                            }
                          `}
                          isOpen={openMenuIndex === i}
                        >
                          <Menu>
                            {page.menu.map((menu, k) => (
                              <MenuItem key={k} href={withPrefix(menu.href)}>
                                {menu.description ? (
                                  <div
                                    css={css`
                                      margin: var(
                                          --spectrum-global-dimension-size-100
                                        )
                                        0;
                                    `}
                                  >
                                    <div
                                      css={css`
                                        color: var(
                                          --spectrum-global-color-gray-900
                                        );
                                      `}
                                    >
                                      {menu.title}
                                    </div>
                                    <div
                                      className="spectrum-Body spectrum-Body--sizeXS"
                                      css={css`
                                        white-space: normal;
                                        margin-top: var(
                                          --spectrum-global-dimension-size-50
                                        );
                                      `}
                                    >
                                      {menu.description}
                                    </div>
                                  </div>
                                ) : (
                                  <span>{menu.title}</span>
                                )}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Popover>
                      </TabsItem>
                    )}
                    {i === 0 && versions?.length > 0 && (
                      <div
                        css={css`
                          margin-left: var(
                            --spectrum-global-dimension-size-100
                          ) !important;
                          margin-right: var(
                            --spectrum-global-dimension-size-300
                          );
                        `}
                      >
                        <PickerButton
                          isQuiet
                          isOpen={openVersion}
                          aria-controls={versionPopoverId}
                          onClick={event => {
                            event.stopImmediatePropagation();

                            setOpenMenuIndex(-1);
                            setOpenProfile(false);
                            setOpenVersion(open => !open);
                          }}
                        >
                          {versions.find(({ selected }) => selected)?.title}
                        </PickerButton>
                        <Popover
                          ref={versionPopoverRef}
                          id={versionPopoverId}
                          variant="picker"
                          isQuiet
                          isOpen={openVersion}
                        >
                          <Menu>
                            {versions.map((version, k) => (
                              <MenuItem
                                key={k}
                                isSelected={version.selected}
                                isHighlighted={version.selected}
                                onClick={() => {
                                  setOpenVersion(false);
                                }}
                                href={version.href}
                              >
                                {version.title}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Popover>
                      </div>
                    )}
                  </Fragment>
                );
              })}
              <TabsIndicator
                ref={selectedTabIndicatorRef}
                css={css`
                  bottom: calc(
                    -1 * var(--spectrum-global-dimension-size-125)
                  ) !important;

                  @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
                    bottom: calc(
                      var(--spectrum-global-dimension-size-400) -
                        var(--spectrum-global-dimension-size-125)
                    ) !important;
                  }

                  @media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {
                    bottom: calc(
                      -1 * var(--spectrum-tabs-rule-size)
                    ) !important;
                  }
                `}
              />
              {docs && (
                <div
                  css={css`
                    margin-left: var(--spectrum-global-dimension-size-400);
                    white-space: nowrap;
                  `}
                >
                  <AnchorButton variant="primary" href={withPrefix(docs.href)}>
                    {docs.title ?? "View Docs"}
                  </AnchorButton>
                </div>
              )}
            </Tabs>
          </div>
          <div
            css={css`
              grid-area: optional;
              justify-self: flex-end;
            `}
          >
            <div
              css={css`
                display: flex;
              `}
            >
              {process.env.GATSBY_IMS_SRC && process.env.GATSBY_IMS_CONFIG && (
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: var(--spectrum-global-dimension-size-200);
                    width: var(--spectrum-global-dimension-size-800);
                  `}
                >
                  <ProgressCircle size="S" hidden={!isLoadingIms} />

                  <ActionButton
                    css={css`
                      margin-top: calc(
                        -1 * var(--spectrum-global-dimension-size-25)
                      );
                    `}
                    hidden={isLoadingIms || isLoadingProfile || profile}
                    variant="primary"
                    isQuiet
                    onClick={() => {
                      ims.signIn();
                    }}
                  >
                    <ActionButtonLabel>Sign in</ActionButtonLabel>
                  </ActionButton>

                  <div hidden={!profile}>
                    <button
                      aria-label="Profile"
                      aria-controls={profilePopoverId}
                      onClick={event => {
                        event.stopImmediatePropagation();

                        setOpenVersion(false);
                        setOpenMenuIndex(-1);
                        setOpenProfile(open => !open);
                      }}
                      css={css`
                        display: block;
                        padding: 0;
                        border: none;
                        width: var(--spectrum-global-dimension-size-400);
                        height: var(--spectrum-global-dimension-size-400);
                        border-radius: var(
                          --spectrum-global-dimension-static-percent-50
                        );
                        background: var(--spectrum-global-color-gray-50);
                        overflow: hidden;
                        cursor: pointer;
                      `}
                    >
                      <Image alt="Avatar" src={avatar} />
                    </button>
                    <Popover
                      id={profilePopoverId}
                      ref={profilePopoverRef}
                      isOpen={openProfile}
                      css={css`
                        width: var(--spectrum-global-dimension-size-3400);
                        max-height: var(--spectrum-global-dimension-size-4600);
                        margin-left: calc(
                          -1 * var(--spectrum-global-dimension-size-3000)
                        );
                      `}
                    >
                      <div
                        css={css`
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-direction: column;
                        `}
                      >
                        <div
                          css={css`
                            width: var(--spectrum-global-dimension-size-800);
                            height: var(--spectrum-global-dimension-size-800);
                            border-radius: var(
                              --spectrum-global-dimension-static-percent-50
                            );
                            background: var(--spectrum-global-color-gray-50);
                            overflow: hidden;
                            margin-top: var(
                              --spectrum-global-dimension-size-400
                            );
                            margin-bottom: var(
                              --spectrum-global-dimension-size-200
                            );
                          `}
                        >
                          <Image alt="Avatar" src={avatar} />
                        </div>

                        <div
                          className="spectrum-Heading spectrum-Heading--sizeL spectrum-Heading--light"
                          css={css`
                            padding: 0 var(--spectrum-global-dimension-size-200);
                            text-align: center;
                          `}
                        >
                          {profile && profile.displayName}
                        </div>

                        <div
                          css={css`
                            margin: var(--spectrum-global-dimension-size-200) 0;
                            padding: 0 var(--spectrum-global-dimension-size-200);
                            box-sizing: border-box;
                            width: 100%;
                          `}
                        >
                          <Divider size="S" />
                        </div>

                        <AnchorButton
                          href="https://account.adobe.com/"
                          variant="primary"
                          isQuiet
                        >
                          Edit Profile
                        </AnchorButton>

                        <Button
                          variant="primary"
                          css={css`
                            margin: var(--spectrum-global-dimension-size-200) 0;
                          `}
                          onClick={() => {
                            ims.signOut();
                          }}
                        >
                          Sign out
                        </Button>
                      </div>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

GlobalHeader.propTypes = {
  ims: PropTypes.object,
  isLoadingIms: PropTypes.bool,
  home: PropTypes.object,
  versions: PropTypes.array,
  pages: PropTypes.array,
  docs: PropTypes.object,
  location: PropTypes.object,
  toggleSideNav: PropTypes.func,
  hasSideNav: PropTypes.bool
};

export { GlobalHeader };
