import React from "react";

import styles from "./tabs.module.scss";
import cx from "classnames";

const Tabs = ({ activeTab, setActiveTab }) => (
    <div className={styles.tabs}>
        <div
            onClick={() => setActiveTab("description")}
            className={cx(styles.tab, styles.description, {
                [styles.active]: activeTab === "description",
            })}
        >
            Description
        </div>
        <div
            onClick={() => setActiveTab("tester")}
            className={cx(styles.tab, styles.test, {
                [styles.active]: activeTab === "tester",
            })}
        >
            Sandbox
        </div>
    </div>
);

export default Tabs;
