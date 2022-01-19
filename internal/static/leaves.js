function addToBreadcrumb() {
    // TODO: make crumb text an attribute
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
    .then(html => {
        let newdiv = document.createElement('div')
        newdiv.classList.add('leaf')
        newdiv.style.width = window.innerWidth + 'px'
        newdiv.style.height = (window.innerHeight - 30) + 'px'
        newdiv.innerHTML = html
        document.getElementById('leaf-container').appendChild(newdiv)

        Array.from(newdiv.getElementsByClassName('menuitem')).forEach(el => {
            el.addEventListener('click', () => { addToBreadcrumb() })
        })
        
        newdiv.scrollIntoView({behavior: "smooth", block: 'end' })

        // TODO: check if not first crumb, add separator
        let crumb = document.createElement('span')
        crumb.classList.add('crumb')
        crumb.innerText = content
        document.getElementById('crumb-trail').appendChild(crumb)
    })
}

Array.from(document.getElementsByClassName('menuitem')).forEach(el => {
    el.addEventListener('click', () => { addToBreadcrumb() })
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

document.getElementById('leaf-container').style.height = (window.innerHeight - 30) + 'px'
