module.exports = function makeEmitter(target) {
    var events = {};

    target.on = function (eventName, callback, context) {
        if (!callback || typeof callback !== "function") {
            throw new Error("[ON] Callback should be a function.");
        }
      
        if (!events.hasOwnProperty(eventName)) {
            events[eventName] = [];
        }

        var subscriptionIndex = events[eventName].push({
            callback: callback,
            context: context
        }) - 1;

        return function() {
            events[eventName].splice(subscriptionIndex, 1);

            if (!events[eventName].length) {
                delete events[eventName];
            }
        };
    };

    target.publish = function (eventName) {
        if (!events.hasOwnProperty(eventName)) {
            return;
        }
        var data = [].slice.call(arguments, 1);
        
        // Note: We clone the callbacks array because a callback might unsubscribe,
        // which will change the length of the array and break this for loop.
        events[eventName].slice(0).forEach(function (eventMetadata) {
            eventMetadata.callback.apply(eventMetadata.context, data);
        });
    };

    return target.publish;
};
