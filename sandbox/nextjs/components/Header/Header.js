import React from "react";

import styles from "./Header.module.scss";
import cx from "classnames";

import Logo from "../../assets/images/adobe-logo.svg";

const Header = ({ toggleNav }) => (
  <header className={styles.wrapper}>
    <div className={styles.toggle} onClick={toggleNav}>
      <div />
      <div />
      <div />
    </div>
    <div className={cx(styles.icon, styles.logo)}>
      <Logo />
      <div className={styles.title}>
        <span className={styles.hidden}></span>Adobe Experience Platform Web SDK
      </div>
    </div>
  </header>
);

export default Header;
