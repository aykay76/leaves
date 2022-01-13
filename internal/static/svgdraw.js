import { Shape } from './shape.js'
import { Action} from './action.js'

export class SVGDraw {
    constructor(element) {
        this.svg = element
        this.model = []
        // TODO: probably want to do multi-select? make this an array at some point
        this.selectedShape = null
        this.movingShape = null
        this.resizeShape = null
        this.resizeDirection = null
        this.lastPos = {}
        this.scale = 1.0

        // create an action stack for undo
        this.currentAction = null
        this.actionStack = []
        this.actionPointer = -1

        // add some SVG group elements to store different things
        this.shapeLayer = document.createElementNS(this.svg.namespaceURI, 'g')
        this.svg.appendChild(this.shapeLayer)
        this.overlayLayer = document.createElementNS(this.svg.namespaceURI, 'g')
        this.svg.appendChild(this.overlayLayer)

        // handle mouse move at a higher level than individual shapes so that mouseleave doesn't interfere with large moves
        this.svg.addEventListener("mousemove", () => { this.onMouseMove() })
        this.svg.addEventListener("mousewheel", () => { this.onMouseWheel() })
        this.svg.addEventListener("click", () => { this.onClick() })
        this.svg.addEventListener("mouseup", () => { this.onMouseUp() })

        // TODO: add keyboard hanlder for Ctrl/Command Z undo etc.

        // add some events to allow the drop of files onto the board
        this.svg.addEventListener("drop", () => { this.onDrop() })
        this.svg.addEventListener("dragover", () => { this.onDragOver() })
    }

    jsonReplacer(key, value) {
        if (key == "_svgdraw") return undefined
        else return value
    }

    loadModel() {
        this.model = []

        // for ease of testing, load from local storage, this will obviously extend in the future to handle files etc.
        let raw = JSON.parse(window.localStorage.getItem("svgdraw"))
        if (raw == null) return
        if (this.model != null) {
            raw.forEach(element => { 
                let shape = Shape.fromObject(element)
                shape._svgdraw = this
                this.model.push(shape) 
            })
        }

        this.model.forEach(shape => { shape.addVisualElement(this.shapeLayer)})
    }

    saveModel() {
        window.localStorage.setItem("svgdraw", JSON.stringify(this.model, this.jsonReplacer))
    }

    resetModel() {
        console.log("emptying model and clearing browser storage")
        this.model.forEach(shape => { shape.removeVisualElement() })
        this.model = []
        window.localStorage.removeItem("svgdraw")
    }

    addShape(x, y, w, h, src) {
        let shape = new Shape(this, x, y, w, h, src)
        this.model.push(shape)
        shape.addVisualElement(this.shapeLayer)

        this.saveModel()
    }

