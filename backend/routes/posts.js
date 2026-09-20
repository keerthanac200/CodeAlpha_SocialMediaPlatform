const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const POSTS_FILE = "./posts.json";
const JWT_SECRET = "codealpha_secret_key";

// Authentication middleware
function authenticateToken(req, res, next) {
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

        req.user = user;

        next();
    });
}


// Create a post
router.post("/", authenticateToken, (req, res) => {

    try {

        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content cannot be empty"
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                message: "Post cannot exceed 500 characters"
            });
        }

        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        const newPost = {
            id: Date.now(),
            userId: req.user.id,
            email: req.user.email,
            content: content.trim(),
            likes: [],
            comments: [],
            createdAt: new Date().toISOString()
        };

        posts.unshift(newPost);

        fs.writeFileSync(
            POSTS_FILE,
            JSON.stringify(posts, null, 2)
        );

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// Get all posts
router.get("/", authenticateToken, (req, res) => {

    try {

        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        res.json(posts);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});
// Like / Unlike a post
router.post("/:id/like", authenticateToken, (req, res) => {

    try {

        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        const post = posts.find(
            post => post.id === Number(req.params.id)
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {

            post.likes = post.likes.filter(
                id => id !== userId
            );

        } else {

            post.likes.push(userId);

        }

        fs.writeFileSync(
            POSTS_FILE,
            JSON.stringify(posts, null, 2)
        );

        res.json({
            message: alreadyLiked
                ? "Post unliked"
                : "Post liked",
            likes: post.likes.length
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// Add a comment to a post
router.post("/:id/comment", authenticateToken, (req, res) => {

    try {

        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        if (text.length > 300) {
            return res.status(400).json({
                message: "Comment cannot exceed 300 characters"
            });
        }

        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        const post = posts.find(
            post => post.id === Number(req.params.id)
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = {
            id: Date.now(),
            userId: req.user.id,
            email: req.user.email,
            text: text.trim(),
            createdAt: new Date().toISOString()
        };

        post.comments.push(comment);

        fs.writeFileSync(
            POSTS_FILE,
            JSON.stringify(posts, null, 2)
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// Edit own post
router.put("/:id", authenticateToken, (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Post content cannot be empty"
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                message: "Post cannot exceed 500 characters"
            });
        }

        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        const post = posts.find(
            post => post.id === Number(req.params.id)
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Only the post owner can edit it
        if (post.userId !== req.user.id) {
            return res.status(403).json({
                message: "You can only edit your own posts"
            });
        }

        post.content = content.trim();

        fs.writeFileSync(
            POSTS_FILE,
            JSON.stringify(posts, null, 2)
        );

        res.json({
            message: "Post updated successfully",
            post
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// Delete own post
router.delete("/:id", authenticateToken, (req, res) => {
    try {
        const posts = JSON.parse(
            fs.readFileSync(POSTS_FILE, "utf8")
        );

        const postIndex = posts.findIndex(
            post => post.id === Number(req.params.id)
        );

        if (postIndex === -1) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const post = posts[postIndex];

        // Only the post owner can delete it
        if (post.userId !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own posts"
            });
        }

        posts.splice(postIndex, 1);

        fs.writeFileSync(
            POSTS_FILE,
            JSON.stringify(posts, null, 2)
        );

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;