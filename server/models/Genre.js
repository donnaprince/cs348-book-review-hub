import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Genre = mongoose.model("Genre", genreSchema);

const DEFAULT_GENRES = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Mystery",
  "Romance",
  "Fantasy",
  "Biography",
  "History",
  "Self-Help",
];

export const seedGenres = async () => {
  try {
    const count = await Genre.countDocuments();
    if (count === 0) {
      await Genre.insertMany(DEFAULT_GENRES.map((name) => ({ name })));
      console.log("📚 Default genres inserted");
    } else {
      console.log("✅ Genres already exist, skipping seed");
    }
  } catch (err) {
    console.error("❌ Error seeding genres:", err.message);
  }
};

export default Genre;
