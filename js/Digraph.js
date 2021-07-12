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
     * Calculate minimum and maximum points of projection
     *
     * @param { Vector } vector to project onto
     * @returns { { min: number, max: number } } projection bounds
     */
    that.projectToVector = function (vector) {
        if (!(vector instanceof Vector)) {
            throw new Error("Vector must be instance of Vector class");
        }

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
        if (!(digraph instanceof Digraph)) {
            throw new Error("Digraph must be instance of Digraph class");
        }

        return (
            digraph.bounds.x.min <= that.bounds.x.max &&
            digraph.bounds.x.max >= that.bounds.x.min &&
            digraph.bounds.y.min <= that.bounds.y.max &&
            digraph.bounds.y.max >= that.bounds.y.min
        );
    };

    /**
     * Retrieve the axis to use for comparison between two digraphs
     *
     * @param { Digraph } digraph to create axis against
     * @param { { x?: number, y?: number, z?: number } | Vector } [vertex1] to start perpendicular point (for non-circles)
     * @param { { x?: number, y?: number, z?: number } | Vector } [vertex2] to end perpendiular point (for non-circles)
     * @returns { Vector } to compare project digraphs onto
     */
    that.getAxis = function (digraph, vertex1, vertex2) {
        if (that.bounds.radius) {
            if (!(digraph instanceof Digraph)) {
                throw new Error("Digraph must be instance of Digraph class");
            }

            return Vector.fromClosest(that.vertices[0], digraph.vertices);
        }

        return Vector.fromPerpendicular(vertex1, vertex2);
    };

    /**
     * Determine whether digraph is purely rectangular bounds representation
     *
     * @returns { boolean } whether digraph is just bounds
     */
    that.isBounds = function () {
        return (
            that.vertices.length === 4 &&
            that.vertices[0].x === that.bounds.x.min &&
            that.vertices[1].x === that.bounds.x.max &&
            that.vertices[2].x === that.bounds.x.max &&
            that.vertices[3].x === that.bounds.x.min &&
            that.vertices[0].y === that.bounds.y.min &&
            that.vertices[1].y === that.bounds.y.min &&
            that.vertices[2].y === that.bounds.y.max &&
            that.vertices[3].y === that.bounds.y.max
        );
    };

    /**
     * Determine whether digraphs are touching
     *
     * @param { Digraph } digraph to test against
     * @returns { boolean } whether digraphs are touching
     */
    that.isTouching = function (digraph) {
        if (!(digraph instanceof Digraph)) {
            throw new Error("Digraph must be instance of Digraph class");
        }

        // digraphs aren't even bounding
        if (!that.isBounding(digraph, true)) return false;

        // digraphs must be touching if vertices is just bounds
        if (that.isBounds()) return true;

        var target = that;

        for (var i = 0; i < 2; i += 1) {
            var edges = target.vertices.concat(target.vertices[0]);
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
     * @param { { x?: number, y?: number, z?: number } | Vector } [offset] to change vertex by
     * @param { boolean } [vertex_dots] whether to include vertex dots
     * @returns { this } current digraph
     */
    that.draw = function (context, offset, vertex_dots) {
        context.beginPath();

        offset = Object.assign(
            {
                x: 0,
                y: 0
            },
            offset || {}
        );

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
            that.vertices.forEach(function (vertex) {
                vertex = vertex.clone().add(offset);

                context.lineTo(vertex.x, vertex.y);

                if (vertex_dots) {
                    context.fillRect(vertex.x - 1, vertex.y - 1, 3, 3);
                }
            });
        }

        context.closePath();

        return context;
    };

    /**
     * Convert current digraph to circular approximation
     *
     * @returns { this } current digraph
     */
    that.toCircle = function () {
        var x = Math.round((that.bounds.x.min + that.bounds.x.max) / 2);
        var x_radius = Math.round(that.bounds.x.max - that.bounds.x.min);
        var y = Math.round((that.bounds.y.min + that.bounds.y.max) / 2);
        var y_radius = Math.round(that.bounds.y.max - that.bounds.y.min);

        that.vertices = [
            {
                x: x,
                y: y
            },
            {
                x: x + (x > y ? x_radius : y_radius) / 2,
                y: y
            }
        ];

        return that;
    };

    /**
     * Convert current digraph to bounds approximation
     *
     * @returns { this } current digraph
     */
    that.toBounds = function () {
        that.vertices = [
            {
                x: that.bounds.x.min,
                y: that.bounds.y.min
            },
            {
                x: that.bounds.x.max,
                y: that.bounds.y.min
            },
            {
                x: that.bounds.x.max,
                y: that.bounds.y.max
            },
            {
                x: that.bounds.x.min,
                y: that.bounds.y.max
            }
        ];

        return that;
    };

    Object.defineProperties(that, {
        bounds: {
            get: function () {
                return that._bounds;
            },
            set: updateBounds
        },
        vertices: {
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
        }
    });

    that.vertices = vertices;
}

