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

const allowedOrigins = [
  "http://localhost:3000",
  "https://cs348-book-review-hub.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(bodyParser.json());


app.use("/api/books", booksRouter);
app.use("/api/genres", genresRouter);

app.get("/", (req, res) => res.send("Backend running OK"));


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
