function addCrumbToTrail() {
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
            el.addEventListener('click', () => { addCrumbToTrail() })
        })
        
        newdiv.scrollIntoView({behavior: "smooth", block: 'end' })

        let spacer = document.createElement('span')
        spacer.classList.add('crumb-spacer')
        spacer.innerText = ">"
        document.getElementById('crumb-trail').appendChild(spacer)

        // TODO: keep a stack of crumbs
        // make the top crumb a link to a function that will remove everything to that point
        // then as the trail builds each crumb will remove an increasing number of leaves to revert to that point

        let crumb = document.createElement('span')
        crumb.classList.add('crumb')
        crumb.innerText = content
        document.getElementById('crumb-trail').appendChild(crumb)
    })
}

function removeCrumbsFromTrail() {

}

Array.from(document.getElementsByClassName('menuitem')).forEach(el => {
    el.addEventListener('click', () => { addCrumbToTrail() })
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
