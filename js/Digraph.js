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
            that.vertices.forEach(function (vertex) {
                context.lineTo(vertex.x, vertex.y);

                if (vertex_dots) {
                    context.fillRect(vertex.x - 1, vertex.y - 1, 3, 3);
                }
            });
        }

        context.closePath();

        return that;
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

/**
 * Create digraph approximation from image
 *
 * @param { HTMLImageElement } image to represent
 * @returns { Digraph} of image
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
    var canvas = document.createElement("canvas");
    canvas.width = dest_width || src_width || image.width;
    canvas.height = dest_height || src_height || image.height;

    var context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    context.drawImage(
        image,
        src_x || 0,
        src_y || 0,
        src_width || image.width,
        src_height || image.height,
        0,
        0,
        dest_width || canvas.width,
        dest_height || canvas.height
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
            for (var x = canvas.width; x > -1; x -= 1) {
                if (data[(y * canvas.width + x) * 4 + 3]) {
                    meta[y].max = Math.max(meta[y].max, x);
                    break;
                }
            }
        }
    }

    var vertices = [];
    var keys = Object.keys(meta);
    var change = 1;
    for (var i = 0; i > -1 && i < keys.length; i += change) {
        vertices.push({
            x: meta[keys[i]][change === 1 ? "min" : "max"],
            y: keys[i]
        });

        if (i === keys.length - 1 && change === 1) change *= -1;
    }

    return new Digraph(vertices);
};
