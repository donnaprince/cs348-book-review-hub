import express from "express";
import Genre from "../models/Genre.js"; 

const router = express.Router();

// GET all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch genres" });
  }
});

// POST new genre
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Genre name is required" });
    }

    const existing = await Genre.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: "Genre already exists" });
    }

    const genre = new Genre({ name: name.trim() });
    await genre.save();

    res.status(201).json(genre);
  } catch (err) {
    console.error("Error adding genre:", err);
    res.status(500).json({ error: "Failed to create genre" });
  }
});

export default router; 
