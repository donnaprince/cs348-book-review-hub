import express from "express";
import mongoose from "mongoose";   
import Book from "../models/Book.js";
import Genre from "../models/Genre.js";

const router = express.Router();

/* ===========================
   GET  /api/books
   Filters by genre and/or rating range
   =========================== */
router.get("/", async (req, res) => {
  try {
    const { genre, minRating, maxRating } = req.query;
    const filter = {};

    /* -----------------------------
       Protect against injection:
       Validate genre ObjectId
    ------------------------------ */
    if (genre) {
      if (!mongoose.Types.ObjectId.isValid(genre)) {
        return res.status(400).json({ error: "Invalid genre ID" });
      }
      filter.genre_id = genre; //the query using the genre_id index
    }

    /* -----------------------------
       Rating range filtering
    ------------------------------ */
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseFloat(minRating);
      if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    const books = await Book.find(filter).populate("genre_id", "name"); //this runs the indexed query

    const result = books.map((b) => ({
      book_id: b._id,
      title: b.title,
      author: b.author,
      genre_id: b.genre_id?._id,
      genre_name: b.genre_id?.name,
      rating: b.rating,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

/* ===========================
   POST  /api/books
   Inserts a new book
   =========================== */
router.post("/", async (req, res) => {
  try {
    const { title, author, genre_id, rating } = req.body;

    // Validation
    if (!title || !author || !genre_id || rating === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const genreExists = await Genre.findById(genre_id);
    if (!genreExists) {
      return res.status(400).json({ error: "Invalid genre ID" });
    }

    const book = new Book({
      title,
      author,
      genre_id,
      rating: parseFloat(rating),
    });

    await book.save();
    res.status(201).json({
      message: "Book added successfully",
      book_id: book._id,
    });
  } catch (err) {
    console.error("❌ Error adding book:", err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

/* ===========================
   PUT  /api/books/:id
   Updates an existing book
   =========================== */
router.put("/:id", async (req, res) => {
  try {
    const { title, author, genre_id, rating } = req.body;

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, genre_id, rating: parseFloat(rating) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Book not found" });

    res.json({ message: "Book updated successfully" });
  } catch (err) {
    console.error("❌ Error updating book:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

/* ===========================
   DELETE  /api/books/:id
   Deletes a book by ID
   =========================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

//transactions
router.post("/atomic-add", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, author, genre_id, rating } = req.body;

    // Transactional genre check
    const genre = await Genre.findById(genre_id).session(session);
    if (!genre) throw new Error("Genre does not exist");

    // Transactional book insert
    await Book.create([{ title, author, genre_id, rating }], { session });

    await session.commitTransaction();
    res.json({ message: "Book added atomically inside a transaction" });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

export default router;
