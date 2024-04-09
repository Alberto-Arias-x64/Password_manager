window.addEventListener('load', main)

function main() {
    const token = window.localStorage.getItem('token')
    const logOut = document.querySelector('#logOut')

    logOut.addEventListener('click', logOutFn)

    if (token) console.log('sisas')
    else window.location.href = '/'
}



async function generatePassword() {
    return await window.fetch('/api/generate',)
        .catch(() => notyf.error('In this whe have problems, try again'))
        .then(res => res.json())
        .then(res => {
            notyf.success('password generated')
            return res.password
        })
}

function validateToken(token) {

}

function logOutFn() {
    window.localStorage.clear()
    window.location.href = '/'
}