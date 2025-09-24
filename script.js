// Buttons makes sure they exist before adding event listeners
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

const QuizScreen = document.getElementById('QuizScreen');
if (QuizScreen) {
    QuizScreen.addEventListener('click', function() {
        window.location.href = 'Quiz Screen.html';
    });
}

const Flashcards = document.getElementById('Flashcards');
if (Flashcards) {
    Flashcards.addEventListener('click', function() {
        window.location.href = 'Flashcards.html';
    });
}

const ClassScreen = document.getElementById('ClassScreen');
if (ClassScreen) {
    ClassScreen.addEventListener('click', function() {
        window.location.href = 'Class Screen.html';
    });
}

const AnalyticsScreen = document.getElementById('AnalyticsScreen');
if (AnalyticsScreen) {
    AnalyticsScreen.addEventListener('click', function() {
        window.location.href = 'Analytics Screen.html';
    });
}

const SettingsScreen = document.getElementById('SettingsScreen');
if (SettingsScreen) {
    SettingsScreen.addEventListener('click', function() {
        window.location.href = 'Settings Screen.html';
    });
}

// Register form
const RegisterForm = document.getElementById('RegisterForm');

if (RegisterForm) {
    RegisterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const InputUsername = document.getElementById('Registerusername').value.trim();
        const InputPassword = document.getElementById('Registerpassword').value;
        const ConfirmPassword = document.getElementById('RegisterConfirm').value;
        const InputEmail = document.getElementById('RegisterEmail').value.trim();

        // Password requirements
        const Count = InputPassword.length;
        const Capital = /[A-Z]/.test(InputPassword);                        
        const Number = /\d/.test(InputPassword);

        if (Count >= 8 && Capital && Number) {
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
        } else {
            alert('Password must be at least 8 characters long, contain a capital letter, and a number.');
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
