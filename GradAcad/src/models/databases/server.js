import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql'; 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gradacad',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send({ success: false, message: 'Internal server error' });
        } else if (results.length > 0) {
            const user = results[0]; // Use the first result as the user object
            res.json({
                success: true, 
                user: {
                    id: user.id,           // User ID from database
                    name: user.name,       // User's Name
                    username: user.username // Username
                }
            });
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
