const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const salt_rounds = 10;

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Redirect to login screen when website is first accessed
app.get('/', (req, res) => {
    res.redirect('/Screens/Login Screen.html');
});

// SINGLE DATABASE
const db = new sqlite3.Database('./test.db');

// USERS TABLE
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

// FLASHCARDS
const DEMO_ID = 1; // temporary user id

db.run(`CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tag TEXT
)`);

// CREATE FLASHCARD
app.post('/flashcards', (req, res) => {
    const userId = DEMO_ID;
    const { question, answer, tag } = req.body;

    db.run(
        `INSERT INTO flashcards (user_id, question, answer, tag)
         VALUES (?, ?, ?, ?)`,
        [userId, question, answer, tag],
        function(err) {
            if (err) {
                console.error(err);
                return res.json({ success: false });
            }
            res.json({
                success: true,
                id: this.lastID
            });
        }
    );
});

// DELETE FLASHCARD
app.delete('/flashcards/:id', (req, res) => {
    const userId = DEMO_ID;
    const cardId = req.params.id;

    db.run(
        `DELETE FROM flashcards WHERE id = ? AND user_id = ?`,
        [cardId, userId],
        function(err) {
            if (err) {
                console.error(err);
                return res.json({ success: false });
            }
            if (this.changes === 0) {
                return res.json({ success: false, message: 'no card deleted' });
            }
            res.json({ success: true });
        }
    );
});

// READ FLASHCARDS
app.get('/flashcards', (req, res) => {
    const userId = DEMO_ID;

    db.all(
        `SELECT id, question, answer, tag FROM flashcards WHERE user_id = ?`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.json({ success: false });
            }
            res.json({ success: true, flashcards: rows });
        }
    );
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));