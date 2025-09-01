const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve HTML, JS, CSS

// Connect to SQLite database
const db = new sqlite3.Database('./test.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE
)`);

// Registration endpoint
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    db.run(
        `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
        [username, password, email],
        function(err) {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        }
    );
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(
        `SELECT * FROM users WHERE username = ? AND password = ?`,
        [username, password],
        (err, row) => {
            if (row) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        }
    );
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));