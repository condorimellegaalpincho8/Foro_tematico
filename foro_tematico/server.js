const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const JWT_SECRET = "your_jwt_secret"; // Replace with an environment variable in production

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "foro_tematico"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection error: ", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

// Route to register a user
app.post("/register", async (req, res) => {
    const { username, password, role = "user" } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        db.query(query, [username, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "User registration failed" });
            }
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Route to login a user
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, role: user.role });
    });
});

// Route to create a new forum post (requires authentication)
app.post("/create-post", (req, res) => {
    const { token, title, content } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        console.log("Decoded token:", decoded);

        const query = "INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)";
        db.query(query, [userId, title, content], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to create post" });
            }
            res.status(201).json({ message: "Post created successfully" });
        });
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// Route to get all posts
app.get("/posts", (req, res) => {
    const query = "SELECT * FROM forum_posts";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch posts" });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
