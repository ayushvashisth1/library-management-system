// public/register.js
const form = document.getElementById('registration-form');
const messageBox = document.getElementById("message-display");

form.addEventListener('submit', async function(event) { // Added 'async' keyword here
    event.preventDefault(); // Prevent default form submission

    // Client-side form validation check
    if (!form.checkValidity()) {
        messageBox.textContent = "Please fill in all required fields and fix any errors.";
        messageBox.classList.remove("hidden", "bg-green-500");
        messageBox.classList.add("bg-red-500");
        setTimeout(() => {
            messageBox.classList.add("hidden");
        }, 3000);
        return; // Stop execution if form is invalid
    }

    // Collect all form data
    const newUser = {
        fullName: document.getElementById('reg-fullname').value,
        fatherName: document.getElementById('reg-fathername').value,
        mobile: document.getElementById('reg-mobile').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        collegeName: document.getElementById('reg-college-name').value,
        enrollmentNumber: document.getElementById('reg-enrollment-number').value,
        branch: document.getElementById('reg-branch').value,
        year: document.getElementById('reg-year').value,
        dob: document.getElementById('reg-dob').value,
        gender: document.getElementById('reg-gender').value,
        address: document.getElementById('reg-address').value,
        // reg-photo is handled separately for file uploads (later)
        securityQuestion: document.getElementById('reg-security-question').value,
        securityAnswer: document.getElementById('reg-security-answer').value
    };

    try {
        // Send the registration data to your backend API
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Tell the server we're sending JSON
            },
            body: JSON.stringify(newUser) // Convert JavaScript object to JSON string
        });

        const data = await response.json(); // Parse the JSON response from the server

        if (response.ok) { // Check if the response status is 2xx (e.g., 200, 201)
            messageBox.textContent = data.message || "Registration successful! Redirecting...";
            messageBox.classList.remove("hidden", "bg-red-500");
            messageBox.classList.add("bg-green-500"); // Green for success
            form.reset(); // Clear the form
            setTimeout(() => {
                messageBox.classList.add("hidden");
                window.location.href = 'login.html'; // Redirect to login page
            }, 2000); // Wait 2 seconds before redirecting
        } else {
            // Handle server-side errors (e.g., duplicate email, validation errors from backend)
            messageBox.textContent = data.message || "Registration failed. Please try again.";
            messageBox.classList.remove("hidden", "bg-green-500");
            messageBox.classList.add("bg-red-500"); // Red for error
            setTimeout(() => {
                messageBox.classList.add("hidden");
            }, 3000); // Hide error message after 3 seconds
        }
    } catch (error) {
        // Handle network errors (e.g., server not reachable)
        console.error("Network error during registration:", error);
        messageBox.textContent = "Network error. Please check your internet connection or try again later.";
        messageBox.classList.remove("hidden", "bg-green-500");
        messageBox.classList.add("bg-red-500");
        setTimeout(() => {
            messageBox.classList.add("hidden");
        }, 3000);
    }
});