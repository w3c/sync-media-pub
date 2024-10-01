// global event manager
let eventHandlers = {};

function on(eventName, handler) {
    if (!eventHandlers[eventName]) {
        eventHandlers[eventName] = [];
    }
    eventHandlers[eventName].push(handler);
}

function off(eventName, handler) {
    let handlers = eventHandlers[eventName];
    if (!handlers) return;
    for (let i = 0; i < handlers.length; i++) {
        if (handlers[i] === handler) {
            handlers.splice(i--, 1);
        }
    }
}

function trigger(eventName, ...args) {
    if (!eventHandlers[eventName]) {
        return; // no handlers for that event name
    }

    // call the handlers
    eventHandlers[eventName].forEach(handler => handler.apply(this, args));
}

export {
    on, off, trigger
};