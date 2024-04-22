window.addEventListener('load', main)
const notyf = new Notyf({ position: { x: 'center', y: 'bottom' }, types: [{ type: 'success', background: '#44ab96' }] });

function main() {
    const token = window.localStorage.getItem('token')
    const logOut = document.querySelector('#logOut')
    const generate = document.querySelector('#generate')
    const passwordForm = document.querySelector('#password_form')
    const addButton = document.querySelector('#PW-add')
    const close = document.querySelector('.PW-modal-close')

    logOut.addEventListener('click', logOutFn)
    generate.addEventListener('click', generatePassword)
    passwordForm.addEventListener('submit', newPassword)
    addButton.addEventListener('click', () => showModal(0))
    close.addEventListener('click', closeModal)

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
    const template = `<article id="${data.id}" data-id="${UUID}" class="PW-dashboard-card"><div class="PW-dashboard-input"><img src="/src/images/icons/globe-outline.svg" alt="site"><h3>${data.site}</h3></div><hr><div class="PW-dashboard-card-data"><div class="PW-dashboard-input-extended"><img src="/src/images/icons/person-outline.svg" alt="user"><p>${data.user}</p><img src="/src/images/icons/copy-outline.svg" class="PW-copy-user" alt="copy"></div><hr><div class="PW-dashboard-input-extended"><img src="/src/images/icons/key-outline.svg" alt="password"><p>********</p><img src="/src/images/icons/copy-outline.svg" data-pw="${data.password}" class="PW-copy-password" alt="copy"></div></div><button class="PW-actions">Actions</button><div class="PW-dashboard-card-buttons PW-hide"><button type="button" class="PW-delete red">Delete</button><button type="button" class="PW-edit">Edit</button></div></article>`
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
                const actionButtons = document.querySelectorAll('.PW-actions')
                const deleteButtons = document.querySelectorAll('.PW-delete')
                const editButtons = document.querySelectorAll('.PW-edit')
                copyUserButtons.forEach(element => {
                    element.addEventListener('click', () => {
                        const text = element.parentElement.childNodes.item(1).textContent
                        navigator.clipboard.writeText(text)
                        notyf.success('User copied')
                    })
                })
                copyPasswordButtons.forEach(element => {
                    element.addEventListener('click', () => {
                        const text = element.dataset.pw
                        navigator.clipboard.writeText(text)
                        notyf.success('Password copied')
                    })
                })
                actionButtons.forEach(element => {
                    const brother = element.nextElementSibling
                    element.addEventListener('click', () => {
                        element.classList.add('PW-hide')
                        brother.classList.remove('PW-hide')
                    })
                    brother.addEventListener('mouseleave', () => {
                        element.classList.remove('PW-hide')
                        brother.classList.add('PW-hide')
                    })
                })
                deleteButtons.forEach(element => {
                    element.addEventListener('click', () => {
                        const id = element.parentElement.parentElement.id
                        if (!id) notyf.error('In this whe have problems, try again')
                        const values = { id }
                        if (window.confirm('Are you sure?')) {
                            window.fetch('/api/password', {
                                method: 'DELETE',
                                body: JSON.stringify(values),
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                            })
                                .catch(() => notyf.error('In this whe have problems, try again'))
                                .then(res => res.json())
                                .then(res => {
                                    if (res.success) {
                                        notyf.success('Account deleted')
                                        getList()
                                    } else notyf.error('Account not deleted')
                                })
                        }
                    })
                })
                editButtons.forEach(element => {
                    const id = element.parentElement.parentElement.id
                    const site = element.parentElement.parentElement.children[0].children[1].textContent
                    const user = element.parentElement.parentElement.children[2].children[0].children[1].textContent
                    const password = element.parentElement.parentElement.children[2].children[2].children[2].dataset.pw
                    element.addEventListener('click', () => showModal(id, site, user, password))
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

function showModal(id = 0, site = '', user = '', password = '') {
    const modal = document.querySelector('.PW-modal')
    const formId = document.querySelector('[name=id]')
    const formSite = document.querySelector('[name=site]')
    const formUser = document.querySelector('[name=user]')
    const formPassword = document.querySelector('[name=password]')
    const text = document.querySelector('#sendForm')
    modal.style.display = 'flex'
    formId.value = id
    formSite.value = site
    formUser.value = user
    formPassword.value = password
    if (id == 0) text.textContent = 'Create'
    else text.textContent = 'Update'
}

function closeModal() {
    const modal = document.querySelector('.PW-modal')
    modal.style.display = 'none'
}

function newPassword(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const values = {}
    values.id = form.get('id')
    values.site = form.get('site')
    values.user = form.get('user')
    values.password = form.get('password')

    if (!values.user || !values.password || !values.site) return notyf.error('Please fill all fields')
    const token = window.localStorage.getItem('token')

    if (values.id == 0) {
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
                    closeModal()
                    getList()
                } else notyf.error('Account already exist')
            })
    } else {
        window.fetch('/api/password', {
            method: 'PATCH',
            body: JSON.stringify(values),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
            .catch(() => notyf.error('In this whe have problems, try again'))
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    e.target.reset()
                    notyf.success('Account Updated')
                    closeModal()
                    getList()
                } else notyf.error('Account have a problem')
            })
    }
}

function logOutFn() {
    window.localStorage.clear()
    window.location.href = '/'
}