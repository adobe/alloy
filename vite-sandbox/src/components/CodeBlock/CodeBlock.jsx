import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CodeBlock = ({ code, children }) => (
  <div>
    <SyntaxHighlighter
      language="javascript"
      style={nightOwl}
      customStyle={{ padding: "1em" }}
    >
      {code ? JSON.stringify(code, null, 2) : children}
    </SyntaxHighlighter>
  </div>
);

export default CodeBlock;
