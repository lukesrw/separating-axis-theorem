"use strict";

var objects = [];
var context;

function renderDigraphs() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(function (object) {
        context.beginPath();

        context.strokeStyle = "#0F0";
        if (
            objects.some(function (target) {
                return (
                    object !== target &&
                    object.digraph.isTouching(target.digraph)
                );
            })
        ) {
            context.strokeStyle = "#F00";
        } else if (object.hover) {
            context.strokeStyle = "#00F";
        }

        object.digraph.getEdges().forEach(function (vertex) {
            context.lineTo(vertex.x, vertex.y);
        });

        context.closePath();
        context.stroke();
    });
}

function mouseEvent(event) {
    var x = event.clientX - canvas.offsetLeft;
    var y = event.clientY - canvas.offsetTop;

    switch (event.type) {
        case "mousemove":
            objects.forEach(function (object) {
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

window.addEventListener("DOMContentLoaded", function () {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    var canvas = document.getElementById("canvas");
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
        }
    );

    setInterval(renderDigraphs, 10);
    renderDigraphs();
});
