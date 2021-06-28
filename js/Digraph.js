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
    function updateBounds() {
        if (that.vertices.length === 2) {
            var radius = that.vertices[0].distanceTo(that.vertices[1]);

            that._bounds = {
                radius: radius,
                x: {
                    min: that.vertices[0].x - radius,
                    max: that.vertices[0].x + radius
                },
                y: {
                    min: that.vertices[0].y - radius,
                    max: that.vertices[0].y + radius
                },
                z: {
                    min: that.vertices[0].z,
                    max: that.vertices[0].z
                }
            };

            return that;
        }

        that._bounds = {
            radius: null,
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

        that.vertices.forEach(function (vertex) {
            that._bounds.x.min = Math.min(that._bounds.x.min, vertex.x);
            that._bounds.x.max = Math.max(that._bounds.x.max, vertex.x);

            that._bounds.y.min = Math.min(that._bounds.y.min, vertex.y);
            that._bounds.y.max = Math.max(that._bounds.y.max, vertex.y);

            that._bounds.z.min = Math.min(that._bounds.z.min, vertex.z);
            that._bounds.z.max = Math.max(that._bounds.z.max, vertex.z);
        });

        return that;
    }

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
        var dot = vector.dot(that.vertices[0]);
        var project = {
            min: dot,
            max: dot
        };

        if (that.bounds.radius) {
            project.min -= that.bounds.radius;
            project.max += that.bounds.radius;
        } else {
            for (
                var vertex_i = 1;
                vertex_i < that.vertices.length;
                vertex_i += 1
            ) {
                dot = vector.dot(that.vertices[vertex_i]);
                project.min = Math.min(project.min, dot);
                project.max = Math.max(project.max, dot);
            }
        }

        return project;
    };

    /**
     * Determine whether digraphs are touching bounding boxes
     *
     * @param { Digraph } digraph to test against
     * @returns { boolean } whether digraphs are bounding
     */
    that.isBounding = function (digraph) {
        return (
            digraph.bounds.x.min <= that.bounds.x.max &&
            digraph.bounds.x.max >= that.bounds.x.min &&
            digraph.bounds.y.min <= that.bounds.y.max &&
            digraph.bounds.y.max >= that.bounds.y.min
        );
    };

    that.getAxis = function (digraph, vertex1, vertex2) {
        if (that.bounds.radius) {
            return Vector.fromClosest(that.vertices[0], digraph.vertices);
        }

        return Vector.fromPerpendicular(vertex1, vertex2);
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

        var target = that;

        for (var i = 0; i < 2; i += 1) {
            var edges = target.getEdges();

            for (var edge_i = 0; edge_i < edges.length - 1; edge_i += 1) {
                var axis = target.getAxis(
                    digraph,
                    edges[edge_i],
                    edges[edge_i + 1]
                );
                var project = target.projectToVector(axis);
                var digraph_project = digraph.projectToVector(axis);

                // digraphs have a gap between them
                if (
                    Math.min(project.max, digraph_project.max) -
                        Math.max(project.min, digraph_project.min) <
                    0
                ) {
                    return false;
                }
            }

            target = digraph;
            digraph = that;
        }

        return true;
    };

    /**
     * Draw the digraph onto the context, without stroke/fill
     *
     * @param { CanvasRenderingContext2D } context from canvas
     * @param { boolean } [vertex_dots] whether to include vertex dots
     * @returns { this } current digraph
     */
    that.draw = function (context, vertex_dots) {
        context.beginPath();

        if (that.bounds.radius) {
            context.arc(
                that.vertices[0].x,
                that.vertices[0].y,
                that.bounds.radius,
                0,
                2 * Math.PI
            );

            if (vertex_dots) {
                context.fillRect(
                    that.vertices[0].x - 1,
                    that.vertices[0].y - 1,
                    3,
                    3
                );
                context.fillRect(
                    that.vertices[1].x - 1,
                    that.vertices[1].y - 1,
                    3,
                    3
                );
            }
        } else {
            that.getEdges().forEach(function (vertex) {
                context.lineTo(vertex.x, vertex.y);

                if (vertex_dots) {
                    context.fillRect(vertex.x - 1, vertex.y - 1, 3, 3);
                }
            });
        }

        context.closePath();

        return that;
    };

    Object.defineProperty(that, "bounds", {
        get: function () {
            return that._bounds;
        },
        set: updateBounds
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

            if (vertices.length !== 2 && vertices.length < 3) {
                throw new Error("Digraphs must have two/three+ vertices");
            }

            that._vertices = vertices.map(function (vertex) {
                if (vertex instanceof Vector) return vertex;

                if (typeof vertex === "object") {
                    return new Vector(vertex.x, vertex.y, vertex.z);
                }

                throw new Error("Unable to convert coordinates to Vector");
            });
            updateBounds();

            Object.defineProperties(that._vertices, {
                pop: {
                    value: function () {
                        Array.prototype.pop.apply(this, arguments);
                        updateBounds();
                    }
                },
                push: {
                    value: function () {
                        Array.prototype.push.apply(this, arguments);
                        updateBounds();
                    }
                },
                shift: {
                    value: function () {
                        Array.prototype.shift.apply(this, arguments);
                        updateBounds();
                    }
                },
                unpop: {
                    value: function () {
                        Array.prototype.unpop.apply(this, arguments);
                        updateBounds();
                    }
                },
                unshift: {
                    value: function () {
                        Array.prototype.unshift.apply(this, arguments);
                        updateBounds();
                    }
                }
            });
        }
    });

    that.vertices = vertices;
}
