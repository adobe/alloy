import React, { useEffect } from "react";

const withScript = (WrappedComponent, scriptSrc) => {
  return (props) => {
    useEffect(() => {
      // Dynamically load the script
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      document.head.appendChild(script);

      return () => {
        // Remove the script when the component unmounts
        document.head.removeChild(script);
      };
    }, [scriptSrc]);

    return <WrappedComponent {...props} />;
  };
};

export default withScript;
