import React from "react";
import { Switch, Route } from "react-router-dom";

import appStyles from "../../app.module.scss";

import Home from "../Home/Home";
import AlloyConfiguration from "../Configuration/Config";

const Main = () => {
  return (
    <div className={appStyles.main}>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route path="/configuration">
          <AlloyConfiguration />
        </Route>
      </Switch>
    </div>
  );
};

export default Main;
