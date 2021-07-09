"use strict";

/**
 * @param { number } [x] coordinate
 * @param { number } [y] coordinate
 * @param { number } [z] coordinate
 */
function Vector(x, y, z) {
    var that = this;

    /**
     * Calculate dot product of Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector
     * @returns { number } dot product
     */
    that.dot = function (vector) {
        var { x, y, z } = that.clone().multiply(vector);

        return x + y + z;
    };

    /**
     * Calculate magnitude of Vector
     *
     * @returns { number }
     */
    that.getMagnitude = function () {
        return Math.sqrt(Math.pow(that.x, 2) + Math.pow(that.y, 2));
    };

    /**
     * Multiply this Vector by another Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to multiply by
     * @returns { this } current Vector object
     */
    that.multiply = function (vector) {
        if (vector) {
            that.x *= vector.x || 1;
            that.y *= vector.y || 1;
            that.z *= vector.z || 1;
        }

        return that;
    };

    /**
     * Normalize the current Vector
     *
     * @returns { Vector } current Vector object
     */
    that.normalize = function () {
        var magnitude = that.getMagnitude();

        if (magnitude === 0) return that;

        return that.multiply({
            x: 1 / magnitude,
            y: 1 / magnitude
        });
    };

    /**
     * Calculate distance to another vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to measure
     * @returns { number } distance between vectors
     */
    that.distanceTo = function (vector) {
        return Math.sqrt(
            Math.pow(Math.abs(that.x - vector.x), 2) +
                Math.pow(Math.abs(that.y - vector.y), 2)
        );
    };

    /**
     * Create a clone of this Vector
     *
     * @returns { Vector } new cloned Vector
     */
    that.clone = function () {
        return new Vector(that.x, that.y, that.z);
    };

    /**
     * Increase this Vector by another Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to add
     * @returns { this } current Vector object
     */
    that.add = function (vector) {
        if (vector) {
            that.x += vector.x || 0;
            that.y += vector.y || 0;
            that.z += vector.z || 0;
        }

        return that;
    };

    /**
     * Decrease this Vector by another Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to subtract
     * @returns { this } current Vector object
     */
    that.subtract = function (vector) {
        if (vector) {
            that.x -= vector.x || 0;
            that.y -= vector.y || 0;
            that.z -= vector.z || 0;
        }

        return that;
    };

    /**
     * Start listening for events emitted by the Vector
     *
     * @param { string } event to listen for
     * @param { function } callback to run on event
     * @returns { this } current Vector object
     */
    that.addEventListener = function (event, callback) {
        if (typeof Events === "function") {
            return Events.prototype.addEventListener.call(
                that,
                event,
                callback
            );
        }

        return that;
    };

    /**
     * Stop listening for events emitted by the Vector
     *
     * @param { string } event to stop listening for
     * @param { function } callback to stop running on event
     * @returns { this } current Vector object
     */
    that.removeEventListener = function (event, callback) {
        if (typeof Events === "function") {
            return Events.prototype.removeEventListener.call(
                that,
                event,
                callback
            );
        }

        return that;
    };

    Object.defineProperties(that, {
        x: {
            get: function () {
                return that._x;
            },
            set: function (x) {
                x = x ? parseFloat(x) : 0;

                var difference = x - that._x;

                that._x = x;

                if (difference && typeof Events === "function") {
                    Events.prototype.emit.call(that, "x", {
                        difference: difference
                    });
                }
            }
        },
        y: {
            get: function () {
                return that._y;
            },
            set: function (y) {
                y = y ? parseFloat(y) : 0;

                var difference = y - that._y;

                that._y = y;

                if (difference && typeof Events === "function") {
                    Events.prototype.emit.call(that, "y", {
                        difference: difference
                    });
                }
            }
        },
        z: {
            get: function () {
                return that._z;
            },
            set: function (z) {
                z = z ? parseFloat(z) : 0;

                var difference = z - that._z;

                that._z = z;

                if (difference && typeof Events === "function") {
                    Events.prototype.emit.call(that, "z", {
                        difference: difference
                    });
                }
            }
        }
    });

    that.events = {
        x: [],
        y: [],
        z: []
    };
    that.x = x;
    that.y = y;
    that.z = z;
}

/**
 * Create Vector from perpendicular of two other vectors
 *
 * @param { { x?: number, y?: number, z?: number } | Vector } vector1 line start
 * @param { { x?: number, y?: number, z?: number } | Vector } vector2 line end
 * @returns { Vector } new perpendicular vector
 */
Vector.fromPerpendicular = function (vector1, vector2) {
    return new Vector(
        -(vector2.y - vector1.y),
        vector2.x - vector1.x
    ).normalize();
};

/**
 * Create Vector from a given point to a set of vertices
 *
 * @param { { x?: number, y?: number, z?: number } | Vector } point to measure
 * @param { Vector[] } vertices to loop through
 * @returns { Vector } new closest vector
 */
Vector.fromClosest = function (point, vertices) {
    var closest = {
        vertex: null,
        distance: Infinity
    };

    var distance;
    vertices.forEach(function (vertex) {
        distance = vertex.distanceTo(point);
        if (distance < closest.distance) {
            closest.distance = distance;
            closest.vertex = vertex;
        }
    });

    return closest.vertex.clone().subtract(point).normalize();
};
