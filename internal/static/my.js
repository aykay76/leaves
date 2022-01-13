// import { SVGDraw } from './svgdraw.js'

// var svgdraw = new SVGDraw(document.getElementById('board'))
// svgdraw.loadModel()

// function doClear() {
//     svgdraw.resetModel()
// }

// function undo() {
//     svgdraw.undo()
// }

// function redo() {
//     svgdraw.redo()
// }

function selectMenu() {
    let content = window.event.target.getAttribute('content')
    console.log(content)

    let container = document.getElementById('content')
    while (container.firstChild) {
        container.removeChild(container.lastChild)
    }

    fetch(`/${content}.html`)
    .then(response => {
        console.log(response)
        return response.text()
    })
    .then(content => {
        console.log(content)
        let alan = document.createElement('div')
        alan.innerHTML = content
        document.getElementById('content').appendChild(alan)
    })
}

// document.getElementById('clear').addEventListener('click', () => { doClear() })
// document.getElementById('undo').addEventListener('click', () => { undo() })
// document.getElementById('redo').addEventListener('click', () => { redo() })

Array.from(document.getElementsByClassName('menuitem')).forEach(el => {
    el.addEventListener('click', () => { selectMenu() })
})
