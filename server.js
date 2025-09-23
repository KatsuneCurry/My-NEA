const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const salt_rounds = 10;

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('./test.db');
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE
)`);

// Registration
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    bcrypt.hash(password, salt_rounds, (err, hashedPassword) => {
        if (err) return res.json({ success: false });

        db.run(
            `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
            [username, hashedPassword, email],
            function(err) {
                if (err) return res.json({ success: false });
                res.json({ success: true });
            }
        );
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err || !row) return res.json({ success: false });

        bcrypt.compare(password, row.password, (err, result) => {
            if (err || !result) {
                return res.json({ success: false });
            }
            return res.json({ success: true });
        });
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
