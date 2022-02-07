let leafstack = []
let crumbstack = []

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

        leafstack.push(newdiv)
        console.log(leafstack)

        // TODO: don't just blindly add, remove everything after this page and add
        // same as if you go back in your browser history and then click on a link
        Array.from(newdiv.getElementsByClassName('menuitem')).forEach(el => {
            el.addEventListener('click', () => { addCrumbToTrail(newdiv) })
        })
        
        newdiv.scrollIntoView({behavior: "smooth", block: 'end' })

        let spacer = document.createElement('span')
        spacer.classList.add('crumb-spacer')
        spacer.innerText = ">"
        document.getElementById('crumb-trail').appendChild(spacer)

        // TODO: keep a stack of crumbs
        // make the top crumb a link to a function that will remove everything to that point
        // then as the trail builds each crumb will remove an increasing number of leaves to revert to that point
        addCrumb(content)
    })
}

function addCrumb(content) {
    if (crumbstack.length > 0) {
        let prevcrumb = crumbstack[crumbstack.length - 1]

        let link = document.createElement('a')
        link.href = "javascript:void(0);"
        link.innerText = prevcrumb.innerText
        link.addEventListener('click', () => { removeCrumbsFromTrail() })
        prevcrumb.innerText = ""
        prevcrumb.appendChild(link)
        console.log(`Making previous crumb a link to prune the trail ${prevcrumb.innerText}`)
    }

    let crumb = document.createElement('span')
    crumb.classList.add('crumb')
    crumb.innerText = content
    document.getElementById('crumb-trail').appendChild(crumb)
    crumbstack.push(crumb)
    console.log(crumbstack)
}

function removeCrumbsFromTrail() {
    console.log('removing crumb(s) from trail')
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
addCrumb('Home')