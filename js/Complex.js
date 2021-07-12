function Complex(view, digraphs, position) {
    var that = this;

    /**
     * Start listening for events emitted by the Element
     *
     * @param { string } event to listen for
     * @param { function } callback to run on event
     * @returns { this } current Element object
     */
    that.addEventListener = function (event, callback) {
        return Events.prototype.addEventListener.call(this, event, callback);
    };

    /**
     * Stop listening for events emitted by the Element
     *
     * @param { string } event to stop listening for
     * @param { function } callback to stop running on event
     * @returns { this } current Element object
     */
    that.removeEventListener = function (event, callback) {
        return Events.prototype.removeEventListener.call(this, event, callback);
    };

    that.update = function () {
        Events.prototype.emit.call(this, "update");
    };

    that.isTouching = function (target) {
        return (
            target &&
            that.digraphs.some(function (digraph) {
                return digraph.isTouching(target);
            })
        );
    };

    Object.defineProperties(that, {
        position: {
            get: function () {
                return that._position;
            },
            set: function (position) {
                var init = typeof that._position === "undefined";

                if (
                    position instanceof Vector ||
                    typeof position === "object"
                ) {
                    if (init) that._position = new Vector();

                    that._position.x = position.x;
                    that._position.y = position.y;
                    that._position.z = position.z;
                } else {
                    throw new Error("Unable to set position");
                }

                that._position.addEventListener("x", function (e) {
                    that.digraphs = that.digraphs.map(function (digraph) {
                        digraph.vertices = digraph.vertices.map(function (
                            vertex
                        ) {
                            vertex.x += e.detail.difference;

                            return vertex;
                        });

                        return digraph;
                    });
                });

                that._position.addEventListener("y", function (e) {
                    that.digraphs = that.digraphs.map(function (digraph) {
                        digraph.vertices = digraph.vertices.map(function (
                            vertex
                        ) {
                            vertex.y += e.detail.difference;

                            return vertex;
                        });

                        return digraph;
                    });
                });

                that._position.addEventListener("z", function (e) {
                    that.digraphs = that.digraphs.map(function (digraph) {
                        digraph.vertices = digraph.vertices.map(function (
                            vertex
                        ) {
                            vertex.z += e.detail.difference;

                            return vertex;
                        });

                        return digraph;
                    });
                });

                if (init) {
                    that.digraphs = that.digraphs.map(function (digraph) {
                        digraph.vertices = digraph.vertices.map(function (
                            vertex
                        ) {
                            vertex.x += that.position.x;
                            vertex.y += that.position.y;
                            vertex.z += that.position.z;

                            return vertex;
                        });

                        return digraph;
                    });
                }
            }
        }
    });

    that.events = {
        update: []
    };
    that.view = view;
    that.digraphs = digraphs;
    that.position = position || {};
}

Complex.fromImage = function (
    view,
    position,
    image,
    src_x,
    src_y,
    src_width,
    src_height,
    dest_width,
    dest_height
) {
    dest_width = dest_width || image.width;
    dest_height = dest_height || image.height;

    var blueprint = new View(
        null,
        src_width || image.width,
        src_height || image.height
    );

    var scale = {
        x: dest_width / blueprint.canvas.width || 1,
        y: dest_height / blueprint.canvas.height || 1
    };

    blueprint.context.drawImage(
        image,
        src_x,
        src_y,
        blueprint.canvas.width,
        blueprint.canvas.height,
        0,
        0,
        blueprint.canvas.width,
        blueprint.canvas.height
    );

    var bounds = [];
    var open = false;
    var data = blueprint.context.getImageData(
        0,
        0,
        blueprint.canvas.width,
        blueprint.canvas.height
    ).data;
    var pixel;
    for (var y = 0; y < blueprint.canvas.height; y += 1) {
        for (var x = 0; x < blueprint.canvas.width + 1; x += 1) {
            pixel = (y * blueprint.canvas.width + x) * 4;

            if (data[pixel + 3] && x < blueprint.canvas.width) {
                if (!open) {
                    bounds.push([
                        {
                            x: x * scale.x,
                            y: y * scale.y
                        },
                        {
                            x: x * scale.x,
                            y: (y + 1) * scale.y
                        }
                    ]);
                    open = true;
                }
            } else if (open) {
                bounds[bounds.length - 1].splice(
                    1,
                    0,
                    {
                        x: x * scale.x,
                        y: y * scale.y
                    },
                    {
                        x: x * scale.x,
                        y: (y + 1) * scale.y
                    }
                );
                open = false;
            }
        }
    }

    for (var bound_i = 0; bound_i < bounds.length; bound_i += 1) {
        for (var target_i = 0; target_i < bounds.length; target_i += 1) {
            if (target_i === bound_i) continue;

            if (
                bounds[bound_i][2].x === bounds[target_i][1].x &&
                bounds[bound_i][2].y === bounds[target_i][1].y &&
                bounds[bound_i][3].x === bounds[target_i][0].x &&
                bounds[bound_i][3].y === bounds[target_i][0].y
            ) {
                bounds[bound_i][2] = bounds[target_i][2];
                bounds[bound_i][3] = bounds[target_i][3];
                bounds.splice(target_i, 1);
                bound_i -= 1;
                break;
            }
        }
    }

    return new Complex(
        view,
        bounds
            .filter(function (digraph) {
                return digraph;
            })
            .map(function (digraph) {
                return new Digraph(digraph);
            }),
        position
    );
};
