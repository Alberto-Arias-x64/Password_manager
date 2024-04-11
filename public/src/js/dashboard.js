window.addEventListener('load', main)
const notyf = new Notyf({ position: { x: 'center', y: 'bottom' } });

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

    getList()
}

function getList() {
    const token = window.localStorage.getItem('token')
    window.fetch('/api/password', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                notyf.success('Loaded data!!!')
                console.log(res.data)
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
            } else notyf.error('Account already exist')
        })
}

function logOutFn() {
    window.localStorage.clear()
    window.location.href = '/'
}