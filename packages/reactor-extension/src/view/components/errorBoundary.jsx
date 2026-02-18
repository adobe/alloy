/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "@adobe/react-spectrum";
import ErrorMessage from "./errorMessage";
import UserReportableError from "../errors/userReportableError";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(_, { error: prevError }) {
    const { error } = this.state;
    if (error && prevError !== error) {
      window.dispatchEvent(new Event("extension-reactor-alloy:rendered"));
    }
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    let content = "An unexpected error occurred. Please try again later.";

    if (error instanceof UserReportableError) {
      content = (
        <>
          {error.message}
          {error.additionalInfoUrl && (
            <span>
              {" "}
              Click{" "}
              <Link
                href={error.additionalInfoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>{" "}
              for more information.
            </span>
          )}
        </>
      );
    }

    if (error) {
      return (
        <ErrorMessage dataTestId="errorBoundaryMessage">{content}</ErrorMessage>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
