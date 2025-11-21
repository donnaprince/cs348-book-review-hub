import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Genre", required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
});

//indexes on genre + rating
bookSchema.index({ genre_id: 1 });

bookSchema.index({ rating: 1 });

const Book = mongoose.model("Book", bookSchema);

export default Book;
