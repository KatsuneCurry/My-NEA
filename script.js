// Buttons, makes sure they exist before adding event listeners
const RevisaidHome = document.getElementById('RevisaidHome');
if (RevisaidHome) {
    RevisaidHome.addEventListener('click', function() {
        window.location.href = 'Home Screen.html';
    });
}

const LoginScreen = document.getElementById('LoginScreen');
if (LoginScreen) {
    LoginScreen.addEventListener('click', function() {
        window.location.href = 'Login Screen.html';
    });
}

const RegisterScreen = document.getElementById('RegisterScreen');
if (RegisterScreen) {
    RegisterScreen.addEventListener('click', function() {
        window.location.href = 'Register Screen.html';
    });
}

// Register form
const RegisterForm = document.getElementById('RegisterForm');
if (RegisterForm) {
    RegisterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const InputUsername = document.getElementById('Registerusername').value;
        const InputPassword = document.getElementById('Registerpassword').value;
        const ConfirmPassword = document.getElementById('RegisterConfirm').value;
        const InputEmail = document.getElementById('RegisterEmail').value;

        if (InputPassword === ConfirmPassword) {
            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: InputUsername,
                    password: InputPassword,
                    email: InputEmail
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful!');
                    window.location.href = 'Login Screen.html';
                } else {
                    alert('Registration failed.');
                }
            });
        } else {
            alert('Passwords do not match.');
        }
    });
}

// Login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('LoginUsername').value;
        const password = document.getElementById('LoginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Login successful!');
                window.location.href = 'Home Screen.html';
            } else {
                alert('Invalid credentials.');
            }
        });
    });
}