import React from "react";

const getQueryStringParameter = key => {
  var searchParams = new URLSearchParams(window.location.search);
  console.log(key, searchParams.get(key));
  return searchParams.get(key);
};

const urlWithUpdatedQueryStringParameter = (key, value, defaultValue) => {
  var searchParams = new URLSearchParams(window.location.search);
  if (value !== defaultValue) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
  return window.location.pathname + "?" + searchParams;
};

const defaultConsent = getQueryStringParameter("defaultConsent") || "in";
const idMigrationEnabled =
  getQueryStringParameter("idMigrationEnabled") !== "false";
const includeVisitor = getQueryStringParameter("includeVisitor") === "true";
const legacyOptIn = getQueryStringParameter("legacyOptIn") === "true";

const ConfigurationLinks = ({ param, currentValue, defaultValue, options }) => {
  return options.map(({ value, label }, index) => {
    if (value === currentValue) {
      return (
        <span key={index} className="disabled">
          {label}
        </span>
      );
    } else {
      return (
        <a
          key={index}
          href={urlWithUpdatedQueryStringParameter(param, value, defaultValue)}
        >
          {label}
        </a>
      );
    }
  });
};

export default () => {
  return (
    <table className="configuration">
      <tbody>
        <tr>
          <td>defaultConsent</td>
          <td>{defaultConsent}</td>
          <td>
            <ConfigurationLinks
              param="defaultConsent"
              currentValue={defaultConsent}
              defaultValue="in"
              options={[
                { value: "pending", label: "Set to pending" },
                { value: "in", label: "Set to in" },
                { value: "out", label: "Set to out" }
              ]}
            />
          </td>
        </tr>
        <tr>
          <td>idMigrationEnabled</td>
          <td>{idMigrationEnabled.toString()}</td>
          <td>
            <ConfigurationLinks
              param="idMigrationEnabled"
              currentValue={idMigrationEnabled}
              defaultValue="true"
              options={[
                { value: true, label: "Enable" },
                { value: false, label: "Disable" }
              ]}
            />
          </td>
        </tr>
        <tr>
          <td>Include Visitor.js</td>
          <td>{includeVisitor.toString()}</td>
          <td>
            <ConfigurationLinks
              param="includeVisitor"
              currentValue={includeVisitor}
              defaultValue="false"
              options={[
                { value: true, label: "Include" },
                { value: false, label: "Remove" }
              ]}
            />
          </td>
        </tr>
        <tr>
          <td>Enable Opt-in in Visitor</td>
          <td>{legacyOptIn.toString()}</td>
          <td>
            <ConfigurationLinks
              param="legacyOptIn"
              currentValue={legacyOptIn}
              defaultValue="false"
              options={[
                { value: true, label: "Enable" },
                { value: false, label: "Disable" }
              ]}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};
