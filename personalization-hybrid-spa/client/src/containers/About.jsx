import React, { Component } from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";

/**
 * Create About Container
 */
class About extends Component {
  render() {
    return (
      <div>
        <Helmet title="About" />
        <section className="section">
          <div className="container">
            <div className="heading">
              <h1 className="title">About demo</h1>
            </div>
            <p>
              Single page applications (SPAs) implemented on popular frameworks
              like React and Angular and custom implementation frameworks are
              the new norm for the websites of today's "modern web". We've been
              developing for SPAs and the modern web for a while now. Now, we
              are taking this ground-breaking research and applying it to the
              entirely new Visual Experience Composer for SPAs, giving marketers
              the agility and control they need to build rich, personalized
              experiences at scale, no matter what framework or architecture
              they use. Developers can do a one-time setup by including a single
              line of javascript code to enable their SPA websites for VEC. This
              first-of-a-kind product innovation enables non-technical marketers
              to experiment and personalize on popular SPA frameworks.
            </p>
            <br />

            <p>
              This website is built using React-Redux, one of the most popular
              frameworks these days. In this demo, we will see how we can create
              tests and personalize content on SPAs in a do-it-yourself fashion
              without continuous development dependencies.
            </p>
            <br />

            <p>
              To understand the methodology used in this site, please visit our{" "}
              <a
                href="https://docs.adobe.com/help/en/target/using/experiences/spa-visual-experience-composer.html"
                target="_blank"
              >
                Documentation page
              </a>{" "}
              here.
            </p>
          </div>
        </section>
        <div className="container sub-text">
          <p>
            ReactJS and Redux are not Adobe proprietary technologies.<br></br>
            Transactions on this site are not real. <br></br>
            Forked from{" "}
            <a href="https://github.com/david-babunashvili/React-Redux-Ecommerce">
              GitHub
            </a>
            <br></br>
          </p>
        </div>
      </div>
    );
  }
}
/**
 * Insert Props Into Component
 */
const stateProps = (state) => {
  return {
    about: state.AboutReducer.data,
  };
};

export default connect(stateProps)(About);
