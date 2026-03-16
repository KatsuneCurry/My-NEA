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

// ATTEMPTS TABLE
db.run(`CREATE TABLE IF NOT EXISTS quiz_attempts(
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    flashcard_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    created TEXT DEFAULT CURRENT_TIMESTAMP)`);

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
            return res.json({ success: true, userId: row.id });
        });
    });
});

// FLASHCARDS


db.run(`CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tag TEXT
)`);



// CREATE FLASHCARD
app.post('/flashcards', (req, res) => {

    const userId = parseInt(req.body.userId, 10);
    if (!userId) {
        return res.json({ success: false, message: 'Invalid user ID' });
    } 

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
    
    const userId = parseInt(req.query.userId, 10);
    if (!userId) {
        return res.json({ success: false, message: 'Invalid user ID' });
    } 

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

    const userId = parseInt(req.query.userId, 10);
    if (!userId) {
        return res.json({ success: false, message: 'Invalid user ID' });
    } 

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

//Record attempt
app.post('/quiz_attempts',(req,res) => {
    const userId = parseInt(req.body.userId, 10);
    const flashcardId = parseInt(req.body.flashcardId,10);
    const tag = req.body.tag.trim();
    const correct = req.body.correct ? 1:0;

    db.run(
        `INSERT INTO quiz_attempts(user_id,flashcard_id,tag,correct)
        VALUES(?,?,?,?)`,
        [userId,flashcardId, tag,correct],
        function(err) {
            if (err) {
                console.error(err);
                return res.json({success: false});
            }
            res.json({success: true, id:this.lastID})
        }
    )
})

// Overall accuracy
app.get('/overall_stats', (req,res) => {
    const userId = parseInt(req.query.userId, 10)
    if (!userId) return res.json({success:false, message: 'Invalid UserId'})
    
        db.get(`SELECT COUNT(*) AS attempts, SUM(correct) AS correct
            FROM quiz_attempts WHERE user_id = ?`,
        [userId],(err,row) => {
            if (err) return res.json({ success:false});
            const attempts = row?.attempts;
            const correct = row?.correct;
            const accuracy = attempts ? (correct/ attempts) * 100: 0;

            res.json({
                success: true,
                overall: {
                    attempts: attempts,
                    correct: correct,
                    accuracy: accuracy }
                });
            }
        );
});

//Tag specific accuracy
app.get('/tag_stats', (req,res) => {
    const userId = parseInt(req.query.userId,10)
    if (!userId) return res.json({success : false, message: 'Invalid UserId'});

    db.all(`SELECT tag,
        COUNT(*) AS attempts,
        SUM(correct) AS correct
        FROM quiz_attempts WHERE user_id = ?
        GROUP BY tag ORDER BY tag ASC`, [userId], (err,rows) => {if (err) return res.json({ success:false});
        
        const perTag = rows.map(row => {
            const attempts = Number(row.attempts) || 0;
            const correct = Number(row.correct) || 0;
            const accuracy = attempts ? (correct/attempts) * 100 : 0;
            return {tag: row.tag,attempts,correct,accuracy};
        });

        res.json({success: true, perTag});
    }
    );
});

//recommend tag
app.get('/recommend_tag', (req,res) => {
    const userId = parseInt(req.query.userId,10);
    if (!userId) {
        return res.json({success:false, message: 'Invalid UserId'});
    }

    db.get(
        `SELECT tag, MAX(created) AS last_answered
        FROM quiz_attempts
        WHERE user_id = ?
        GROUP BY tag
        ORDER BY last_answered ASC
        LIMIT 1`,[userId],(err,row) =>{
            if (err) {
                console.error(err)
                return res.json({success:false})
            }
            if (!row) {
                return res.json({success: false, message:'No attempts were found'})
            }
            res.json({
                success:true,
                tag: row.tag,
                created: row.last_answered
            })
        }
        
    )
})

//hours spent statistics
db.run(`CREATE TABLE IF NOT EXISTS quiz_sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    created TEXT DEFAULT CURRENT_TIMESTAMP)`);

app.post('/quiz_time', (req,res) => {
    const userId = parseInt(req.body.userId,10);
    const duration = parseInt(req.body.duration,10);

    if (!userId || !duration) {
        return res.json({ success: false, message: 'Invalid data'});
    }

    db.run(
        `INSERT INTO quiz_sessions (user_id, duration)
        VALUES (?,?)`, [userId, duration],
        function (err) {
            if (err) {
                console.error(err);
                return res.json({success: false});
            }
            res.json({success:true});
        }
    );
});

app.get('/week_durations', (req,res) => {
    const userId = parseInt(req.query.userId,10);
    if (!userId) {
        return res.json({success:false, message: 'Invalid UserId'});
    }

    const now = new Date();
    const day = now.getDay();
    const ToMonday = day === 0 ? 6 : day - 1;

    const StartMonday = new Date();
    StartMonday.setDate(now.getDate() - ToMonday);
    StartMonday.setHours(0,0,0,0);

    db.get(
        `SELECT SUM(duration) AS total_duration
        FROM quiz_sessions
        WHERE user_id =  ?
        AND created >= ?`,
        [userId,StartMonday.toISOString()],
        (err,row) => {
            if (err) {
                console.error(err);
                return res.json({success:false});
            }

            const total_duration =row?.total_duration || 0;
            res.json({
                success: true,
                total_duration
            });
        }
    )
});

// Class System
db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    class_name TEXT NOT NULL
    class_code TEXT NOT NULL UNIQUE)`);

db.run(`CREATE TABLE IF NOT EXISTS class_members (
    id INTEGER PRIMARY KEY,
    class_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(class_id,user_id)`);

function randomiseClassCode(){
    return Math.random().toString(36).slice(2,6).toUpperCase();
}

app.post('/classes', (req,res) => {
    const teacher_id = parseInt(req.body.userId,10);
    const className = String(req.body.className || '').trim();

    if (!teacher_id || !className) {
        return res.json({sucess:false, message: 'Missing Data'})
    }

    ClassCode = randomiseClassCode();

    db.run(
        `INSERT INTO classes (teacher_id, className, ClassCode) VALUES (?, ?, ?)`,
        [teacher_id,className,ClassCode],
        function (err) {
            if (err) {
                console.error(err);
                return res.json({success:false});
            }
            res.json({
                success: true, classId: this.lastID, ClassCode
            });
        }
    );
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
