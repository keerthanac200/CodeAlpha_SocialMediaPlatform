const token = localStorage.getItem("token");
function getCurrentUserId() {
    const payload = JSON.parse(
        atob(token.split(".")[1])
    );

    return payload.id;
}

// Protect dashboard
if (!token) {
    window.location.href = "index.html";
}


// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location.href = "index.html";

});


// Character counter
const postContent = document.getElementById("postContent");
const characterCount = document.getElementById("characterCount");

postContent.addEventListener("input", () => {

    const length = postContent.value.length;

    characterCount.textContent = `${length} / 500`;

});


// Create post
const createPostBtn = document.getElementById("createPostBtn");
const postMessage = document.getElementById("postMessage");

createPostBtn.addEventListener("click", async () => {

    const content = postContent.value.trim();

    if (!content) {
        postMessage.textContent = "Please write something first.";
        return;
    }

    postMessage.textContent = "Posting...";

    try {

        const response = await fetch(
            "http://localhost:5000/api/posts",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    content: content
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            postMessage.textContent = data.message;

            postContent.value = "";

            characterCount.textContent = "0 / 500";

            loadPosts();

        } else {

            postMessage.textContent = data.message;
        }

    } catch (error) {

        console.error(error);

        postMessage.textContent =
            "Unable to connect to the server.";
    }
});


// Load posts
async function loadPosts() {

    const postsContainer =
        document.getElementById("postsContainer");

    try {

        const response = await fetch(
            "http://localhost:5000/api/posts",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const posts = await response.json();

        if (!response.ok) {
            postsContainer.innerHTML =
                `<p class="empty-message">${posts.message}</p>`;

            return;
        }

        if (posts.length === 0) {

            postsContainer.innerHTML = `
                <p class="empty-message">
                    No posts yet. Be the first to post!
                </p>
            `;

            return;
        }

        postsContainer.innerHTML = posts.map(post => `
            <article class="post-card">

                <div class="post-header">
                    <strong>${escapeHTML(post.email)}</strong>

                    ${
                        post.userId === getCurrentUserId()
                            ? `
                                <div class="post-actions">
                                    <button onclick="editPost(${post.id})">
                                        ✏️ Edit
                                    </button>

                                    <button onclick="deletePost(${post.id})">
                                        🗑️ Delete
                                    </button>
                                </div>
                             `
                            : ""
                    }
                </div>

                <p class="post-content">
                    ${escapeHTML(post.content)}
                </p>

                <div class="post-footer">

                    <button
                        class="like-btn"
                        onclick="toggleLike(${post.id})"
                    >
                        ❤️ ${post.likes.length}
                    </button>

                    <span>
                        💬 ${post.comments.length}
                    </span>

                </div>

                <div class="comments-section">

                    <div class="comments-list">

                        ${
                            post.comments.length === 0
                                ? `<p class="no-comments">No comments yet.</p>`
                                : post.comments.map(comment => `
                                    <div class="comment">
                                        <strong>${escapeHTML(comment.email)}</strong>
                                        <p>${escapeHTML(comment.text)}</p>
                                    </div>
                                `).join("")
                        }

                    </div>

                    <div class="comment-input">

                        <input
                            type="text"
                            id="comment-${post.id}"
                            placeholder="Write a comment..."
                            maxlength="300"
                        >

                        <button
                            onclick="addComment(${post.id})"
                        >
                            Comment
                        </button>

                    </div>

                </div>

            </article>
        `).join("");

    } catch (error) {

        console.error(error);

        postsContainer.innerHTML = `
            <p class="empty-message">
                Unable to load posts.
            </p>
        `;
    }
}


// Prevent HTML injection
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Load posts when dashboard opens
loadPosts();
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const postCards = document.querySelectorAll(".post-card");

    postCards.forEach(card => {
        const postText = card
            .querySelector(".post-content")
            .textContent
            .toLowerCase();

        const userText = card
            .querySelector(".post-header strong")
            .textContent
            .toLowerCase();

        if (
            postText.includes(searchTerm) ||
            userText.includes(searchTerm)
        ) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});
// Like / Unlike post
async function toggleLike(postId) {

    try {

        const response = await fetch(
            `http://localhost:5000/api/posts/${postId}/like`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (response.ok) {
            loadPosts();
        } else {
            alert(data.message);
        }

    } catch (error) {

        console.error(error);

        alert("Unable to like the post.");
    }
}
// Add comment
async function addComment(postId) {

    const input = document.getElementById(
        `comment-${postId}`
    );

    const text = input.value.trim();

    if (!text) {
        alert("Please write a comment.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/posts/${postId}/comment`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    text: text
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            input.value = "";

            loadPosts();

        } else {

            alert(data.message);
        }

    } catch (error) {

        console.error(error);

        alert("Unable to add comment.");
    }
}
// Edit post
async function editPost(postId) {
    const newContent = prompt("Edit your post:");

    if (newContent === null) {
        return;
    }

    const content = newContent.trim();

    if (!content) {
        alert("Post content cannot be empty.");
        return;
    }

    if (content.length > 500) {
        alert("Post cannot exceed 500 characters.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/posts/${postId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Post updated successfully!");
            loadPosts();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to edit the post.");
    }
}


// Delete post
async function deletePost(postId) {
    const confirmed = confirm(
        "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/posts/${postId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Post deleted successfully!");
            loadPosts();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to delete the post.");
    }
}
// Load users to follow
async function loadUsers() {
    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/users",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const users = await response.json();

        if (!response.ok) {
            console.error(users.message);
            return;
        }

        const currentUserId = getCurrentUserId();

        const usersContainer =
            document.getElementById("usersContainer");

        const otherUsers = users.filter(
            user => user.id !== currentUserId
        );

        if (otherUsers.length === 0) {
            usersContainer.innerHTML = `
                <p class="empty-message">
                    No other users available yet.
                </p>
            `;
            return;
        }

        usersContainer.innerHTML = otherUsers.map(user => `
            <div class="user-card">

                <div class="user-info">
                    <div class="user-avatar">👤</div>

                    <div>
                        <strong>${escapeHTML(user.name)}</strong>
                        <p>${escapeHTML(user.email)}</p>
                    </div>
                </div>

                <button
                    class="follow-btn"
                    onclick="toggleFollow(${user.id}, this)"
                >
                    ${
                        user.following
                            ? "Following"
                            : "Follow"
                    }
                </button>

            </div>
        `).join("");

    } catch (error) {
        console.error(error);
    }
}


// Follow / Unfollow user
async function toggleFollow(userId, button) {

    const isFollowing =
        button.textContent.trim() === "Following";

    const action = isFollowing
        ? "unfollow"
        : "follow";

    try {
        const response = await fetch(
            `http://localhost:5000/api/auth/users/${userId}/${action}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (response.ok) {

            button.textContent =
                isFollowing
                    ? "Follow"
                    : "Following";

            button.classList.toggle(
                "following",
                !isFollowing
            );

        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to update follow status.");
    }
}


// Load users when dashboard opens
loadUsers();

