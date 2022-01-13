// An action is created in response to actions performed by the user and encapsulates
// all information required to undo and redo that action
export class Action {
    constructor() {
        this.shape = null
        this.action = null
        this.oldState = {}
        this.newState = {}
    }
    
    redo(svgdraw) {
        if (this.action == 'resize') {
            this.shape.x = this.newState.x
            this.shape.y = this.newState.y
            this.shape.width = this.newState.width
            this.shape.height = this.newState.height
            this.shape.ui.setAttribute('x', this.newState.x)
            this.shape.ui.setAttribute('y', this.newState.y)
            this.shape.ui.setAttribute('width', this.newState.width)
            this.shape.ui.setAttribute('height', this.newState.height)

            svgdraw.selectShape(this.shape)
        }
    }

    undo(svgdraw) {
        if (this.action == 'resize') {
            this.shape.x = this.oldState.x
            this.shape.y = this.oldState.y
            this.shape.width = this.oldState.width
            this.shape.height = this.oldState.height
            this.shape.ui.setAttribute('x', this.oldState.x)
            this.shape.ui.setAttribute('y', this.oldState.y)
            this.shape.ui.setAttribute('width', this.oldState.width)
            this.shape.ui.setAttribute('height', this.oldState.height)
            
            svgdraw.selectShape(this.shape)
        }
    }
}