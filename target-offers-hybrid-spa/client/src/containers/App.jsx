import React, { Component } from 'react'
import NavBar from './Navbar'
import Footer from '../components/Footer'
import Helmet from "react-helmet"
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

/**
 * Create App Component
 */
class App extends Component {
  render() {
    return (
      <div className="app-container">
        <div className="page-container">
          <Helmet titleTemplate="Target SPA - %s"/>
          <NavBar />
          {this.props.children}
        </div>
        <Footer />
      </div>
    )
  }
}

const stateProps = (state) => {
  return {
    loading: state.LoadingReducer.isVisible
  }
};

export default withRouter(connect(stateProps)(App))
