const token = localStorage.getItem("token");

// Protect profile page
if (!token) {
    window.location.href = "index.html";
}


// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location.href = "index.html";

});


// Load profile
async function loadProfile() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            localStorage.removeItem("token");

            window.location.href = "index.html";

            return;
        }

        document.getElementById("profileName")
            .textContent = data.name;

        document.getElementById("profileEmail")
            .textContent = data.email;

        loadProfileStats(data.id);

    } catch (error) {

        console.error(error);

        alert("Unable to load profile.");
    }
}


// Load profile statistics
async function loadProfileStats(userId) {

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

        const userPosts = posts.filter(
            post => post.userId === userId
        );

        const totalLikes = userPosts.reduce(
            (total, post) => total + post.likes.length,
            0
        );

        document.getElementById("postCount")
            .textContent = userPosts.length;

        document.getElementById("likeCount")
            .textContent = totalLikes;

    } catch (error) {

        console.error(error);
    }
}


loadProfile();