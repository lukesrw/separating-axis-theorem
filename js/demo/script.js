"use strict";

var objects = [];
var textarea;
var canvas;
var context;

/**
 * Render each of the objects onto the canvas
 *
 * @returns { void }
 */
function renderDigraphs() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();

    objects.forEach(function (object) {
        context.restore();

        context.strokeStyle = "#0F0";
        if (
            objects.some(function (target) {
                return (
                    object !== target &&
                    object.digraph.isTouching(target.digraph)
                );
            })
        ) {
            object.conflict = true;

            context.strokeStyle = "#F00";
        } else if (object.hover) {
            object.conflict = false;

            context.strokeStyle = "#00F";
        } else {
            object.conflict = false;
        }

        object.digraph.draw(context, true);

        context.stroke();
    });
}

/**
 * Handle mouse events for hover/dragging
 *
 * @param { MouseEvent } event from user
 * @returns { void }
 */
function mouseEvent(event) {
    var x = event.clientX - canvas.offsetLeft;
    var y = event.clientY - canvas.offsetTop;

    switch (event.type) {
        case "mousemove":
            objects.forEach(function (object, object_i) {
                if (object.move) {
                    var diff = {
                        x: object.move.x + x - object.digraph.vertices[0].x,
                        y: object.move.y + y - object.digraph.vertices[0].y
                    };

                    object.digraph.vertices = object.digraph.vertices.map(
                        function (vertex) {
                            vertex.x += diff.x;
                            vertex.y += diff.y;

                            return vertex;
                        }
                    );

                    if (object_i === 8) {
                        textarea.value = object.digraph.vertices
                            .map(function (vertex) {
                                return vertex.x + "," + vertex.y;
                            })
                            .join("\n");
                    }
                }
            });
            break;

        case "mouseup":
            objects.forEach(function (object) {
                object.move = false;
            });
            break;
    }

    var cursor = new Digraph([
        {
            x: x,
            y: y
        },
        {
            x: x + 1,
            y: y
        },
        {
            x: x + 1,
            y: y + 1
        },
        {
            x: x,
            y: y + 1
        }
    ]);

    objects.forEach(function (object) {
        object.hover = cursor.isTouching(object.digraph);

        if (object.hover && event.type === "mousedown") {
            object.move = {
                x: object.digraph.vertices[0].x - x,
                y: object.digraph.vertices[0].y - y
            };
        }
    });
}

/**
 * Update the custom shape
 *
 * @returns { void }
 */
function updateCustom() {
    var vertices = textarea.value
        .trim()
        .split("\n")
        .map(function (line) {
            line = line.trim().split(",");

            return {
                x: line[0],
                y: line[1]
            };
        });

    if (vertices.length < 2) vertices = [{}, {}];

    objects[objects.length - 1].digraph.vertices = vertices;
}

window.addEventListener("DOMContentLoaded", function () {
    textarea = document.getElementById("custom");
    textarea.addEventListener("keyup", updateCustom);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener("mousedown", mouseEvent);
    canvas.addEventListener("mouseup", mouseEvent);
    canvas.addEventListener("mousemove", mouseEvent);

    context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.translate(0.5, 0.5);
    context.lineWidth = 1;
    context.fillStyle = "#FFF";

    objects.push(
        {
            digraph: new Digraph([
                {
                    x: 100,
                    y: 100
                },
                {
                    x: 200,
                    y: 100
                },
                {
                    x: 200,
                    y: 200
                },
                {
                    x: 100,
                    y: 200
                }
            ]),
            hover: false,
            move: false
        },
        {
            digraph: new Digraph([
                {
                    x: 300,
                    y: 100
                },
                {
                    x: 400,
                    y: 100
                },
                {
                    x: 400,
                    y: 200
                },
                {
                    x: 300,
                    y: 200
                }
            ]),
            hover: false,
            move: false
        },
        {
            digraph: new Digraph([
                {
                    x: 150,
                    y: 300
                },
                {
                    x: 200,
                    y: 400
                },
                {
                    x: 100,
                    y: 400
                }
            ]),
            hover: false,
            move: false
        },
        {
            digraph: new Digraph([
                {
                    x: 350,
                    y: 300
                },
                {
                    x: 400,
                    y: 400
                },
                {
                    x: 300,
                    y: 400
                }
            ]),
            hover: false,
            move: false
        },
        {
            digraph: new Digraph([
                {
                    x: 130,
                    y: 500
                },
                {
                    x: 170,
                    y: 500
                },
                {
                    x: 200,
                    y: 530
                },
                {
                    x: 200,
                    y: 570
                },
                {
                    x: 170,
                    y: 600
                },
                {
                    x: 130,
                    y: 600
                },
                {
                    x: 100,
                    y: 570
                },
                {
                    x: 100,
                    y: 530
                }
            ])
        },
        {
            digraph: new Digraph([
                {
                    x: 330,
                    y: 500
                },
                {
                    x: 370,
                    y: 500
                },
                {
                    x: 400,
                    y: 530
                },
                {
                    x: 400,
                    y: 570
                },
                {
                    x: 370,
                    y: 600
                },
                {
                    x: 330,
                    y: 600
                },
                {
                    x: 300,
                    y: 570
                },
                {
                    x: 300,
                    y: 530
                }
            ])
        },
        {
            digraph: new Digraph([
                {
                    x: 150,
                    y: 750
                },
                {
                    x: 200,
                    y: 750
                }
            ])
        },
        {
            digraph: new Digraph([
                {
                    x: 350,
                    y: 750
                },
                {
                    x: 400,
                    y: 750
                }
            ])
        },
        {
            digraph: new Digraph([{}, {}])
        }
    );

    setInterval(renderDigraphs, 10);
    updateCustom();
    renderDigraphs();
});
