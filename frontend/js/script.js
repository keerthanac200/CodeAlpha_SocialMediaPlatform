const API_URL = "http://localhost:5000/api/auth";

// Elements
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

// Switch to Login
loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginMessage.textContent = "";
    registerMessage.textContent = "";
});

// Switch to Register
registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    loginMessage.textContent = "";
    registerMessage.textContent = "";
});

// Register
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    registerMessage.textContent = "Creating account...";

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            registerMessage.textContent = data.message;

            registerForm.reset();

            setTimeout(() => {
                loginTab.click();
            }, 1000);

        } else {
            registerMessage.textContent = data.message;
        }

    } catch (error) {
        registerMessage.textContent =
            "Unable to connect to the server.";
    }
});

// Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginMessage.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);

            loginMessage.textContent = "Login successful!";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        } else {
            loginMessage.textContent = data.message;
        }

    } catch (error) {
        loginMessage.textContent =
            "Unable to connect to the server.";
    }
});