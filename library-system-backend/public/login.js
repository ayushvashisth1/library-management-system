// public/login.js
const loginForm = document.getElementById('login-form');
const messageBox = document.getElementById("message-display");
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

loginForm.addEventListener('submit', async function(event) { // Added 'async' keyword here
    event.preventDefault(); // Prevent default form submission

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        // Send login credentials to your backend API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Tell the server we're sending JSON
            },
            body: JSON.stringify({ email, password }) // Convert credentials to JSON string
        });

        const data = await response.json(); // Parse the JSON response from the server

        if (response.ok) { // Check if the response status is 2xx (e.g., 200)
            messageBox.textContent = data.message || "Login successful! Redirecting...";
            messageBox.classList.remove("hidden", "bg-red-500");
            messageBox.classList.add("bg-green-500"); // Green for success

            setTimeout(() => {
                messageBox.classList.add("hidden");
                window.location.href = 'library.html'; // Redirect to library page on success
            }, 1500); // Wait 1.5 seconds before redirecting
        } else {
            // Handle invalid credentials or other login errors from backend
            messageBox.textContent = data.message || "Login failed. Invalid email or password.";
            messageBox.classList.remove("hidden", "bg-green-500");
            messageBox.classList.add("bg-red-500"); // Red for error

            setTimeout(() => {
                messageBox.classList.add("hidden");
            }, 3000); // Hide error message after 3 seconds
        }
    } catch (error) {
        // Handle network errors
        console.error("Network error during login:", error);
        messageBox.textContent = "Network error. Please check your internet connection or try again later.";
        messageBox.classList.remove("hidden", "bg-green-500");
        messageBox.classList.add("bg-red-500");
        setTimeout(() => {
            messageBox.classList.add("hidden");
        }, 3000);
    }
});