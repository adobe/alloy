import React from "react";
import { Table, Td, Tr, TBody } from "../Table";
import { Button } from "../Button";

const isBrowser = typeof window !== "undefined";

const getQueryStringParameter = key => {
  var searchParams = new URLSearchParams(
    typeof window !== "undefined" && window.location.search
  );
  return searchParams.get(key);
};

const urlWithUpdatedQueryStringParameter = (key, value, defaultValue) => {
  var searchParams = new URLSearchParams(
    typeof window !== "undefined" && window.location.search
  );
  if (value !== defaultValue) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
  if (isBrowser) {
    return window.location.pathname + "?" + searchParams;
  }
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
          <Button>{label}</Button> &nbsp;
        </span>
      );
    } else {
      return (
        <a
          key={index}
          href={urlWithUpdatedQueryStringParameter(param, value, defaultValue)}
        >
          <Button>{label}</Button> &nbsp;
        </a>
      );
    }
  });
};

export default () => {
  return (
    <Table className="configuration">
      <TBody>
        <Tr>
          <Td>defaultConsent</Td>
          <Td>{defaultConsent}</Td>
          <Td>
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
          </Td>
        </Tr>
        <Tr>
          <Td>idMigrationEnabled</Td>
          <Td>{idMigrationEnabled.toString()}</Td>
          <Td>
            <ConfigurationLinks
              param="idMigrationEnabled"
              currentValue={idMigrationEnabled}
              defaultValue="true"
              options={[
                { value: true, label: "Enable" },
                { value: false, label: "Disable" }
              ]}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>Include Visitor.js</Td>
          <Td>{includeVisitor.toString()}</Td>
          <Td>
            <ConfigurationLinks
              param="includeVisitor"
              currentValue={includeVisitor}
              defaultValue="false"
              options={[
                { value: true, label: "Include" },
                { value: false, label: "Remove" }
              ]}
            />
          </Td>
        </Tr>
        <Tr>
          <Td>Enable Opt-in in Visitor</Td>
          <Td>{legacyOptIn.toString()}</Td>
          <Td>
            <ConfigurationLinks
              param="legacyOptIn"
              currentValue={legacyOptIn}
              defaultValue="false"
              options={[
                { value: true, label: "Enable" },
                { value: false, label: "Disable" }
              ]}
            />
          </Td>
        </Tr>
      </TBody>
    </Table>
  );
};
