document.getElementById('RevisaidHome').addEventListener('click', function() {
    window.location.href = 'Home Screen.html';
});
document.getElementById('LoginScreen').addEventListener('click', function() {
    window.location.href = 'Login Screen.html';
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple check (replace with real authentication for production)
    if (username === 'user' && password === 'pass') {
        alert('Login successful!');
        window.location.href = 'Home Screen.html';
    } else {
        alert('Invalid credentials.');
    }
});