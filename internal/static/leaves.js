function selectMenu() {
    let content = window.event.target.getAttribute('content')
    let replace = window.event.target.getAttribute('replace')

    // if there is an attribute set to replace the content we will remove all leaves
    if (replace) {
        let container = document.getElementById('leaf-container')
        while (container.firstChild) {
            container.removeChild(container.lastChild)
        }
    }

    fetch(`/${content}`)
    .then(response => {
        return response.text()
    })
    .then(content => {
        let newdiv = document.createElement('div')
        newdiv.classList.add('leaf')
        newdiv.style.width = window.innerWidth + 'px'
        newdiv.innerHTML = content
        document.getElementById('leaf-container').appendChild(newdiv)

        Array.from(newdiv.getElementsByTagName('a')).forEach(el => {
            el.addEventListener('click', () => { selectMenu() })
        })

        newdiv.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
    })
}

Array.from(document.getElementsByClassName('menuitem')).forEach(el => {
    el.addEventListener('click', () => { selectMenu() })
})

window.addEventListener('resize', () => {
    console.log(window.innerWidth)
    Array.from(document.getElementsByClassName('leaf')).forEach(el => {
        el.style.width = window.innerWidth + 'px'
    })
}, true)

Array.from(document.getElementsByClassName('leaf')).forEach(el => {
    el.style.width = window.innerWidth + 'px'
})
