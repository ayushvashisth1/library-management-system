let books = [
  // Defined with 'quantity' property for multiple copies
  { id: 'b001', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', quantity: 1 }, // Only 1 copy
  { id: 'b002', title: '1984', author: 'George Orwell', quantity: 5 },
  { id: 'b003', title: 'To Kill a Mockingbird', author: 'Harper Lee', quantity: 3 },
  { id: 'b004', title: 'Pride and Prejudice', author: 'Jane Austen', quantity: 2 },
  { id: 'b005', title: 'The Catcher in the Rye', author: 'J.D. Salinger', quantity: 4 },
  { id: 'b006', title: 'The Hobbit', author: 'J.R.R. Tolkien', quantity: 3 },
  { id: 'b007', title: 'Lord of the Flies', author: 'William Golding', quantity: 2 },
  { id: 'b008', title: 'Animal Farm', author: 'George Orwell', quantity: 5 },
  { id: 'b009', title: 'Brave New World', author: 'Aldous Huxley', quantity: 2 },
  { id: 'b010', title: 'The Odyssey', author: 'Homer', quantity: 3 }
];

let issuedBooks = [];
let currentUser = {
  libraryNumber: 'LIB' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  password: 'password123'
};

const contentDiv = document.getElementById('content');
const navLinks = document.querySelectorAll('.nav-link');
const searchBar = document.getElementById('searchBar');
const userOptionsBtn = document.getElementById('userOptionsBtn');
const userOptionsDropdown = document.getElementById('userOptionsDropdown');
const libraryIdDisplay = document.getElementById('libraryIdDisplay');
const changePasswordLink = document.getElementById('changePasswordLink');
const logoutLink = document.getElementById('logoutLink');
const changePasswordModal = document.getElementById('changePasswordModal');
const changePasswordForm = document.getElementById('changePasswordForm');
const passwordChangeMessage = document.getElementById('passwordChangeMessage');

const messageModal = document.getElementById('messageModal');
const messageModalTitle = document.getElementById('messageModalTitle');
const messageModalContent = document.getElementById('messageModalContent');
const messageModalConfirmBtn = document.getElementById('messageModalConfirmBtn');
const messageModalCloseBtn = document.getElementById('messageModalCloseBtn');

// --- Helper functions for localStorage ---
function saveBooksToLocalStorage() {
  localStorage.setItem('libraryBooks', JSON.stringify(books));
}

function loadBooksFromLocalStorage() {
  const storedBooks = localStorage.getItem('libraryBooks');
  if (storedBooks) {
    try {
      // Load and ensure 'quantity' is a number and add 'quantity: 1' if missing (for old data)
      const parsedBooks = JSON.parse(storedBooks);
      books = parsedBooks.map(book => ({
        ...book,
        // If book.quantity exists and is a number, use it.
        // Otherwise, if book.available exists (from old data), use 1 if true, 0 if false.
        // Default to 1 if neither quantity nor available is explicitly set (fallback for very old/corrupt data)
        quantity: typeof book.quantity === 'number' ? book.quantity : (typeof book.available === 'boolean' ? (book.available ? 1 : 0) : 1)
      }));
    } catch (e) {
      console.error("Error parsing stored books data:", e);
      // If parsing fails, revert to default books and save them to prevent further issues
      saveBooksToLocalStorage();
    }
  } else {
    // If no data exists, save the initial default books to localStorage
    saveBooksToLocalStorage();
  }
}

function saveIssuedBooksToLocalStorage() {
  localStorage.setItem('libraryIssuedBooks', JSON.stringify(issuedBooks));
}

function loadIssuedBooksFromLocalStorage() {
  const storedIssuedBooks = localStorage.getItem('libraryIssuedBooks');
  if (storedIssuedBooks) {
    try {
      issuedBooks = JSON.parse(storedIssuedBooks);
    } catch (e) {
      console.error("Error parsing stored issued books data:", e);
      // If parsing fails, clear issuedBooks and save to prevent further issues
      issuedBooks = [];
      saveIssuedBooksToLocalStorage();
    }
  } else {
    // If no data exists, initialize as empty and save
    issuedBooks = [];
    saveIssuedBooksToLocalStorage();
  }
}
// --- End Helper functions ---


function showMessageModal(title, content, isConfirm = false) {
  return new Promise((resolve) => {
    messageModalTitle.textContent = title;
    messageModalContent.textContent = content;
    messageModalConfirmBtn.onclick = () => {
      closeModal('messageModal');
      resolve(true);
    };
    messageModalCloseBtn.onclick = () => {
      closeModal('messageModal');
      resolve(false);
    };
    if (isConfirm) {
      messageModalConfirmBtn.classList.remove('hidden');
    } else {
      messageModalConfirmBtn.classList.add('hidden');
    }
    messageModal.classList.remove('hidden');
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function updateActiveNav(sectionId) {
  navLinks.forEach(link => {
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function renderDashboard() {
  updateActiveNav('dashboard');
  // Calculate total available copies across all books
  const totalAvailableCopies = books.reduce((sum, book) => sum + book.quantity, 0);

  contentDiv.innerHTML = `
    <div class="card p-6">
      <h2 class="text-3xl font-bold text-blue-700 mb-4">Welcome to My Library!</h2>
      <p class="text-lg text-gray-700 mb-6">Your unique Library ID is: <span class="font-semibold text-blue-600">${currentUser.libraryNumber}</span></p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-blue-100 p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold text-blue-800 mb-2">Total Unique Books</h3>
          <p class="text-3xl font-bold text-blue-900">${books.length}</p>
        </div>
        <div class="bg-green-100 p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold text-green-800 mb-2">Total Copies Available</h3>
          <p class="text-3xl font-bold text-green-900">${totalAvailableCopies}</p>
        </div>
        <div class="bg-yellow-100 p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold text-yellow-800 mb-2">Issued Books (You)</h3>
          <p class="text-3xl font-bold text-yellow-900">${issuedBooks.filter(item => item.userId === currentUser.libraryNumber).length}</p>
        </div>
      </div>
      <p class="mt-8 text-gray-600">Use the navigation bar above to explore books, manage your issued items, and update your profile.</p>
    </div>
  `;
}

function renderBooks(searchTerm = '') {
  updateActiveNav('books');
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );
  contentDiv.innerHTML = `
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">All Books</h2>
      <div id="booksList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filteredBooks.length > 0 ? filteredBooks.map(book => `
          <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">${book.title}</h3>
              <p class="text-sm text-gray-600 mb-3">by ${book.author}</p>
              <p class="text-sm text-gray-700">Copies Available: <strong class="font-bold">${book.quantity}</strong></p>
            </div>
            ${book.quantity > 0 ? `
              <button onclick="issueBook('${book.id}')" class="btn-primary mt-4 w-full">Issue Book</button>
            ` : `
              <button class="btn-secondary mt-4 w-full cursor-not-allowed opacity-70" disabled>No Copies Available</button>
            `}
          </div>
        `).join('') : '<p class="text-gray-600">No books found matching your search.</p>'}
      </div>
    </div>
  `;
}

function renderMyIssuedBooks() {
  updateActiveNav('myIssuedBooks');
  const userIssuedBooks = issuedBooks.filter(item => item.userId === currentUser.libraryNumber);
  contentDiv.innerHTML = `
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">My Issued Books</h2>
      <div id="myIssuedBooksList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${userIssuedBooks.length > 0 ? userIssuedBooks.map(item => {
          const book = books.find(b => b.id === item.bookId);
          return book ? `
            <div class="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-semibold text-blue-900 mb-1">${book.title}</h3>
                <p class="text-sm text-gray-600 mb-2">by ${book.author}</p>
                <p class="text-sm text-gray-500">Issued On: <strong>${item.issueDate}</strong></p>
                ${item.returnDate ? `<p class="text-sm text-gray-700">Due Date: <strong class="text-red-600">${item.returnDate}</strong></p>` : ''}
              </div>
              <button onclick="returnBook('${book.id}')" class="btn-danger mt-4 w-full">Return Book</button>
            </div>
          ` : '';
        }).join('') : '<p class="text-gray-600">You have not issued any books yet.</p>'}
      </div>
    </div>
  `;
}

function renderFine() {
  updateActiveNav('fine');
  contentDiv.innerHTML = `
    <div class="card p-6">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">Fine Details</h2>
      <p class="text-lg text-gray-700 mb-4">Currently, there are no outstanding fines on your account.</p>
      <p class="text-gray-600">Fines may be incurred for overdue books. Please return books on time to avoid charges.</p>
    </div>
  `;
}

async function issueBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) {
    await showMessageModal('Error', 'Book not found.');
    return;
  }
  // Check if any copies are available based on quantity
  if (book.quantity <= 0) {
    await showMessageModal('Info', `"${book.title}" currently has no copies available.`);
    return;
  }

  // Check user's maximum issued book limit (4 books)
  const userIssuedBooksCount = issuedBooks.filter(item => item.userId === currentUser.libraryNumber).length;
  const MAX_ISSUED_BOOKS = 4;

  if (userIssuedBooksCount >= MAX_ISSUED_BOOKS) {
    await showMessageModal('Limit Reached', `You have already issued the maximum of ${MAX_ISSUED_BOOKS} books. Please return a book before issuing another one.`);
    return;
  }

  // A user can issue multiple copies of the same book, if available and if their global limit allows.
  // The 'alreadyIssued' check (for one copy per user per title) has been removed to allow this.

  const confirmed = await showMessageModal('Confirm Issue', `Are you sure you want to issue "${book.title}"?`, true);
  if (confirmed) {
    book.quantity--; // Decrement the quantity of the book
    const issueDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(issueDate.getDate() + 14); // Set return date 14 days from now

    issuedBooks.push({
      bookId: book.id,
      userId: currentUser.libraryNumber,
      issueDate: issueDate.toISOString().slice(0, 10), // Format YYYY-MM-DD
      returnDate: returnDate.toISOString().slice(0, 10) // Format YYYY-MM-DD
    });

    saveBooksToLocalStorage(); // Save updated books array
    saveIssuedBooksToLocalStorage(); // Save updated issuedBooks array
    await showMessageModal('Success', `"${book.title}" has been successfully issued to you! Please return it by ${returnDate.toISOString().slice(0, 10)} to avoid fines.`);
    renderBooks(searchBar.value); // Re-render books list to show updated availability without changing page
  }
}

async function returnBook(bookId) {
  const book = books.find(b => b.id === bookId);
  // Find only one instance of the book issued by the current user to return
  const issuedIndex = issuedBooks.findIndex(item => item.bookId === bookId && item.userId === currentUser.libraryNumber);

  if (!book || issuedIndex === -1) {
    await showMessageModal('Error', 'Book not found or not issued to you.');
    return;
  }
  const confirmed = await showMessageModal('Confirm Return', `Are you sure you want to return "${book.title}"?`, true);
  if (confirmed) {
    book.quantity++; // Increment the quantity of the book
    issuedBooks.splice(issuedIndex, 1); // Remove only one issued instance
    saveBooksToLocalStorage(); // Save updated books array
    saveIssuedBooksToLocalStorage(); // Save updated issuedBooks array
    await showMessageModal('Success', `"${book.title}" has been successfully returned!`);
    renderMyIssuedBooks(); // Re-render the list of issued books (if on that page)
    renderBooks(searchBar.value); // Re-render main books list for general overview (if on that page)
  }
}

async function handleChangePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  passwordChangeMessage.textContent = ''; // Clear previous messages

  const storedUserString = localStorage.getItem('registeredUser');
  let registeredUser = null;

  if (storedUserString) {
    try {
      registeredUser = JSON.parse(storedUserString);
    } catch (e) {
      console.error("Error parsing stored user data:", e);
      passwordChangeMessage.textContent = 'Error: Could not retrieve user data.';
      passwordChangeMessage.classList.remove('text-green-600');
      passwordChangeMessage.classList.add('text-red-600');
      return;
    }
  } else {
    passwordChangeMessage.textContent = 'No registered user found. Please register first.';
    passwordChangeMessage.classList.remove('text-green-600');
    passwordChangeMessage.classList.add('text-red-600');
    return;
  }

  if (currentPassword !== registeredUser.password) {
    passwordChangeMessage.textContent = 'Incorrect current password.';
    passwordChangeMessage.classList.remove('text-green-600');
    passwordChangeMessage.classList.add('text-red-600');
    return;
  }
  if (newPassword.length < 6) {
    passwordChangeMessage.textContent = 'New password must be at least 6 characters long.';
    passwordChangeMessage.classList.remove('text-green-600');
    passwordChangeMessage.classList.add('text-red-600');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    passwordChangeMessage.textContent = 'New password and confirm password do not match.';
    passwordChangeMessage.classList.remove('text-green-600');
    passwordChangeMessage.classList.add('text-red-600');
    return;
  }

  // Update password in the stored user object and current user object
  registeredUser.password = newPassword;
  localStorage.setItem('registeredUser', JSON.stringify(registeredUser));
  currentUser.password = newPassword; // Also update the in-memory current user object

  passwordChangeMessage.textContent = 'Password changed successfully!';
  passwordChangeMessage.classList.remove('text-red-600');
  passwordChangeMessage.classList.add('text-green-600');

  // Automatically close modal and clear message after a short delay
  setTimeout(() => {
    closeModal('changePasswordModal');
    passwordChangeMessage.textContent = '';
    changePasswordForm.reset(); // Clear form fields
  }, 1500);
}

async function handleLogout() {
  const confirmed = await showMessageModal('Confirm Logout', 'Are you sure you want to log out?', true);
  if (confirmed) {
    // Redirect to login page
    window.location.href = 'login.html';
  }
}

// --- Event Listeners ---
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = e.target.dataset.section;
    if (section === 'dashboard') renderDashboard();
    else if (section === 'books') renderBooks(searchBar.value);
    else if (section === 'myIssuedBooks') renderMyIssuedBooks();
    else if (section === 'fine') renderFine();
  });
});

