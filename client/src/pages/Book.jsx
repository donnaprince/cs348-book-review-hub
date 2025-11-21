import React, { useEffect, useState } from "react";
import "../styles/Books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ genre: "", minRating: "", maxRating: "" });
  const [formData, setFormData] = useState({ title: "", author: "", genre_id: "", rating: "" });
  const [editingId, setEditingId] = useState(null);
  const [banner, setBanner] = useState("");
  const [newGenre, setNewGenre] = useState(""); 

  const API_BASE = "http://localhost:5050";

  const fetchBooks = async (customFilters = filters) => {
    try {
      let query = [];
      if (customFilters.genre) query.push(`genre=${customFilters.genre}`);
      if (customFilters.minRating) query.push(`minRating=${customFilters.minRating}`);
      if (customFilters.maxRating) query.push(`maxRating=${customFilters.maxRating}`);

      const res = await fetch(`${API_BASE}/api/books?${query.join("&")}`);
      if (!res.ok) throw new Error("Failed to fetch books");

      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBanner("⚠️ Error fetching books. Please try again later.");
    }
  };

  // --- Fetch genres from backend ---
  const fetchGenres = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/genres`);
      if (!res.ok) throw new Error("Failed to fetch genres");
      const data = await res.json();
      setGenres(data);
    } catch (err) {
      console.error("Error fetching genres:", err);
      setBanner("⚠️ Error loading genres. Please refresh.");
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchBooks();
  }, []);

  // --- Add new genre ---
  const handleAddGenre = async () => {
    if (!newGenre.trim()) {
      setBanner("⚠️ Genre name cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/genres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGenre }),
      });
      const data = await res.json();

      if (!res.ok) {
        setBanner(`⚠️ ${data.error || "Failed to add genre."}`);
        return;
      }

      setBanner(`✅ Genre '${data.name}' added successfully!`);
      setNewGenre("");
      fetchGenres(); // refresh dropdown immediately
    } catch (err) {
      console.error("Error adding genre:", err);
      setBanner("⚠️ Failed to add genre. Please try again.");
    }
  };

  // --- Add / update book ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner("");

    const ratingNum = parseFloat(formData.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      setBanner("🚫 Rating must be between 0 and 5.");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_BASE}/api/books/${editingId}` : `${API_BASE}/api/books`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit form");

      setFormData({ title: "", author: "", genre_id: "", rating: "" });
      setEditingId(null);
      setBanner(editingId ? "✅ Book updated successfully!" : "✅ Book added successfully!");
      fetchBooks();
    } catch (err) {
      console.error("Error submitting form:", err);
      setBanner("⚠️ Failed to save book. Please try again.");
    }
  };

  // --- Delete a book ---
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");
      setBanner("🗑️ Book deleted successfully.");
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
      setBanner("⚠️ Error deleting book. Please try again.");
    }
  };

  // --- Edit an existing book ---
  const handleEdit = (book) => {
    setEditingId(book.book_id);
    setFormData({
      title: book.title,
      author: book.author,
      genre_id: book.genre_id,
      rating: book.rating,
    });
    setBanner("✏️ Editing mode: Update the fields and click 'Update'.");
  };

  // --- Clear filters ---
  const clearFilters = () => {
    const resetFilters = { genre: "", minRating: "", maxRating: "" };
    setFilters(resetFilters);
    fetchBooks(resetFilters);
    setBanner("🔄 Filters cleared. Showing all books.");
  };

  return (
    <div className="container">
      <h2>📚 Book Review Hub</h2>

      {/* -------- Banner Section -------- */}
      {banner && <div className="banner">{banner}</div>}

      {/* -------- Add Genre Section -------- */}
      <div className="add-genre">
        <h4>Add New Genre</h4>
        <input
          type="text"
          placeholder="Enter genre name"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
        />
        <button onClick={handleAddGenre}>Add Genre</button>
      </div>

      {/* -------- Filter Section -------- */}
      <div className="filter-section">
        <select
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Rating"
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Rating"
          value={filters.maxRating}
          onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
        />
        <button onClick={() => fetchBooks()}>Filter</button>
        <button onClick={clearFilters} className="clear-btn">Clear Filters</button>
      </div>

      {/* -------- Add / Edit Form -------- */}
      <form className="book-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
        <select
          value={formData.genre_id}
          onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
          required
        >
          <option value="">Select Genre</option>
          {genres.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.1"
          placeholder="Rating (0–5)"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          required
        />
        <button type="submit" className={editingId ? "update" : "add"}>
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {/* -------- Books Table -------- */}
      <table className="book-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((b) => (
              <tr key={b.book_id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.genre_name || "—"}</td>
                <td>{b.rating}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(b)}>
                    Edit
                  </button>
                  <button className="delete" onClick={() => handleDelete(b.book_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-books">
                No books found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Books;
