import React from "react";
import { Switch, Route } from "react-router-dom";

import appStyles from "../../app.module.scss";

import Changelog from "../Changelog/Changelog";
import Home from "../Home/Home";
import Resource from "../Resource/Resource";

const Main = () => {
  return (
    <div className={appStyles.main}>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route path="/authentication">
          <Changelog />
        </Route>

        <Route path="/resource">
          <Resource />
        </Route>

        <Route path="/collection">
          <Changelog />
        </Route>

        <Route path="/changelog">
          <Changelog />
        </Route>
      </Switch>
    </div>
  );
};

export default Main;
