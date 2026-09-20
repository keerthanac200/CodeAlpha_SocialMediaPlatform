const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const router = express.Router();

const USERS_FILE = "./users.json";
const JWT_SECRET = "codealpha_secret_key";

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);

        fs.writeFileSync(
            USERS_FILE,
            JSON.stringify(users, null, 2)
        );

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

        const user = users.find(
            user => user.email === email
        );

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
});

// Get current user profile
router.get("/profile", async (req, res) => {

    try {

        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        jwt.verify(token, JWT_SECRET, (error, user) => {

            if (error) {
                return res.status(403).json({
                    message: "Invalid or expired token"
                });
            }

            const users = JSON.parse(
                fs.readFileSync(USERS_FILE, "utf8")
            );

            const currentUser = users.find(
                item => item.id === user.id
            );

            if (!currentUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json({
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email
            });

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// Follow a user
router.post("/users/:id/follow", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = jwt.verify(token, JWT_SECRET);

        const users = JSON.parse(
            fs.readFileSync(USERS_FILE, "utf8")
        );

        const targetUserId = Number(req.params.id);

        const user = users.find(
            user => user.id === currentUser.id
        );

        const targetUser = users.find(
            user => user.id === targetUserId
        );

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.id === targetUser.id) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        // Make sure arrays exist
        user.following = user.following || [];
        targetUser.followers = targetUser.followers || [];

        if (user.following.includes(targetUserId)) {
            return res.status(400).json({
                message: "Already following this user"
            });
        }

        user.following.push(targetUserId);
        targetUser.followers.push(user.id);

        fs.writeFileSync(
            USERS_FILE,
            JSON.stringify(users, null, 2)
        );

        res.json({
            message: "User followed successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});


// Unfollow a user
router.post("/users/:id/unfollow", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = jwt.verify(token, JWT_SECRET);

        const users = JSON.parse(
            fs.readFileSync(USERS_FILE, "utf8")
        );

        const targetUserId = Number(req.params.id);

        const user = users.find(
            user => user.id === currentUser.id
        );

        const targetUser = users.find(
            user => user.id === targetUserId
        );

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.following = user.following || [];
        targetUser.followers = targetUser.followers || [];

        user.following = user.following.filter(
            id => id !== targetUserId
        );

        targetUser.followers = targetUser.followers.filter(
            id => id !== user.id
        );

        fs.writeFileSync(
            USERS_FILE,
            JSON.stringify(users, null, 2)
        );

        res.json({
            message: "User unfollowed successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});

// Get all users
router.get("/users", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const currentUser = jwt.verify(token, JWT_SECRET);

        const users = JSON.parse(
            fs.readFileSync(USERS_FILE, "utf8")
        );

        const userList = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            following: (user.followers || []).includes(
                currentUser.id
            )
        }));

        res.json(userList);

    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});
module.exports = router;