import React from "react";

import styles from "./Footer.module.scss";

import Github from "../../assets/images/github-brands.svg";
import Home from "../../assets/images/home-solid.svg";

const Footer = () => {
  return (
    <div className={styles.wrapper}>
      <a
        href="https://www.whatadewitt.com"
        target="_blank"
        title="My homepage"
        rel="noopener noreferrer"
      >
        <Home />
      </a>
      <a
        href="https://www.github.com/whatadewitt"
        target="_blank"
        title="Follow me on Github"
        rel="noopener noreferrer"
      >
        <Github />
      </a>
    </div>
  );
};

export default Footer;
