const form = document.getElementById('registration-form');
const messageBox = document.getElementById("message-display");
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    messageBox.textContent = "Please fill in all required fields and fix any errors.";
    messageBox.classList.remove("hidden", "bg-green-500");
    messageBox.classList.add("bg-red-500");
    setTimeout(() => {
      messageBox.classList.add("hidden");
    }, 3000);
    return;
  }

  const newUser = {
    email: regEmailInput.value,
    password: regPasswordInput.value
  };

  let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

  const existingUserIndex = users.findIndex(user => user.email === newUser.email);

  if (existingUserIndex > -1) {
    users[existingUserIndex].password = newUser.password;
    messageBox.textContent = "Account updated successfully! Redirecting...";
  } else {
    users.push(newUser);
    messageBox.textContent = "Registration successful! Redirecting...";
  }

  localStorage.setItem('registeredUsers', JSON.stringify(users));

  messageBox.classList.remove("hidden", "bg-red-500");
  messageBox.classList.add("bg-green-500");

  form.reset();

  setTimeout(() => {
    messageBox.classList.add("hidden");
    window.location.href = 'login.html';
  }, 2000);
});
