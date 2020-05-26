# API Design

Customers begin by deploying a snippet of code (referred to as "base code") within the `<head>` tag of their website. As part of the base code, customers also provide the name of the Alloy "instance" (or instances) they are trying to create. Alloy then creates a global variable by this name. This global variable is a function, which we'll refer to as the "instance function". It is the only mechanism by which a customer can interact with Alloy.

## Command Execution

The instance function always accepts two arguments:

1. The command name as a string.
1. The options object which dictates how the command operates, what data gets sent to the server, etc. For some commands, the options object is optional.

Here's an example of how a command would be executed:

```js
alloy("setDebug", { enabled: true });
```

Even if a command only has one piece of input, the input should always be provided as an attribute on the options object rather than be the options object itself. For example, a `syncIdentity` command may take an identity object as follows:

```js
// Good: the identity is passed as an identity option
alloy("syncIdentity", {
  "identity": {
    "AppNexus": {
      "id": "123456"
    },
    "Email": {
      "id": "example@adobe.com"
    }
  }
})
```

Notice that even though the identity object is the primary subject of the command, the customer provides the identity as an `identity` option rather than providing the identity object as the options object itself. To illustrate, this would be considered an improper API:

```js
// Bad: the identity is passed as the options object
alloy("syncIdentity", {
  "AppNexus": {
    "id": "123456"
  },
  "Email": {
    "id": "example@adobe.com"
  }
})
```

Although the proper API may seem verbose at times, it provides consistency across commands and allows options to be added later while still being backward-compatible.

## Command Return Value

Every command returns a promise.

### Successful Execution

If the command executes successfully, the promise is resolved with a result object. The content of the object depends on the command that was executed and, at times, the user's consent preferences. Note that if the user's consent is restrictive, the promise is still resolved, though possibly with sparse data, rather than the promise being rejected entirely. In other words, not being able to perform all tasks or provide all data due to limited user consent is not considered a failure. This is a very difficult but intentional design decision.

Even if a command only has one piece of output, the output should always be provided as an attribute on the result object rather than the output being the result object itself. For example, the `createEventMergeId` command produces an event merge ID as follows:

```js
// Good: the event merge ID is provided as an attribute on result
alloy("createEventMergeId", result => {
  console.log(result.eventMergeId);
})
```

Notice that even though the event merge ID is the primary output of the command, Alloy provides the event merge ID as an `eventMergeId` attribute on the result rather than providing it as the result itself. To illustrate, this would be considered improper API:

```js
// Bad: the event merge ID is the result
alloy("createEventMergeId", eventMergeId => {
  console.log(eventMergeId);
})
```

Although the proper API may seem verbose at times, it provides consistency across commands and allows additional result data to be added later while still being backward-compatible.

### Unsuccessful Execution

If the command does not execute successfully, the promise is rejected with an `Error` instance.

