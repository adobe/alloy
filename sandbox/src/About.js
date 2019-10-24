import React from "react";

export default function About() {
  return (
    <div>
      <h2>About Us</h2>
      <h3>This is the About Us view, part of the Single Page Application.</h3>
      <p>
        We have implemented a custom code that listens for Browser History
        changes, and triggers a <br />
        `ViewStart` event on every change.
      </p>
    </div>
  );
}
