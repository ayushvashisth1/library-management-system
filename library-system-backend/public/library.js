// public/library.js

// ... (keep currentUser, contentDiv, navLinks etc. declarations) ...

// Initialize books and issuedBooks (they will be populated from backend/client-side storage)
let books = []; // Will be populated from the backend
let issuedBooks = []; // This will still be client-side for now, for simplicity
                     // A full system would manage issued books via a backend API/DB

// ... (keep all constant declarations like messageModal, changePasswordModal etc.) ...

// --- Helper functions for localStorage (DELETE THEM ALL, including the save/load ones!) ---
// Example: DELETE THIS SECTION (only keeping showMessageModal, openModal, closeModal)
// function saveBooksToLocalStorage() { /* ... */ }
// function loadBooksFromLocalStorage() { /* ... */ }
// ...

// ... (keep showMessageModal, openModal, closeModal functions) ...

// Update renderDashboard to fetch total unique books and total copies from backend
async function renderDashboard() { // Make this async
    updateActiveNav('dashboard');
    let totalUniqueBooks = 0;
    let totalAvailableCopies = 0;

    try {
        const response = await fetch('/api/books');
        if (response.ok) {
            const fetchedBooks = await response.json();
            totalUniqueBooks = fetchedBooks.length;
            totalAvailableCopies = fetchedBooks.reduce((sum, book) => sum + book.quantity, 0);
            books = fetchedBooks; // Update the client-side 'books' array
        } else {
            console.error('Failed to fetch books for dashboard:', response.statusText);
            showMessageModal('Error', 'Could not load book data for dashboard.');
        }
    } catch (error) {
        console.error('Network error fetching books for dashboard:', error);
        showMessageModal('Error', 'Network error. Could not load book data.');
    }

    // ... (rest of renderDashboard HTML with updated variables) ...
    contentDiv.innerHTML = `
        <div class="card p-6">
            <h2 class="text-3xl font-bold text-blue-700 mb-4">Welcome to My Library!</h2>
            <p class="text-lg text-gray-700 mb-6">Your unique Library ID is: <span class="font-semibold text-blue-600">${currentUser.libraryNumber}</span></p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-blue-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold text-blue-800 mb-2">Total Unique Books</h3>
                    <p class="text-3xl font-bold text-blue-900">${totalUniqueBooks}</p>
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


// Update renderBooks to fetch books from backend
async function renderBooks(searchTerm = '') { // Make this async
    updateActiveNav('books');
    let fetchedBooks = [];
    try {
        const response = await fetch('/api/books');
        if (response.ok) {
            fetchedBooks = await response.json();
            books = fetchedBooks; // Update the client-side 'books' array
        } else {
            console.error('Failed to fetch books:', response.statusText);
            await showMessageModal('Error', 'Could not load books from the server.');
        }
    } catch (error) {
        console.error('Network error fetching books:', error);
        await showMessageModal('Error', 'Network error. Please check your connection.');
        return; // Exit if books cannot be fetched
    }

    const filteredBooks = fetchedBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // ... (rest of renderBooks HTML remains largely the same, using filteredBooks) ...
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

// Update issueBook to interact with backend
async function issueBook(bookId) {
    // Find the book in the client-side 'books' array for display purposes
    const book = books.find(b => b.id === bookId);
    if (!book) {
        await showMessageModal('Error', 'Book not found locally. Try refreshing.');
        return;
    }

    // Frontend check for quantity
    if (book.quantity <= 0) {
        await showMessageModal('Info', `"${book.title}" currently has no copies available.`);
        return;
    }

    // Frontend check for user's maximum issued book limit (still client-side for this example)
    const userIssuedBooksCount = issuedBooks.filter(item => item.userId === currentUser.libraryNumber).length;
    const MAX_ISSUED_BOOKS = 4;

    if (userIssuedBooksCount >= MAX_ISSUED_BOOKS) {
        await showMessageModal('Limit Reached', `You have already issued the maximum of ${MAX_ISSUED_BOOKS} books. Please return a book before issuing another one.`);
        return;
    }

    const confirmed = await showMessageModal('Confirm Issue', `Are you sure you want to issue "${book.title}"?`, true);
    if (confirmed) {
        try {
            const response = await fetch('/api/books/issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId: book.id, userId: currentUser.libraryNumber })
            });

            const data = await response.json();
            if (response.ok) {
                // Update client-side quantity directly or re-fetch to ensure sync
                // For simplicity, we'll directly update and then re-render
                // A more robust solution would receive the updated book object from backend
                book.quantity--; // Decrement local quantity

                const issueDate = new Date();
                const returnDate = new Date();
                returnDate.setDate(issueDate.getDate() + 14); // Set return date 14 days from now

                // Add to client-side issuedBooks array (for now)
                issuedBooks.push({
                    bookId: book.id,
                    userId: currentUser.libraryNumber,
                    issueDate: issueDate.toISOString().slice(0, 10),
                    returnDate: returnDate.toISOString().slice(0, 10)
                });
                // saveIssuedBooksToLocalStorage(); // Removed, but in real app, if you save this, save it!

                await showMessageModal('Success', data.message || `"${book.title}" has been successfully issued!`);
                renderBooks(searchBar.value); // Re-render books list to show updated availability
            } else {
                await showMessageModal('Error', data.message || `Failed to issue "${book.title}".`);
            }
        } catch (error) {
            console.error('Network error during issue:', error);
            await showMessageModal('Error', 'Network error. Could not issue book.');
        }
    }
}


// Update returnBook to interact with backend
async function returnBook(bookId) {
    const book = books.find(b => b.id === bookId);
    // Find only one instance of the book issued by the current user to return (client-side)
    const issuedIndex = issuedBooks.findIndex(item => item.bookId === bookId && item.userId === currentUser.libraryNumber);

    if (!book || issuedIndex === -1) {
        await showMessageModal('Error', 'Book not found or not issued to you.');
        return;
    }

    const confirmed = await showMessageModal('Confirm Return', `Are you sure you want to return "${book.title}"?`, true);
    if (confirmed) {
        try {
            const response = await fetch('/api/books/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId: book.id, userId: currentUser.libraryNumber })
            });

            const data = await response.json();
            if (response.ok) {
                // Update client-side quantity directly or re-fetch to ensure sync
                book.quantity++; // Increment local quantity
                issuedBooks.splice(issuedIndex, 1); // Remove from client-side issuedBooks array
                // saveIssuedBooksToLocalStorage(); // Removed

                await showMessageModal('Success', data.message || `"${book.title}" has been successfully returned!`);
                renderMyIssuedBooks(); // Re-render the list of issued books
                renderBooks(searchBar.value); // Re-render main books list for general overview
            } else {
                await showMessageModal('Error', data.message || `Failed to return "${book.title}".`);
            }
        } catch (error) {
            console.error('Network error during return:', error);
            await showMessageModal('Error', 'Network error. Could not return book.');
        }
    }
}

// Keep handleChangePassword as is for now, as it still relies on localStorage 'registeredUser'

// Keep handleLogout as is

// --- Event Listeners ---
// Keep as is, but ensure render functions are async-aware
navLinks.forEach(link => {
    link.addEventListener('click', async (e) => { // Make event listener async
        e.preventDefault();
        const section = e.target.dataset.section;
        if (section === 'dashboard') await renderDashboard(); // Await
        else if (section === 'books') await renderBooks(searchBar.value); // Await
        else if (section === 'myIssuedBooks') await renderMyIssuedBooks(); // Await
        else if (section === 'fine') renderFine();
    });
});

searchBar.addEventListener('input', async () => { // Make event listener async
    // Only re-render books if the 'Books' section is currently active
    if (document.querySelector('.nav-link.active').dataset.section === 'books') {
        await renderBooks(searchBar.value); // Await
    }
});

// ... (rest of event listeners remain mostly the same) ...

// Initial load: This runs once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => { // Make DOMContentLoaded async
    // Remove localStorage.removeItem calls for books and issued books
    // Keep currentUser loading from localStorage for now
    const storedUserString = localStorage.getItem('registeredUser');
    if (storedUserString) {
        try {
            const registeredUser = JSON.parse(storedUserString);
            currentUser.password = registeredUser.password;
            currentUser.libraryNumber = registeredUser.libraryNumber;
        } catch (e) {
            console.error("Error parsing stored user data on load:", e);
            localStorage.removeItem('registeredUser');
            currentUser.libraryNumber = 'LIB' + Math.random().toString(36).substring(2, 10).toUpperCase();
            currentUser.password = 'password123';
            localStorage.setItem('registeredUser', JSON.stringify(currentUser));
        }
    } else {
        localStorage.setItem('registeredUser', JSON.stringify(currentUser));
    }

    libraryIdDisplay.textContent = currentUser.libraryNumber;
    await renderDashboard(); // Await the initial dashboard render
    // Note: issuedBooks is still client-side, it will be empty on initial load
    // You would load it from backend if you had an IssuedBook model
});