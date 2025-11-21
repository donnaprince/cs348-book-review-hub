import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import booksRouter from "./routes/books.js";
import genresRouter from "./routes/genres.js";
import { seedGenres } from "./models/Genre.js";

dotenv.config();
await connectDB();
await seedGenres();

const app = express();

/* ✅ CORS configuration */
app.use(
  cors({
    origin: ["http://localhost:3000"], // React dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

/* ✅ Middleware */
app.use(bodyParser.json());

/* ✅ Routes */
app.use("/api/books", booksRouter);
app.use("/api/genres", genresRouter); // <— this is the one that connects your new POST route

/* ✅ Test route */
app.get("/", (req, res) => res.send("Backend running OK"));

/* ✅ Start server */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
