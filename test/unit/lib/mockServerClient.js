/* eslint-disable */
/*
 * mockserver
 * http://mock-server.com
 *
 * Copyright (c) 2014 James Bloom
 * Licensed under the Apache License, Version 2.0
 */
var mockServerClient;

(function () {
    "use strict";

    var makeRequest = (typeof require !== 'undefined' ? require('./sendRequest').sendRequest : function (host, port, path, jsonBody, resolveCallback) {
        var body = (typeof jsonBody === "string" ? jsonBody : JSON.stringify(jsonBody || ""));
        var url = 'http://' + host + ':' + port + path;

        return {
            then: function (sucess, error) {
                try {
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.addEventListener("load", (function (sucess, error) {
                        return function () {
                            if (error && this.status >= 400 && this.status < 600) {
                                if (this.statusCode === 404) {
                                    error("404 Not Found");
                                } else {
                                    error(this.responseText);
                                }
                            } else {
                                sucess && sucess({
                                    statusCode: this.status,
                                    body: this.responseText
                                });
                            }
                        };
                    })(sucess, error));
                    xmlhttp.open('PUT', url);
                    xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    xmlhttp.send(body);
                } catch (e) {
                    error && error(e);
                }
            }
        };
    });

    /**
     * Start the client communicating at the specified host and port
     * for example:
     *
     *   var client = mockServerClient("localhost", 1080);
     *
     * @param host the host for the server to communicate with
     * @param port the port for the server to communicate with
     * @param contextPath the context path if server was deployed as a war
     */
    mockServerClient = function (host, port, contextPath) {

        var cleanedContextPath = (function (contextPath) {
            if (contextPath) {
                if (!contextPath.endsWith("/")) {
                    contextPath += "/";
                }
                if (!contextPath.startsWith("/")) {
                    contextPath = "/" + contextPath;
                }
                return contextPath;
            } else {
                return '';
            }
        })(contextPath);

        /**
         * The default headers added to to the mocked response when using mockSimpleResponse(...)
         */
        var defaultResponseHeaders = [
            {"name": "Content-Type", "values": ["application/json; charset=utf-8"]},
            {"name": "Cache-Control", "values": ["no-cache, no-store"]}
        ];
        var defaultRequestHeaders = [];

        var arrayUniqueConcatenate = function (arrayTarget, arraySource) {
            if (arraySource && arraySource.length) {
                if (arrayTarget && arrayTarget.length) {
                    for (var i = 0; i < arraySource.length; i++) {
                        var arrayTargetAlreadyHasValue = false;
                        for (var j = 0; j < arrayTarget.length; j++) {
                            if (JSON.stringify(arraySource[i]) === JSON.stringify(arrayTarget[j])) {
                                arrayTargetAlreadyHasValue = true;
                            }
                        }
                        if (!arrayTargetAlreadyHasValue) {
                            arrayTarget.push(arraySource[i]);
                        }
                    }
                } else {
                    arrayTarget = arraySource;
                }
            }
            return arrayTarget;
        };
        var createRequestMatcher = function (path) {
            return {
                method: "",
                path: path,
                body: "",
                headers: defaultRequestHeaders,
                cookies: [],
                queryStringParameters: []
            };

        };
        var createExpectation = function (path, responseBody, statusCode) {
            return {
                httpRequest: createRequestMatcher(path),
                httpResponse: {
                    statusCode: statusCode || 200,
                    body: JSON.stringify(responseBody),
                    cookies: [],
                    headers: defaultResponseHeaders,
                    delay: {
                        timeUnit: "MICROSECONDS",
                        value: 0
                    }
                },
                times: {
                    remainingTimes: 1,
                    unlimited: false
                }
            };
        };
        var createExpectationWithCallback = function (requestMatcher, clientId, times) {
            var timesObject;
            if (typeof times === 'number') {
                timesObject = {
                    remainingTimes: times,
                    unlimited: false
                };
            } else if (typeof times === 'object') {
                timesObject = times;
            }
            requestMatcher.headers = arrayUniqueConcatenate(requestMatcher.headers, defaultRequestHeaders);
            return {
                httpRequest: requestMatcher,
                httpResponseObjectCallback: {
                    clientId: clientId
                },
                times: timesObject || {
                    remainingTimes: 1,
                    unlimited: false
                }
            };
        };

        var WebSocketClient = (typeof require !== 'undefined' ? require('./webSocketClient').webSocketClient : function (host, port, contextPath) {
            var clientId;
            var clientIdHandler;
            var requestHandler;
            var browserWebSocket;

            if (typeof(window) !== "undefined") {
                if (window.WebSocket) {
                    browserWebSocket = window.WebSocket;
                } else if (window.MozWebSocket) {
                    browserWebSocket = window.MozWebSocket;
                } else {
                    throw "Your browser does not support web sockets.";
                }
            }

            if (browserWebSocket) {
                var webSocketLocation = "ws://" + host + ":" + port + contextPath + "/_mockserver_callback_websocket";
                var socket = new WebSocket(webSocketLocation);
                socket.onmessage = function (event) {
                    var message = JSON.parse(event.data);
                    if (message.type === "org.mockserver.model.HttpRequest") {
                        var request = JSON.parse(message.value);
                        var response = requestHandler(request);
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify(response));
                        } else {
                            throw "The socket is not open.";
                        }
                    } else if (message.type === "org.mockserver.client.serialization.model.WebSocketClientIdDTO") {
                        var registration = JSON.parse(message.value);
                        if (registration.clientId) {
                            clientId = registration.clientId;
                            if (clientIdHandler) {
                                clientIdHandler(clientId);
                            }
                        }
                    }
                };
                socket.onopen = function (event) {
                    console.log("foo");
                };
                socket.onclose = function (event) {
                    console.log("foo");
                };
            }

            function requestCallback(callback) {
                requestHandler = callback;
            }

            function clientIdCallback(callback) {
                clientIdHandler = callback;
                if (clientId) {
                    clientIdHandler(clientId);
                }
            }

            return {
                requestCallback: requestCallback,
                clientIdCallback: clientIdCallback
            };
        });

        /**
         * Setup an expectation by specifying an expectation object
         * for example:
         *
         *   client.mockAnyResponse(
         *       {
         *           'httpRequest': {
         *               'path': '/somePath',
         *               'body': {
         *                   'type': "STRING",
         *                   'value': 'someBody'
         *               }
         *           },
         *           'httpResponse': {
         *               'statusCode': 200,
         *               'body': Base64.encode(JSON.stringify({ name: 'first_body' })),
         *               'delay': {
         *                   'timeUnit': 'MILLISECONDS',
         *                   'value': 250
         *               }
         *           },
         *           'times': {
         *               'remainingTimes': 1,
         *               'unlimited': false
         *           }
         *       }
         *   );
         *
         * @param expectation the expectation to setup on the MockServer
         */
        var mockAnyResponse = function (expectation) {
            return makeRequest(host, port, "/expectation", addDefaultExpectationHeaders(expectation));
        };
        /**
         * Setup an expectation by specifying a request matcher, and
         * a local request handler function.  The request handler function receives each
         * request (that matches the request matcher) and returns the response that will be returned for this expectation.
         *
         * for example:
         *
         *    client.mockWithCallback(
         *            {
         *                path: '/somePath',
         *                body: 'some_request_body'
         *            },
         *            function (request) {
         *                var response = {
         *                    statusCode: 200,
         *                    body: 'some_response_body'
         *                };
         *                return response
         *            }
         *    ).then(
         *            function () {
         *                alert('expectation sent');
         *            },
         *            function (error) {
         *                alert('error');
         *            }
         *    );
         *
         * @param requestMatcher the request matcher for the expectation
         * @param requestHandler the function to be called back when the request is matched
         * @param times the number of times the requestMatcher should be matched
         */
        var mockWithCallback = function (requestMatcher, requestHandler, times) {
            return {
                then: function (sucess, error) {
                    try {
                        var webSocketClient = WebSocketClient(host, port, cleanedContextPath);
                        webSocketClient.requestCallback(function (request) {
                            var response = requestHandler(request);
                            response.headers = arrayUniqueConcatenate(response.headers, [
                                {"name": "WebSocketCorrelationId", "values": request.headers["WebSocketCorrelationId"] || request.headers["websocketcorrelationid"]}
                            ]);
                            return {
                                type: "org.mockserver.model.HttpResponse",
                                value: JSON.stringify(response)
                            };
                        });
                        webSocketClient.clientIdCallback(function (clientId) {
                            return makeRequest(host, port, "/expectation", createExpectationWithCallback(requestMatcher, clientId, times)).then(sucess, error)
                        });
                    } catch (e) {
                        error && error(e);
                    }
                }
            };
        };
        /**
         * Setup an expectation without having to specify the full expectation object
         * for example:
         *
         *   client.mockSimpleResponse('/somePath', { name: 'value' }, 203);
         *
         * @param path the path to match requests against
         * @param responseBody the response body to return if a request matches
         * @param statusCode the response code to return if a request matches
         */
        var mockSimpleResponse = function (path, responseBody, statusCode) {
            return mockAnyResponse(createExpectation(path, responseBody, statusCode));
        };
        /**
         * Override:
         *
         * - default headers that are used to specify the response headers in mockSimpleResponse(...)
         *   (note: if you use mockAnyResponse(...) the default headers are not used)
         *
         * - headers added to every request matcher, this is particularly useful for running tests in parallel
         *
         * for example:
         *
         *   client.setDefaultHeaders([
         *       {"name": "Content-Type", "values": ["application/json; charset=utf-8"]},
         *       {"name": "Cache-Control", "values": ["no-cache, no-store"]}
         *   ],[
         *       {"name": "sessionId", "values": ["786fcf9b-606e-605f-181d-c245b55e5eac"]}
         *   ])
         *
         * @param responseHeaders the default headers to be added to every response
         * @param requestHeaders the default headers to be added to every request matcher
         */
        var setDefaultHeaders = function (responseHeaders, requestHeaders) {
            if (responseHeaders) {
                defaultResponseHeaders = responseHeaders;
            }
            if (requestHeaders) {
                defaultRequestHeaders = requestHeaders;
            }
            return _this;
        };

        var addDefaultRequestMatcherHeaders = function (pathOrRequestMatcher) {
            var requestMatcher;
            if (typeof pathOrRequestMatcher === "string") {
                requestMatcher = {
                    path: pathOrRequestMatcher
                };
            } else if (typeof pathOrRequestMatcher === "object") {
                requestMatcher = pathOrRequestMatcher;
            } else {
                requestMatcher = {};
            }
            if (defaultRequestHeaders.length) {
                if (requestMatcher.httpRequest) {
                    requestMatcher.httpRequest.headers = arrayUniqueConcatenate(requestMatcher.httpRequest.headers, defaultRequestHeaders);
                } else {
                    requestMatcher.headers = arrayUniqueConcatenate(requestMatcher.headers, defaultRequestHeaders);
                }
            }
            return requestMatcher;
        };
        var addDefaultResponseMatcherHeaders = function (response) {
            var responseMatcher;
            if (typeof response === "object") {
                responseMatcher = response;
            } else {
                responseMatcher = {};
            }
            if (defaultResponseHeaders.length) {
                if (responseMatcher.httpResponse) {
                    responseMatcher.httpResponse.headers = arrayUniqueConcatenate(responseMatcher.httpResponse.headers, defaultResponseHeaders);
                } else {
                    responseMatcher.headers = arrayUniqueConcatenate(responseMatcher.headers, defaultResponseHeaders);
                }
            }
            return responseMatcher;
        };
        var addDefaultExpectationHeaders = function (expectation) {
            if (Array.isArray(expectation)) {
                for (var i = 0; i < expectation.length; i++) {
                    expectation[i].httpRequest = addDefaultRequestMatcherHeaders(expectation[i].httpRequest);
                    if(!expectation[i].httpResponseTemplate && !expectation[i].httpResponseClassCallback && !expectation[i].httpResponseObjectCallback && !expectation[i].httpForward && !expectation[i].httpForwardTemplate && !expectation[i].httpForwardClassCallback && !expectation[i].httpForwardObjectCallback && !expectation[i].httpOverrideForwardedRequest && !expectation[i].httpError) {
                        expectation[i].httpResponse = addDefaultResponseMatcherHeaders(expectation[i].httpResponse);
                    }
                }
            } else {
                expectation.httpRequest = addDefaultRequestMatcherHeaders(expectation.httpRequest);
                if(!expectation.httpResponseTemplate && !expectation.httpResponseClassCallback && !expectation.httpResponseObjectCallback && !expectation.httpForward && !expectation.httpForwardTemplate && !expectation.httpForwardClassCallback && !expectation.httpForwardObjectCallback && !expectation.httpOverrideForwardedRequest && !expectation.httpError) {
                    expectation.httpResponse = addDefaultResponseMatcherHeaders(expectation.httpResponse);
                }
            }
            return expectation;
        };
        /**
         * Verify a request has been sent for example:
         *
         *   expect(client.verify({
         *       'httpRequest': {
         *           'method': 'POST',
         *           'path': '/somePath'
         *       }
         *   })).toBeTruthy();
         *
         * @param request the http request that must be matched for this verification to pass
         * @param atLeast the minimum number of times this request must be matched
         * @param atMost  the maximum number of times this request must be matched
         */
        var verify = function (request, atLeast, atMost) {
            if (atLeast === undefined && atMost === undefined) {
                atLeast = 1;
            }
            return {
                then: function (sucess, error) {
                    request.headers = arrayUniqueConcatenate(request.headers, defaultRequestHeaders);
                    return makeRequest(host, port, "/verify", {
                        "httpRequest": request,
                        "times": {
                            "atLeast": atLeast,
                            "atMost": atMost
                        }
                    }).then(
                        function () {
                            sucess && sucess();
                        },
                        function (result) {
                            if (!result.statusCode || result.statusCode !== 202) {
                                error && error(result);
                            } else {
                                error && sucess(result);
                            }
                        }
                    );
                }
            };
        };
        /**
         * Verify a sequence of requests has been sent for example:
         *
         *   client.verifySequence(
         *       {
         *          'method': 'POST',
         *          'path': '/first_request'
         *       },
         *       {
         *          'method': 'POST',
         *          'path': '/second_request'
         *       },
         *       {
         *          'method': 'POST',
         *          'path': '/third_request'
         *       }
         *   );
         *
         * @param arguments the list of http requests that must be matched for this verification to pass
         */
        var verifySequence = function () {
            var requestSequence = [];
            for (var i = 0; i < arguments.length; i++) {
                var requestMatcher = arguments[i];
                requestMatcher.headers = arrayUniqueConcatenate(requestMatcher.headers, defaultRequestHeaders);
                requestSequence.push(requestMatcher);
            }
            return {
                then: function (sucess, error) {
                    return makeRequest(host, port, "/verifySequence", {
                        "httpRequests": requestSequence
                    }).then(
                        function () {
                            sucess && sucess();
                        },
                        function (result) {
                            if (!result.statusCode || result.statusCode !== 202) {
                                error && error(result);
                            } else {
                                error && sucess(result);
                            }
                        }
                    );
                }
            };
        };
        /**
         * Reset by clearing all recorded requests
         */
        var reset = function () {
            return makeRequest(host, port, "/reset");
        };
        /**
         * Clear all recorded requests, expectations and logs that match the specified path
         *
         * @param pathOrRequestMatcher  if a string is passed in the value will be treated as the path to
         *                              decide what to clear, however if an object is passed
         *                              in the value will be treated as a full request matcher object
         * @param type                  the type to clear 'EXPECTATIONS', 'LOG' or 'ALL', defaults to 'ALL' if not specified
         */
        var clear = function (pathOrRequestMatcher, type) {
            if (type) {
                var typeEnum = ['EXPECTATIONS', 'LOG', 'ALL'];
                if (typeEnum.indexOf(type) === -1) {
                    throw new Error("\"" + (type || "undefined") + "\" is not a supported value for \"type\" parameter only " + typeEnum + " are allowed values");
                }
            }
            return makeRequest(host, port, "/clear" + (type ? "?type=" + type : ""), addDefaultRequestMatcherHeaders(pathOrRequestMatcher));
        };
        /**
         * Add new ports the server is bound to and listening on
         *
         * @param ports array of ports to bind to, use 0 to bind to any free port
         */
        var bind = function (ports) {
            if (!Array.isArray(ports)) {
                throw new Error("ports parameter must be an array but found: " + JSON.stringify(ports));
            }
            return makeRequest(host, port, "/bind", {ports: ports});
        };
        /**
         * Retrieve the recorded requests that match the parameter, as follows:
         * - use a string value to match on path,
         * - use a request matcher object to match on a full request,
         * - or use null to retrieve all requests
         *
         * @param pathOrRequestMatcher  if a string is passed in the value will be treated as the path, however
         *                              if an object is passed in the value will be treated as a full request
         *                              matcher object, if null is passed in it will be treated as match all
         */
        var retrieveRecordedRequests = function (pathOrRequestMatcher) {
            return {
                then: function (sucess, error) {
                    makeRequest(host, port, "/retrieve?type=REQUESTS&format=JSON", addDefaultRequestMatcherHeaders(pathOrRequestMatcher))
                        .then(function (result) {
                            sucess(result.body && JSON.parse(result.body));
                        });
                }
            };
        };
        /**
         * Retrieve the active expectations that match the parameter,
         * the expectations are retrieved by matching the parameter
         * on the expectations own request matcher, as follows:
         * - use a string value to match on path,
         * - use a request matcher object to match on a full request,
         * - or use null to retrieve all requests
         *
         * @param pathOrRequestMatcher  if a string is passed in the value will be treated as the path, however
         *                              if an object is passed in the value will be treated as a full request
         *                              matcher object, if null is passed in it will be treated as match all
         */
        var retrieveActiveExpectations = function (pathOrRequestMatcher) {
            return {
                then: function (sucess, error) {
                    return makeRequest(host, port, "/retrieve?type=ACTIVE_EXPECTATIONS&format=JSON", addDefaultRequestMatcherHeaders(pathOrRequestMatcher))
                        .then(function (result) {
                            sucess(result.body && JSON.parse(result.body));
                        });
                }
            };
        };
        /**
         * Retrieve the request-response pairs as expectations that match the
         * parameter, expectations are retrieved by matching the parameter
         * on the expectations own request matcher, as follows:
         * - use a string value to match on path,
         * - use a request matcher object to match on a full request,
         * - or use null to retrieve all requests
         *
         * @param pathOrRequestMatcher  if a string is passed in the value will be treated as the path, however
         *                              if an object is passed in the value will be treated as a full request
         *                              matcher object, if null is passed in it will be treated as match all
         */
        var retrieveRecordedExpectations = function (pathOrRequestMatcher) {
            return {
                then: function (sucess, error) {
                    return makeRequest(host, port, "/retrieve?type=RECORDED_EXPECTATIONS&format=JSON", addDefaultRequestMatcherHeaders(pathOrRequestMatcher))
                        .then(function (result) {
                            sucess(result.body && JSON.parse(result.body));
                        });
                }
            };
        };
        /**
         * Retrieve logs messages for expectation matching, verification, clearing, etc,
         * log messages are filtered by request matcher as follows:
         * - use a string value to match on path,
         * - use a request matcher object to match on a full request,
         * - or use null to retrieve all requests
         *
         * @param pathOrRequestMatcher  if a string is passed in the value will be treated as the path, however
         *                              if an object is passed in the value will be treated as a full request
         *                              matcher object, if null is passed in it will be treated as match all
         */
        var retrieveLogMessages = function (pathOrRequestMatcher) {
            return {
                then: function (sucess, error) {
                    return makeRequest(host, port, "/retrieve?type=LOGS", addDefaultRequestMatcherHeaders(pathOrRequestMatcher))
                        .then(function (result) {
                            sucess(result.body && result.body.split("------------------------------------"));
                        });
                }
            };
        };

        var _this = {
            mockAnyResponse: mockAnyResponse,
            mockWithCallback: mockWithCallback,
            mockSimpleResponse: mockSimpleResponse,
            setDefaultHeaders: setDefaultHeaders,
            verify: verify,
            verifySequence: verifySequence,
            reset: reset,
            clear: clear,
            bind: bind,
            retrieveRecordedRequests: retrieveRecordedRequests,
            retrieveActiveExpectations: retrieveActiveExpectations,
            retrieveRecordedExpectations: retrieveRecordedExpectations,
            retrieveLogMessages: retrieveLogMessages
        };
        return _this;
    };

    if (typeof module !== 'undefined') {
        module.exports = {
            mockServerClient: mockServerClient
        };
    }
})();