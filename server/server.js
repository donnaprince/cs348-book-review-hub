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

/* ✅ FIXED CORS — includes preflight (OPTIONS) */
const allowedOrigins = [
  "http://localhost:3000",
  "https://cs348-book-review-hub.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Preflight support
app.options("*", cors());

/* ✅ Middleware */
app.use(bodyParser.json());

/* ✅ Routes */
app.use("/api/books", booksRouter);
app.use("/api/genres", genresRouter);

/* ✅ Test route */
app.get("/", (req, res) => res.send("Backend running OK"));

/* ✅ Start server */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
