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

    let container = document.getElementById('mainleaf')
    while (container.firstChild) {
        container.removeChild(container.lastChild)
    }

    fetch(`/${content}`)
    .then(response => {
        return response.text()
    })
    .then(content => {
        let newdiv = document.createElement('div')
        newdiv.classList.add('leaf')
        newdiv.style.width = (window.innerWidth - 150) + 'px'
        newdiv.style.height = '100%'
        newdiv.innerHTML = content
        document.getElementById('mainleaf').appendChild(newdiv)

        Array.from(newdiv.getElementsByTagName('a')).forEach(el => {
            el.addEventListener('click', () => { clickLeaf() })
        })
    })
}

function clickLeaf() {
    window.event.cancelBubble = true

    console.dir(document.getElementById('mainleaf'))
    let width = document.getElementById('mainleaf').clientWidth
    console.log(width)

    let href = window.event.target.getAttribute('content')
    fetch(`/${href}`)
    .then(response => {
        return response.text()
    })
    .then(content => {
        let newdiv = document.createElement('div')
        newdiv.classList.add('leaf')
        newdiv.style.width = (window.innerWidth - 100) + 'px'
        newdiv.style.height = '100%'
        newdiv.innerHTML = content
        document.getElementById('mainleaf').appendChild(newdiv)
    })
}

// document.getElementById('clear').addEventListener('click', () => { doClear() })
// document.getElementById('undo').addEventListener('click', () => { undo() })
// document.getElementById('redo').addEventListener('click', () => { redo() })

Array.from(document.getElementsByClassName('menuitem')).forEach(el => {
    el.addEventListener('click', () => { selectMenu() })
})

window.addEventListener('resize', () => {
    console.log(window.innerWidth)
    Array.from(document.getElementsByClassName('leaf')).forEach(el => {
        el.setAttribute('width', window.innerWidth)
    })
}, true)