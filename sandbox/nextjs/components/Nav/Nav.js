import React, { useContext, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import styles from "./Nav.module.scss";
import cx from "classnames";

import { Context } from "../../context";

const Nav = ({ show }) => {
  const [subnavToggle, setSubnavToggle] = useState({
    resources: false,
    collections: false
  });

  const { pathname } = useRouter();
  const {
    state: { user },
    dispatch
  } = useContext(Context);

  const toggleSubnav = key => {
    setSubnavToggle({ ...subnavToggle, [key]: !subnavToggle[key] });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (new RegExp("resource").test(pathname)) {
      setSubnavToggle({ ...subnavToggle, resources: true });
    } else if (new RegExp("collection").test(pathname)) {
      setSubnavToggle({ ...subnavToggle, collections: true });
    }
  }, [pathname]);

  return (
    <div
      className={cx(styles.wrapper, {
        [styles.show]: show
      })}
    >
      <ul className={cx(styles.list, styles.main)}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/configuration">Configuration</Link>
        </li>
        {/*<li>*/}
        {/*  <Link href="/identity">Identity</Link>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <Link href="/datacollection">Data collection</Link>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <Link href="/personalization">Personalization</Link>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <Link href="/consent">Consent</Link>*/}
        {/*</li>*/}
      </ul>

      <ul className={styles.list}>
        <li>
          <Link href="/changelog" title="Changelog">
            Changelog
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/adobe/alloy"
            target="_blank"
            title="Source on Github"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </li>
        <li>
          <a
            href="https://www.npmjs.com/package/@adobe/alloy"
            target="_blank"
            title="NPM page"
            rel="noopener noreferrer"
          >
            NPM
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Nav;
