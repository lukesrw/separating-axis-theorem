"use strict";

/**
 * @param { ( { x?: number, y?: number, z?: number } | Vector )[] } vertices points of digraph
 */
function Digraph(vertices) {
    var that = this;

    /**
     * Updating the bounding box of the digraph
     *
     * @returns { this } current digraph
     */
    that.updateBounds = function () {
        that._bounds = {
            x: {
                min: Infinity,
                max: -Infinity
            },
            y: {
                min: Infinity,
                max: -Infinity
            },
            z: {
                min: Infinity,
                max: -Infinity
            }
        };

        that._vertices.forEach(function (vertex) {
            that._bounds.x.min = Math.min(that._bounds.x.min, vertex.x);
            that._bounds.x.max = Math.max(that._bounds.x.max, vertex.x);

            that._bounds.y.min = Math.min(that._bounds.y.min, vertex.y);
            that._bounds.y.max = Math.max(that._bounds.y.max, vertex.y);

            that._bounds.z.min = Math.min(that._bounds.z.min, vertex.z);
            that._bounds.z.max = Math.max(that._bounds.z.max, vertex.z);
        });

        return that;
    };

    /**
     * Retrieve the vertices with the start included twice
     *
     * @returns { ( { x?: number, y?: number, z?: number } | Vector )[] } all vertices (plus start again)
     */
    that.getEdges = function () {
        if (that.vertices.length < 2) return [];

        return that.vertices.concat(that.vertices[0]);
    };

    /**
     * Calculate minimum and maximum points of projection
     *
     * @param { Vector } vector to project onto
     * @returns { { min: number, max: number } } projection bounds
     */
    that.projectToVector = function (vector) {
        var project = {
            min: Infinity,
            max: -Infinity
        };

        var dot;
        for (var vertex_i = 0; vertex_i < that.vertices.length; vertex_i += 1) {
            dot = vector.dot(that.vertices[vertex_i]);
            project.min = Math.min(project.min, dot);
            project.max = Math.max(project.max, dot);
        }

        return project;
    };

    /**
     * Determine whether digraphs are touching bounding boxes
     *
     * @param { Digraph } digraph to test against
     * @param { boolean } [edge] increase size by 1 pixel
     * @returns { boolean } whether digraphs are bounding
     */
    that.isBounding = function (digraph, edge) {
        edge = edge ? 1 : 0;

        return (
            digraph.bounds.x.min - edge <= that.bounds.x.max + edge &&
            digraph.bounds.x.max + edge >= that.bounds.x.min - edge &&
            digraph.bounds.y.min - edge <= that.bounds.y.max + edge &&
            digraph.bounds.y.max + edge >= that.bounds.y.min - edge
        );
    };

    /**
     * Determine whether digraphs are touching
     *
     * @param { Digraph } digraph to test against
     * @returns { boolean } whether digraphs are touching
     */
    that.isTouching = function (digraph) {
        // digraphs aren't even bounding
        if (!that.isBounding(digraph, true)) return false;

        var edges = that.getEdges();
        for (var i = 0; i < 2; i += 1) {
            for (var edge_i = 0; edge_i < edges.length - 1; edge_i += 1) {
                var axis = Vector.fromPerpendicular(
                    edges[edge_i],
                    edges[edge_i + 1]
                );
                var project = that.projectToVector(axis);
                var digraph_project = digraph.projectToVector(axis);

                // digraphs have a gap between them
                if (
                    Math.min(project.max + 1, digraph_project.max) -
                        Math.max(project.min - 1, digraph_project.min) <
                    0
                ) {
                    return false;
                }
            }

            edges = digraph.getEdges();
        }

        return true;
    };

    Object.defineProperty(that, "bounds", {
        get: function () {
            return that._bounds;
        },
        set: that.updateBounds
    });

    Object.defineProperty(that, "vertices", {
        get: function () {
            return that._vertices;
        },
        set: function (vertices) {
            if (!Array.isArray(vertices)) {
                throw new Error(
                    "Vertices must be an array of Vectors/coordinates"
                );
            }

            if (vertices.length < 3) {
                throw new Error("Digraphs must have at least three vertices");
            }

            that._vertices = vertices.map(function (vertex) {
                if (vertex instanceof Vector) return vertex;

                if (typeof vertex === "object") {
                    return new Vector(vertex.x, vertex.y, vertex.z);
                }

                throw new Error("Unable to convert coordinates to Vector");
            });
            that.updateBounds();

            Object.defineProperties(that._vertices, {
                map: {
                    value: function () {
                        var map = Array.prototype.map.apply(this, arguments);

                        that.updateBounds();

                        return map;
                    }
                },
                pop: {
                    value: function () {
                        Array.prototype.pop.apply(this, arguments);
                        that.updateBounds();
                    }
                },
                push: {
                    value: function () {
                        Array.prototype.push.apply(this, arguments);
                        that.updateBounds();
                    }
                },
                shift: {
                    value: function () {
                        Array.prototype.shift.apply(this, arguments);
                        that.updateBounds();
                    }
                },
                unpop: {
                    value: function () {
                        Array.prototype.unpop.apply(this, arguments);
                        that.updateBounds();
                    }
                },
                unshift: {
                    value: function () {
                        Array.prototype.unshift.apply(this, arguments);
                        that.updateBounds();
                    }
                }
            });
        }
    });

    that.vertices = vertices;
}
