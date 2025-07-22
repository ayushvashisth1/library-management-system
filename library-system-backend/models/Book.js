// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({ // Changed to 'bookSchema' (lowercase 'b') for consistency
    id: {
        type: String,
        required: true,
        unique: true // Ensure book IDs are unique
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0 // Default to 0 if not provided, or 1 if you want initial quantities to always be 1
                   // I'd recommend 0 here, as the initialBooks array sets the quantity.
    }
});

// Assign the model to a variable FIRST
const Book = mongoose.model('Book', bookSchema);

// Then export that variable
module.exports = Book;