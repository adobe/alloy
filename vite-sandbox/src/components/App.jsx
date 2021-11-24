import React, { useState, Fragment } from "react";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <Fragment>
      <header>
        <h1>Hello Vite + React!</h1>
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is: {count}
        </button>
        <p>Edit App.jsx and save to test HMR updates.</p>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </Fragment>
  );
};

export default App;
