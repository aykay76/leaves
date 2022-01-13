export class Shape {
    constructor(svgdraw, x, y, w, h, src) {
        this._svgdraw = svgdraw
        this.selectable = true
        this.scalable = true
        this.moveable = true
        this.moving = false
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.src = src
        this.ui = null

        // used for moving shapes, where did we click to calculate distances etc.
        this.downPos = {}
        this.lastPos = {}
    }

    static fromObject(obj) {
        let shape = new Shape()
        Object.assign(shape, obj)
        return shape
    }

    addVisualElement(shapeLayer) {
        this.ui = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        this.ui.setAttribute('x', this.x)
        this.ui.setAttribute('y', this.y)
        this.ui.setAttribute('width', this.width)
        this.ui.setAttribute('height', this.height)
        if (this.moveable)
        {
            this.ui.setAttribute("style", "cursor: move;")
        }
        this.ui.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.src)
        this.ui.setAttributeNS('http://www.w3.org/1999/xlink', 'preserveAspectRatio', 'none')
        shapeLayer.appendChild(this.ui)

        this.ui.addEventListener("mouseenter", () => { this.onMouseEnter() })
        this.ui.addEventListener("mouseleave", () => { this.onMouseLeave() })
        this.ui.addEventListener("click", () => { this.onClick() })
        this.ui.addEventListener("mousedown", () => { this.onMouseDown() })
        this.ui.addEventListener("mouseup", () => { this.onMouseUp() })
    }

    removeVisualElement() {
        this.ui.parentElement.removeChild(this.ui)
    }

    onMouseEnter() {
        // console.log("mouse enter", window.event)
    }

    onMouseLeave(evt) {
        // console.log("mouse leave", window.event)
    }

    onClick() {
        console.log("click", window.event)
        window.event.preventDefault()
        window.event.cancelBubble = true
        this._svgdraw.selectShape(this)
    }

    onMouseDown() {
        if (this.moveable)
        {
            this.moving = true
            this._svgdraw.startMoving(this)
        }
    }

    onMouseUp() {
        if (this.moving) {
            this._svgdraw.stopMoving(this)
            this.moving = false
        }
    }
}
