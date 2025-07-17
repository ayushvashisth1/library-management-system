const loginForm = document.getElementById('login-form');
const messageBox = document.getElementById("message-display");
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;

  const storedUsersString = localStorage.getItem('registeredUsers');
  let registeredUsers = [];

  if (storedUsersString) {
    try {
      registeredUsers = JSON.parse(storedUsersString);
    } catch (e) {
      console.error("Error parsing stored user data:", e);
    }
  }

  const foundUser = registeredUsers.find(user => user.email === email && user.password === password);

  if (foundUser) {
    messageBox.textContent = "Login successful! Redirecting...";
    messageBox.classList.remove("hidden", "bg-red-500");
    messageBox.classList.add("bg-green-500");

    setTimeout(() => {
      messageBox.classList.add("hidden");
      window.location.href = 'library.html';
    }, 1500);
  } else {
    messageBox.textContent = "Invalid email or password. Please register first.";
    messageBox.classList.remove("hidden", "bg-green-500");
    messageBox.classList.add("bg-red-500");

    setTimeout(() => {
      messageBox.classList.add("hidden");
    }, 3000);
  }
});
