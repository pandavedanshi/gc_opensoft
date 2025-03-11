import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


function App() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '', rating: '' });
  const [filter, setFilter] = useState({ genre: '', rating: '' });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    fetchBooks();
  }, [page, filter]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/books`, {
        params: { ...filter, page, limit: 10 },
      });
      setBooks(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books. Please try again.');
    }
  };

  const handleInputChange = (event) => {
    setNewBook({ ...newBook, [event.target.name]: event.target.value });
  };

  const handleFilterChange = (event) => {
    setFilter({ ...filter, [event.target.name]: event.target.value });
    setPage(1);
  };

  const addBook = async () => {
    setError('');
    if (!newBook.title || !newBook.author || !newBook.genre) {
      setError('Title, author, and genre are required.');
      return;
    }
    const rating = parseFloat(newBook.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      setError('Rating must be a number between 1 and 5.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/books`, newBook);
      setNewBook({ title: '', author: '', genre: '', rating: '' });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Failed to add book. Please try again.');
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/books/${id}`);
      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete book. Please try again.');
    }
  };

  return (
    <div className="app-container">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="shape"></div>
      ))}
      <h1>Book Library</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Add Book</h2>
      <div className="add-book">
        <input type="text" name="title" placeholder="Title" value={newBook.title} onChange={handleInputChange} />
        <input type="text" name="author" placeholder="Author" value={newBook.author} onChange={handleInputChange} />
        <input type="text" name="genre" placeholder="Genre" value={newBook.genre} onChange={handleInputChange} />
        <input type="number" name="rating" placeholder="Rating (1-5)" value={newBook.rating} onChange={handleInputChange} min="1" max="5" />
        <button onClick={addBook}>Add Book</button>
      </div>

      <h2>Books</h2>
      <div className="books">
        <input type="text" name="genre" placeholder="Filter by Genre" value={filter.genre} onChange={handleFilterChange} />
        <input type="number" name="rating" placeholder="Filter by Rating" value={filter.rating} onChange={handleFilterChange} min="1" max="5" />
      </div>
      <ul>
        <div className="delete-button">
        {books.map((book) => (
          <li key={book.id}>
            {book.title} by {book.author} 
            <button onClick={() => deleteBook(book.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
          </li>
        ))}
        </div>
      </ul>
      <div className="next-button">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
      
    </div>
  );
}

export default App;