    getMousePosition(evt) {
        var CTM = this.svg.getScreenCTM()
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        }
    }

    startResize(shape, direction) {
        console.log('resizing', shape, direction)
        this.resizeShape = shape
        this.resizeDirection = direction

        this.currentAction = new Action()
        this.currentAction.action = 'resize'
        this.currentAction.shape = shape
        this.currentAction.oldState['x'] = shape.x
        this.currentAction.oldState['y'] = shape.y
        this.currentAction.oldState['width'] = shape.width
        this.currentAction.oldState['height'] = shape.height
    }

    startMoving(shape) {
        this.movingShape = shape
    }

    stopMoving(shape) {
        this.movingShape = null
        this.saveModel()
    }

    stopResize() {
        this.currentAction.newState['x'] = this.resizeShape.x
        this.currentAction.newState['y'] = this.resizeShape.y
        this.currentAction.newState['width'] = this.resizeShape.width
        this.currentAction.newState['height'] = this.resizeShape.height

        // clear any subsequent actions in the redo buffer
        this.actionStack = this.actionStack.slice(0, this.actionPointer)
        // add the action to the undo stack
        this.actionStack.push(this.currentAction)
        // repoint the pointer
        this.actionPointer = this.actionStack.length
        this.resizeShape = null
        this.currentAction = null
        this.saveModel()

        console.log(this.actionStack)
    }

    selectShape(shape) {
        // if (this.selectedShape == shape) return

        // clear out overlay elements from any previous selection
        while (this.overlayLayer.firstChild) {
            this.overlayLayer.removeChild(this.overlayLayer.lastChild)
        }
        
        // update the selected shape in case it's required
        this.selectedShape = shape

        // add some overlay gadgets
        let nw = document.createElementNS(this.svg.namespaceURI, "circle")
        nw.id = "nw-resize"
        nw.setAttribute('cx', this.selectedShape.x - 5)
        nw.setAttribute('cy', this.selectedShape.y - 5)
        nw.setAttribute('r', 4)
        nw.setAttribute('stroke', 'black')
        nw.setAttribute('stroke-width', '1')
        nw.setAttribute('fill', 'white')
        nw.setAttribute('cursor', 'nw-resize')
        nw.addEventListener('mousedown', () => { this.startResize(this.selectedShape, 'nw') })
        nw.addEventListener('mouseup', () => { this.stopResize() })
        nw.addEventListener('click', () => { window.event.cancelBubble = true })
        this.overlayLayer.appendChild(nw)

        let se = nw.cloneNode()
        se.id = 'se-resize'
        se.setAttribute('cx', this.selectedShape.x + this.selectedShape.width + 5)
        se.setAttribute('cy', this.selectedShape.y + this.selectedShape.height + 5)
        se.setAttribute('cursor', 'se-resize')
        se.addEventListener('mousedown', () => { this.startResize(this.selectedShape, 'se') })
        se.addEventListener('mouseup', () => { this.stopResize() })
        se.addEventListener('click', () => { window.event.cancelBubble = true })
        this.overlayLayer.appendChild(se)

        let ne = nw.cloneNode()
        ne.id = 'ne-resize'
        ne.setAttribute('cx', this.selectedShape.x + this.selectedShape.width + 5)
        ne.setAttribute('cy', this.selectedShape.y - 5)
        ne.setAttribute('cursor', 'ne-resize')
        ne.addEventListener('mousedown', () => { this.startResize(this.selectedShape, 'ne') })
        ne.addEventListener('mouseup', () => { this.stopResize() })
        ne.addEventListener('click', () => { window.event.cancelBubble = true })
        this.overlayLayer.appendChild(ne)

        let sw = nw.cloneNode()
        sw.id = 'sw-resize'
        sw.setAttribute('cx', this.selectedShape.x - 5)
        sw.setAttribute('cy', this.selectedShape.y + this.selectedShape.height + 5)
        sw.setAttribute('cursor', 'sw-resize')
        sw.addEventListener('mousedown', () => { this.startResize(this.selectedShape, 'sw') })
        sw.addEventListener('mouseup', () => { this.stopResize() })
        sw.addEventListener('click', () => { window.event.cancelBubble = true })
        this.overlayLayer.appendChild(sw)
    }

    undo() {
        this.actionPointer--
        this.lastAction = this.actionStack[this.actionPointer]
        this.lastAction.undo(this)
        console.log('action pointer after undo', this.actionPointer)
    }

    redo() {
        this.actionPointer++
        this.lastAction = this.actionStack[this.actionPointer - 1]
        this.lastAction.redo(this)
    }

    adjustResizeGadget(id, attr, value) {
        let child = document.getElementById(id)
        let val = Number(child.getAttribute(attr))
        val += value
        child.setAttribute(attr, val)
}

    onDragOver() {
        window.event.preventDefault()
    }

    onDrop() {
        window.event.preventDefault()

        let dropPos = this.getMousePosition(window.event)
        let i = 0
        let svgdraw = this
        let files = window.event.dataTransfer.files
        let len = window.event.dataTransfer.files.length
        let reader = new FileReader()
        reader.onload = function(event) {
            svgdraw.addShape(dropPos.x, dropPos.y, 32, 32, event.target.result)
            dropPos.x += 50
            dropPos.y += 50
        }
        reader.onloadend = function(event) {
            i++
            if (i < len) {                
                reader.readAsDataURL(files[i])
            }
        }

        let file = files[i]
        reader.readAsDataURL(file)
    }

    onMouseMove() {
        let mousePos = this.getMousePosition(window.event)
        let diff = { dx: mousePos.x - this.lastPos.x, dy: mousePos.y - this.lastPos.y}

        if (this.movingShape != null) {
            if (diff.dx != 0 || diff.dy != 0)
            {
                this.movingShape.x += diff.dx;
                this.movingShape.y += diff.dy;

                this.movingShape.ui.setAttribute('x', this.movingShape.x)
                this.movingShape.ui.setAttribute('y', this.movingShape.y)

                if (this.selectedShape == this.movingShape) {
                    Array.from(this.overlayLayer.children).forEach(child => {
                        let cx = Number(child.getAttribute('cx'))
                        let cy = Number(child.getAttribute('cy'))
                        cx += diff.dx
                        cy += diff.dy
                        child.setAttribute('cx', cx)
                        child.setAttribute('cy', cy)
                    })
                }
            }
        }

        if (this.resizeShape != null) {
            // handle the resize based on resizeDirection
            if (this.resizeDirection == 'nw') {
                this.resizeShape.x += diff.dx
                this.resizeShape.width -= diff.dx
                this.resizeShape.y += diff.dy
                this.resizeShape.height -= diff.dy

                let child = document.getElementById('nw-resize')
                let cx = Number(child.getAttribute('cx'))
                let cy = Number(child.getAttribute('cy'))
                cx += diff.dx
                cy += diff.dy
                child.setAttribute('cx', cx)
                child.setAttribute('cy', cy)

                this.adjustResizeGadget('sw-resize', 'cx', diff.dx)
                this.adjustResizeGadget('ne-resize', 'cy', diff.dy)
            }
            else if (this.resizeDirection == 'se') {
                this.resizeShape.width += diff.dx
                this.resizeShape.height += diff.dy

                let child = document.getElementById('se-resize')
                let cx = Number(child.getAttribute('cx'))
                let cy = Number(child.getAttribute('cy'))
                cx += diff.dx
                cy += diff.dy
                child.setAttribute('cx', cx)
                child.setAttribute('cy', cy)

                this.adjustResizeGadget('ne-resize', 'cx', diff.dx)
                this.adjustResizeGadget('sw-resize', 'cy', diff.dy)
            }
            else if (this.resizeDirection == 'ne') {
                this.resizeShape.width += diff.dx
                this.resizeShape.y += diff.dy
                this.resizeShape.height -= diff.dy

                let child = document.getElementById('ne-resize')
                let cx = Number(child.getAttribute('cx'))
                let cy = Number(child.getAttribute('cy'))
                cx += diff.dx
                cy += diff.dy
                child.setAttribute('cx', cx)
                child.setAttribute('cy', cy)

                this.adjustResizeGadget('nw-resize', 'cy', diff.dy)
                this.adjustResizeGadget('se-resize', 'cx', diff.dx)
            }
            else if (this.resizeDirection == 'sw') {
                this.resizeShape.width -= diff.dx
                this.resizeShape.x += diff.dx
                this.resizeShape.height += diff.dy

                let child = document.getElementById('sw-resize')
                let cx = Number(child.getAttribute('cx'))
                let cy = Number(child.getAttribute('cy'))
                cx += diff.dx
                cy += diff.dy
                child.setAttribute('cx', cx)
                child.setAttribute('cy', cy)

                this.adjustResizeGadget('nw-resize', 'cx', diff.dx)
                this.adjustResizeGadget('se-resize', 'cy', diff.dy)
            }

            // set the new position and size
            this.resizeShape.ui.setAttribute('x', this.resizeShape.x)
            this.resizeShape.ui.setAttribute('y', this.resizeShape.y)
            this.resizeShape.width = Math.max(this.resizeShape.width, 32)
            this.resizeShape.height = Math.max(this.resizeShape.height, 32)
            this.resizeShape.ui.setAttribute('width', this.resizeShape.width)
            this.resizeShape.ui.setAttribute('height', this.resizeShape.height)
        }

        // always keep track of the last position
        this.lastPos = mousePos
    }

    onMouseWheel() {
        window.event.preventDefault()

        // establish a smooth scaling factor
        let factor = 0.5

        if (this.scale <= factor || this.scale > 100) return

        // TODO: need to adjust to mouse position (also, add nonwheel mechanism to zoom, which means this needs to be factored out into a separate function)

        // clamp delta to -1 or 1
        let delta = 0 - window.event.deltaY / Math.abs(window.event.deltaY)

        this.scale += delta * factor

        console.log(this.scale)

        this.model.forEach(shape => {
            if (shape.scalable)
            {
                // TODO: transform could include translation too, so should factor this in
                shape.ui.setAttribute('transform', `scale(${this.scale})`)
            }
        })
    }

    onClick() {
        console.log("board clicked")
        this.selectedShape = null

        // clear out the overlayLayer
        while (this.overlayLayer.firstChild) {
            this.overlayLayer.removeChild(this.overlayLayer.lastChild)
        }
    }

    onMouseUp() {
        if (this.resizeShape != null)
        {
            this.stopResize()
        }

        if (this.movingShape != null) 
        {
            this.stopMoving()
        }
    }
}
