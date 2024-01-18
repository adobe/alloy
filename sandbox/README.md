# Overview

The codebase is a React application that uses Adobe's React Spectrum for styling. It's a sandbox for showcasing and demoing the web SDK.

# Structure

The application is structured with different components for different functionalities such as:

- Home
- Consent
- Personalization
- Links
- EventMerge
- LargePayload
- OrgTwo
- DualTag
- RedirectOffers
- Identity
- ConfigOverrides
- InAppMessages

# Bootstrapping

The application is bootstrapped with Create React App and uses react-router-dom for routing. The main entry point of the application is the `index.js` file where the `App` component is rendered inside a Provider with the `defaultTheme` from React Spectrum:

```js
ReactDOM.render(
  <React.StrictMode>
    <Provider theme={defaultTheme}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

# Styling and Polyfills

The application uses the Adobe React Spectrum library for UI components and styling. The `spectrum-css` library is also used for additional Adobe Spectrum CSS styles.

The application also uses `core-js` and `regenerator-runtime` for polyfilling and async function support:

```js
import "core-js";
import "regenerator-runtime/runtime"; 
```

# Build and Test

The `package.json` file shows that the application uses `react-scripts` for building, testing, and starting the application in development mode. The `browserslist` field specifies the browsers the application should support.

# Components

The `PersonalizationAnalyticsClientSide.js`, `Personalization.js`, `PersonalizationSpa.js`,  `Home.js`, `App.js`, `PersonalizationAjo.js`, `InAppMessages.js`, `RedirectOffers.js`, and `DualTag.js` files are all React components used in the application.

They all import the `Heading` component from `@adobe/react-spectrum` for rendering headings:

```js
import { Heading } from "@adobe/react-spectrum";
```

# React Features

The `PersonalizationAnalyticsClientSide.js`, `PersonalizationAjo.js`, `InAppMessages.js`, `RedirectOffers.js`, and `DualTag.js` files all use the `useEffect` hook from React to perform side effects, such as sending events or loading scripts, after the component has rendered.

The `InAppMessages.js` file also uses the `useState` hook from React to manage state within the component.

The `App.js` file uses `react-router-dom` to set up routing for the application. It renders different components based on the current URL path.

# Functionality

The `InAppMessages.js` file defines several functions for interacting with the application, such as sending display events and deleting all cookies. It also uses the `localStorage` API to store and retrieve the current configuration environment.

The `RedirectOffers.js` file uses the `useEffect` hook to send an event when the component has rendered. It uses the global `alloy` function, presumably provided by an Adobe library, to send the event.

The `DualTag.js` file uses the `useEffect` hook to load a script when the component has rendered. It creates a new script element, sets its `src` attribute to the URL of a launch library, and appends it to the document body.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
