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
        return (
            this.x * (vector.x || 0) +
            this.y * (vector.y || 0) +
            this.z * (vector.z || 0)
        );
    };

    /**
     * Calculate magnitude of Vector
     *
     * @returns { number }
     */
    that.getMagnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };

    /**
     * Return normalized form of Vector
     *
     * @returns { Vector } normalized vector
     */
    that.normalize = function () {
        var magnitude = that.getMagnitude();

        if (magnitude === 0) return that;

        return new Vector(
            this.x * (1 / magnitude),
            this.y * (1 / magnitude),
            this.z
        );
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
     * Increase this Vector by another Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to add
     * @returns { this } current vector
     */
    that.add = function (vector) {
        that.x += vector.x || 0;
        that.y += vector.y || 0;
        that.z += vector.z || 0;

        return that;
    };

    /**
     * Decrease this Vector by another Vector
     *
     * @param { { x?: number, y?: number, z?: number } | Vector } vector to subtract
     * @returns { this } current vector
     */
    that.subtract = function (vector) {
        that.x -= vector.x || 0;
        that.y -= vector.y || 0;
        that.z -= vector.z || 0;

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
        return Events.prototype.addEventListener.call(that, event, callback);
    };

    /**
     * Stop listening for events emitted by the Vector
     *
     * @param { string } event to stop listening for
     * @param { function } callback to stop running on event
     * @returns { this } current Vector object
     */
    that.removeEventListener = function (event, callback) {
        return Events.prototype.removeEventListener.call(that, event, callback);
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

                if (difference !== 0) {
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

                if (difference !== 0) {
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

                if (difference !== 0) {
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
        distance: Infinity,
        delta: null
    };

    var distance;
    vertices.forEach(function (vertex) {
        distance = vertex.distanceTo(point);
        if (distance < closest.distance) {
            closest.distance = distance;
            closest.vertex = vertex;
            closest.delta = {
                x: vertex.x - point.x,
                y: vertex.y - point.y
            };
        }
    });

    return new Vector(closest.delta.x, closest.delta.y).normalize();
};
