/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import React, { Component } from "react";
import Helmet from "react-helmet";
import { generate } from "randomstring";

class Confirm extends Component {
  render() {
    return (
      <div>
        <Helmet title="Order Confirmation" />
        <section className="section">
          <div className="container">
            <div className="heading">
              <h1 className="title">Order Confirmation</h1>
            </div>
            <p>Thank you for your order.</p>

            <h2>
              <span className="badge badge-success">
                Order Number: {generate(10)}
              </span>
            </h2>
          </div>
        </section>
      </div>
    );
  }
}

export default Confirm;
