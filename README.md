# Separating Axis Theorem (SAT)

### [Live Demo](https://lukesrw.github.io/separating-axis-theorem/)

## Description

Separating Axis Theorem (SAT) is a collision detection method that uses vertices projected onto a shared axis to determine whether objects are touching or not, if there is a gap in this shared axis - the objects are not touching.

### Drawbacks

Unfortunately this algorithm isn't accurate for testing convex polygons, the methods will still function and return true/false - but the shape they use will be extremely rough (using the bounding box at the very worst).

## Usage

Use Digraphs to represent each shape you want to test the collisions of:

```js
var square = new Digraph([
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
]);

var circle = Digraph.fromPoint(
    {
        x: 300,
        y: 150
    },
    100
);

square.isTouching(circle);
```

## Vector

Contains methods for handling simple coordinates, or direction/magnitude/etc.

Most methods will interchangeably accept either a Vector or an object with "x", "y", and "z" properties.

---

Create a Vector from a given x, y, and z:

```js
var point = new Vector(100, 100, 100);
```

Create a Vector from the perpendicular of two other points:

```js
var point = Vector.fromPerpendicular(
    {
        x: 100,
        y: 100
    },
    new Vector(200, 200)
);
```

Create a Vector from the closest point to a set of vertices (for circular collisions):

```js
var point = Vector.fromClosest(
    new Vector(
        100
        200
    ),
    [
        {
            x: 10,
            y: 20
        },
        {
            x: 20,
            y: 30
        },
        new Vector(
            30,
            40
        )
    ]
);
```

There's also an optional `Events.js` file which, if included, will add event listener functionality to a vector, allowing you to be notified of any changes to the coordinates; each event is simply named "x", "y", or "z":

```js
var point = new Vector(100, 100, 0);

point.addEventListener("x", function (event, vector) {
    console.log(point.x); // new value
    console.log(vector.x); // new value (alternative)

    console.log(event.detail.difference); // change value
});
```

## Digraph

Contains methods for testing collisions and converting to optimized shapes.

Circles can be created by providing two vertices, one for the center and another for an edge point.

Most methods will interchangeably accept either a Vector or an object with "x", "y", and "z" properties.

---

Create a Digraph from a sorted array of vectors:

```js
var shape = new Digraph([
    {
        x: 100,
        y: 100
    },
    new Vector(200, 100),
    new Vector(200, 200),
    {
        x: 100,
        y: 200
    }
]);
```

Create a Digraph approximation\* of an image:

Accepts the same arguments as [CanvasRenderingContext2D.drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage) but without "dx" or "dy".

```js
var image = new Image();
image.onload = function () {
    var shape = Digraph.fromImage(image);
};
image.src = "./penguin.png";
```

\*creates vertices for the leftmost and rightmost non-transparent pixels

### Optimization & Performance

Time taken to test collision detection grows exponentially with the number of vertices a digraph has.

The method won't begin checking vertices unless the two objects are at least touching bounding boxes.

If you've got a highly detailed digraph (for example from Digraph.fromImage), you might want to optimize:

-   If your digraph is a circle (or could be one for testing collision), you can use `.toCircle()`
-   If your digraph size matters more than specific edges, you can use `.toBounds()`
