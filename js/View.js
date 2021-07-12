function View(canvas, width, height) {
    var that = this;

    /**
     * Clear the current view context
     *
     * @returns { this } current View
     */
    that.clear = function () {
        that.context.clearRect(0, 0, that.canvas.width, that.canvas.height);

        return that;
    };

    that.canvas = canvas || document.createElement("canvas");
    that.canvas.style.display = "block";

    var parent = that.canvas.parentElement;
    if (parent && parent.tagName === "BODY") parent = window;

    that.canvas.width = width || parent.innerWidth || parent.clientWidth;
    that.canvas.height = height || parent.innerHeight || parent.clientHeight;

    that.context = that.canvas.getContext("2d");
    that.context.webkitImageSmoothingEnabled = false;
    that.context.imageSmoothingEnabled = false;
    that.context.lineWidth = 1;
}
