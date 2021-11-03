import { useState } from "react";

import Head from "next/head";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Nav from "../Nav/Nav";

import styles from "./Layout.module.scss";
import cx from "classnames";

export default function Layout({ children }) {
  const [showNav, toggleNav] = useState(false);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta property="og:image" content="/open-graph.png" />
      </Head>

      <div className={styles.container}>
        <Header
          toggleNav={() => {
            toggleNav(!showNav);
          }}
        />

        <div className={styles.wrapper}>
          <Nav show={showNav} />
          <div
            className={cx(styles.main, {
              [styles.navToggled]: showNav
            })}
          >
            {children}
          </div>
        </div>
        <script>document.write("Hello");</script>
      </div>
      <Footer />
    </>
  );
}
