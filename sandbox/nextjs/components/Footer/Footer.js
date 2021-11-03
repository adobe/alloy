import React from "react";

import styles from "./Footer.module.scss";

import Github from "../../assets/images/github-brands.svg";
import Home from "../../assets/images/home-solid.svg";
import LinkedIn from "../../assets/images/linkedin-in-brands.svg";
import Twitter from "../../assets/images/twitter-brands.svg";

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
        href="https://www.twitter.com/whatadewitt"
        target="_blank"
        title="Follow me on Twitter"
        rel="noopener noreferrer"
      >
        <Twitter />
      </a>
      <a
        href="https://www.github.com/whatadewitt"
        target="_blank"
        title="Follow me on Github"
        rel="noopener noreferrer"
      >
        <Github />
      </a>
      <a
        href="https://www.linkedin.com/in/lukedewitt/"
        target="_blank"
        title="Connect on LinkedIn"
        rel="noopener noreferrer"
      >
        <LinkedIn />
      </a>
    </div>
  );
};

export default Footer;