searchBar.addEventListener('input', () => {
  // Only re-render books if the 'Books' section is currently active
  if (document.querySelector('.nav-link.active').dataset.section === 'books') {
    renderBooks(searchBar.value);
  }
});

userOptionsBtn.addEventListener('click', () => {
  userOptionsDropdown.classList.toggle('hidden');
});

// Close user options dropdown if clicked outside
document.addEventListener('click', (event) => {
  if (!userOptionsBtn.contains(event.target) && !userOptionsDropdown.contains(event.target)) {
    userOptionsDropdown.classList.add('hidden');
  }
});

changePasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  userOptionsDropdown.classList.add('hidden'); // Close dropdown first
  openModal('changePasswordModal');
});

logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  userOptionsDropdown.classList.add('hidden'); // Close dropdown first
  handleLogout();
});

changePasswordForm.addEventListener('submit', handleChangePassword);

// Initial load: This runs once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // IMPORTANT: If you just updated the initial 'books' array,
  // and are seeing old quantities, clear localStorage in your browser's
  // developer tools (Application -> Local Storage -> your_file_origin -> libraryBooks/libraryIssuedBooks)
  // or temporarily uncomment the lines below for a full reset.
  // localStorage.removeItem('libraryBooks');
  // localStorage.removeItem('libraryIssuedBooks');
  // localStorage.removeItem('registeredUser'); // If you want to reset the user too

  loadBooksFromLocalStorage();
  loadIssuedBooksFromLocalStorage();

  // Load or initialize currentUser based on registeredUser in localStorage
  const storedUserString = localStorage.getItem('registeredUser');
  if (storedUserString) {
    try {
      const registeredUser = JSON.parse(storedUserString);
      currentUser.password = registeredUser.password;
      currentUser.libraryNumber = registeredUser.libraryNumber;
    } catch (e) {
      console.error("Error parsing stored user data on load:", e);
      // Fallback: If user data is corrupted, might want to regenerate or prompt for login
      localStorage.removeItem('registeredUser'); // Remove corrupt data
      currentUser.libraryNumber = 'LIB' + Math.random().toString(36).substring(2, 10).toUpperCase();
      currentUser.password = 'password123';
      localStorage.setItem('registeredUser', JSON.stringify(currentUser));
    }
  } else {
    // If no registered user, save the currently generated user to localStorage
    localStorage.setItem('registeredUser', JSON.stringify(currentUser));
  }

  // Display the user's library ID
  libraryIdDisplay.textContent = currentUser.libraryNumber;
  // Render the initial dashboard view
  renderDashboard();
});