/**
 * Create digraph approximation from image (or part of an image)
 *
 * @param { HTMLImageElement } image to represent
 * @param { number } [src_x] to start image
 * @param { number } [src_y] to start image
 * @param { number } [src_width] to end image
 * @param { number } [src_height] to end image
 * @param { number } [dest_width] to display image
 * @param { number } [dest_height] to display image
 * @returns { Digraph } of image
 */
Digraph.fromImage = function (
    image,
    src_x,
    src_y,
    src_width,
    src_height,
    dest_width,
    dest_height
) {
    var scale = {
        x: dest_width / src_width || 1,
        y: dest_height / src_height || 1
    };
    var canvas = document.createElement("canvas");
    canvas.width = src_width || image.width;
    canvas.height = src_height || image.height;

    var context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    context.drawImage(
        image,
        src_x || 0,
        src_y || 0,
        canvas.width,
        canvas.width,
        0,
        0,
        canvas.width,
        canvas.height
    );

    var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    var meta = {};
    for (var y = 0; y < canvas.height; y += 1) {
        if (!(y in meta)) {
            meta[y] = {
                min: Infinity,
                max: -Infinity
            };
        }

        for (var x = 0; x < canvas.width; x += 1) {
            if (data[(y * canvas.width + x) * 4 + 3]) {
                meta[y].min = Math.min(meta[y].min, x);
                break;
            }
        }

        if (meta[y].min === Infinity) {
            delete meta[y];
        } else {
            for (var x = canvas.width - 1; x > -1; x -= 1) {
                if (data[(y * canvas.width + x) * 4 + 3]) {
                    meta[y].max = Math.max(meta[y].max, x);
                    break;
                }
            }
        }
    }

    var vertices = [];
    var keys = Object.keys(meta);
    var incr = 1;
    for (var i = 0; i > -1 && i < keys.length; i += incr) {
        for (var j = 0; j < (scale.y !== 1 ? 2 : 1); j += 1) {
            vertices.push({
                x:
                    (meta[keys[i]][incr === 1 ? "min" : "max"] +
                        (incr === 1 ? 0 : 1)) *
                    scale.x,
                y:
                    keys[i] * scale.y +
                    ((incr === 1 && j === 0) || (incr !== 1 && j !== 0)
                        ? 0
                        : scale.y)
            });
        }

        if (i === keys.length - 1 && incr === 1) {
            incr *= -1;
            i += 1;
        }
    }

    return new Digraph(vertices);
};

/**
 * Create Digraph from point and a radius
 *
 * @param { { x?: number, y?: number, z?: number } | Vector } point to center around
 * @param { number } [radius] of the circle (default: 1)
 * @returns { Digraph } new circular Digraph
 */
Digraph.fromPoint = function (point, radius) {
    return new Digraph([
        point,
        {
            x: point.x + (radius || 0.01),
            y: point.y
        }
    ]);
};
