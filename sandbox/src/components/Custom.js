import React from "react";

const Custom = ({ children, color }) => (
  <p style={{ color, fontSize: "16px", textAlign: "center" }}>{children}</p>
);

export default Custom;
