# Lifecycle Hooks

Components can register callbacks for a variety of lifecycle hooks. Components can also trigger lifecycle hooks.

Lifecycle hooks must be explictly declared and exposed by Core to components. This is to ensure all lifecycle hooks are well-known and easily discoverable by developers. Hopefully, it also prompts thorough conversation about cross-component impacts when lifecycle hooks are added, modified, or removed.

Depending on the hook, components may be able to return a value from a callback that has been registered with a lifecycle hook. In many cases, a component may return a promise from a callback that will prevent a particular process from continuing until the promise is resolved.

For example, if the customer attempts to send multiple events to the server before an identity has been estalished for the current user, the Identity component will return pending promises from the callback registered with the `onBeforeRequest` lifecycle hook for all but the first request.  This allows only the first request to be sent, while the remaining requests are queued. Once the response from the first request is received and an identity has been established for the user, the Identity component will resolve the promises to allow the queued requests to be sent.

See [createLifecycle.js](../src/core/createLifecycle.js) for the current list of lifecycle hooks and their descriptions. 
