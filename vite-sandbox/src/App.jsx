import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import logo from "./assets/images/adobe-logo.svg";
import styles from "./App.module.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div className={styles.App}>
        <header className={styles["App-header"]}>
          <img src={logo} className={styles["App-logo"]} alt="logo" />
          <p>
            <button onClick={() => setCount(count => count + 1)}>
              count is: {count}
            </button>
          </p>
          <p>
            Edit <code>App.jsx</code> and save to test HMR updates.
          </p>
          {/* Testing env variable - https://vitejs.dev/guide/env-and-mode.html#env-files */}
          <p>SVG path: {`${import.meta.env.VITE_SVG_PATH}`}</p>
          <p>
            <a
              className={styles["App-link"]}
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            {" | "}
            <a
              className={styles["App-link"]}
              href="https://vitejs.dev/guide/features.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vite Docs
            </a>
          </p>
          <Switch>
            <Route path="/about">
              <main>About</main>
            </Route>
            <Route path="/">
              <main>Home</main>
            </Route>
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;
