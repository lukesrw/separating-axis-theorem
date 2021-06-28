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
     * Return normalized form of Vector
     *
     * @returns { Vector } normalized vector
     */
    that.normalize = function () {
        var magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

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

    that.x = x ? parseFloat(x) : 0;
    that.y = y ? parseFloat(y) : 0;
    that.z = z ? parseFloat(z) : 0;
}

/**
 *
 * @param { { x?: number, y?: number, z?: number } | Vector } vector1 line start
 * @param { { x?: number, y?: number, z?: number } | Vector } vector2 line end
 * @returns { { x?: number, y?: number, z?: number } | Vector } new perpendicular vector
 */
Vector.fromPerpendicular = function (vector1, vector2) {
    return new Vector(
        -(vector2.y - vector1.y),
        vector2.x - vector1.x
    ).normalize();
};

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
