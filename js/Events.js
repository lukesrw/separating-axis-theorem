function Events() {}

/**
 * Start listening for events emitted
 *
 * @param { string } event to listen for
 * @param { function } callback to run on event
 * @returns { this } current object
 */
Events.prototype.addEventListener = function (event, callback) {
    if (typeof this.events === "object" && event in this.events) {
        this.events[event].push(callback);
    } else {
        throw new Error('Invalid Event: "' + event + '"');
    }

    return this;
};

/**
 * Stop listening for events emitted
 *
 * @param { string } event to stop listening for
 * @param { function } callback to stop running on event
 * @returns { this } current object
 */
Events.prototype.removeEventListener = function (event, callback) {
    if (typeof this.events === "object" && event in this.events) {
        this.events[event] = this.events[event].filter(function (listener) {
            return callback !== listener;
        });
    } else {
        throw new Error('Invalid Event: "' + event + '"');
    }

    return this;
};

/**
 * Emit event to listeners
 *
 * @param { string } event to emit
 * @param { object } [detail] to attach to event
 * @returns { this } current object
 */
Events.prototype.emit = function (event, detail) {
    if (typeof this.events === "object" && event in this.events) {
        this.events[event].forEach(function (listener) {
            listener(
                new CustomEvent(event, {
                    detail: detail || {}
                }),
                this
            );
        }, this);
    } else {
        throw new Error('Invalid Event: "' + event + '"');
    }

    return this;
};
