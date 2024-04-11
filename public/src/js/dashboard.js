window.addEventListener('load', main)
const notyf = new Notyf({ position: { x: 'center', y: 'bottom' }, types: [{ type: 'success', background: '#44ab96' }] });

function main() {
    const token = window.localStorage.getItem('token')
    const logOut = document.querySelector('#logOut')
    const generate = document.querySelector('#generate')
    const passwordForm = document.querySelector('#password_form')

    logOut.addEventListener('click', logOutFn)
    generate.addEventListener('click', generatePassword)
    passwordForm.addEventListener('submit', newPassword)

    if (token) validateToken(token)
    else window.location.href = '/'
}

function uuid() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
    return id
}

function generateTemplate(data) {
    const UUID = uuid()
    const template = `<article id="${UUID}" class="PW-dashboard-card"><div class="PW-dashboard-input"><img src="/src/images/icons/globe-outline.svg" alt="site"><h3>${data.site}</h3></div><hr><div class="PW-dashboard-card-data"><div class="PW-dashboard-input-extended"><img src="/src/images/icons/person-outline.svg" alt="user"><p>${data.user}</p><img src="/src/images/icons/copy-outline.svg" class="PW-copy-user" alt="copy"></div><hr><div class="PW-dashboard-input-extended"><img src="/src/images/icons/key-outline.svg" alt="password"><p>********</p><img src="/src/images/icons/copy-outline.svg" data-pw="${data.password}" class="PW-copy-password" alt="copy"></div></div><button>Actions</button><div class="PW-dashboard-card-buttons PW-hide"><button type="button" class="red">Delete</button><button type="button">Edit</button></div></article>`
    return template
}

function getList() {
    const cardsContainer = document.querySelector('#cards')
    const token = window.localStorage.getItem('token')
    window.fetch('/api/password', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                const cards = res.data.map(element => generateTemplate(element))
                cardsContainer.innerHTML = ''
                cardsContainer.insertAdjacentHTML('beforeend', cards.join(',').replace(/\,/gm, ''))
                const copyUserButtons = document.querySelectorAll('.PW-copy-user')
                const copyPasswordButtons = document.querySelectorAll('.PW-copy-password')
                copyUserButtons.forEach(element => {
                    element.addEventListener('click', (e) => {
                        const text = e.target.parentElement.childNodes.item(1).textContent
                        navigator.clipboard.writeText(text)
                        notyf.success('User copied')
                    })
                })
                copyPasswordButtons.forEach(element => {
                    element.addEventListener('click', (e) => {
                        const text = e.target.dataset.pw
                        navigator.clipboard.writeText(text)
                        notyf.success('Password copied')
                    })
                })
            } else {
                window.localStorage.clear()
                window.location.href = '/'
            }
        })
}

function generatePassword() {
    const passwordInput = document.querySelector('input[name=password]')
    window.fetch('/api/generate',)
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            notyf.success('password generated')
            passwordInput.value = res.password
        })
}

function validateToken(token) {
    window.fetch('/api/validate', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .catch(() => {
            window.localStorage.clear()
            window.location.href = '/'
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                notyf.success('Loggin success')
                getList()
            } else {
                window.localStorage.clear()
                window.location.href = '/'
            }
        })
}

function newPassword(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const values = {}
    values.site = form.get('site')
    values.user = form.get('user')
    values.password = form.get('password')

    if (!values.user || !values.password || !values.site) return notyf.error('Please fill all fields')
    const token = window.localStorage.getItem('token')
    window.fetch('/api/password', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    })
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                e.target.reset()
                notyf.success('Account saved')
                getList()
            } else notyf.error('Account already exist')
        })
}

function logOutFn() {
    window.localStorage.clear()
    window.location.href = '/'
}