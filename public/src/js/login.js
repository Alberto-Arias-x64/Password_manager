window.addEventListener('load', main)
const notyf = new Notyf({ position: { x: 'center', y: 'bottom' }, types: [{ type: 'success', background: '#44ab96' }] });

function main() {
    if (window.localStorage.getItem('token')) window.location.href = '/dashboard'
    const loginForm = document.querySelector('#login_form')
    const createForm = document.querySelector('#create_form')
    const noAccount = document.querySelector('#no_account')
    const haveAccount = document.querySelector('#have_account')

    loginForm.addEventListener('submit', login)
    createForm.addEventListener('submit', create)
    noAccount.addEventListener('click', changeForm)
    haveAccount.addEventListener('click', changeForm)
}

function login(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const values = {}
    values.user = form.get('user')
    values.password = form.get('password')

    if (!values.user || !values.password) return notyf.error('Please fill all fields')
    window.fetch('/api/sign-in', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' }
    })
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                notyf.success('Login correct')
                window.localStorage.setItem('token', res.token)
                window.location.href = '/dashboard'
            } else notyf.error('Check your data')
        })

}

function create(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const passwordField = document.querySelectorAll('input[name=password]')[1]
    const confirmPasswordField = document.querySelector('input[name=confirmPassword]')
    const values = {}
    values.user = form.get('user')
    values.password = form.get('password')
    values.confirmPassword = form.get('confirmPassword')

    if (!values.user || !values.password || !values.confirmPassword) return notyf.error('Please fill all fields')
    if (values.password !== values.confirmPassword) {
        passwordField.classList.add('PW-input-error')
        confirmPasswordField.classList.add('PW-input-error')
        return notyf.error('The passwords no match')
    }
    window.fetch('/api/sign-up', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' }
    })
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                window.localStorage.setItem('token', res.token)
                window.location.href = '/dashboard'
            } else notyf.error('Account already exist')
        })

}

function changeForm() {
    const loginForm = document.querySelector('#login_form')
    const createForm = document.querySelector('#create_form')
    loginForm.reset()
    createForm.reset()
    loginForm.classList.toggle('PW-hide')
    createForm.classList.toggle('PW-hide')
}