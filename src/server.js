const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "..", "database", "books.db");

let db;
const ALLOWED_SORT_COLUMNS = ["id", "title", "author", "price", "pages"];

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateBook(body = {}) {
  const errors = [];
  if (typeof body.title !== "string" || !body.title.trim())
    errors.push("title is required and must be a non-empty string.");
  if (typeof body.author !== "string" || !body.author.trim())
    errors.push("author is required and must be a non-empty string.");
  if (body.price === undefined || body.price === "" ||
      !Number.isFinite(Number(body.price)) || Number(body.price) < 0)
    errors.push("price is required and must be a non-negative number.");
  if (body.pages === undefined || body.pages === "" ||
      !Number.isInteger(Number(body.pages)) || Number(body.pages) <= 0)
    errors.push("pages is required and must be a positive integer.");
  return errors;
}

function parseQueryInteger(value, name, res, minimum) {
  if (value === undefined) return undefined;
  if (String(value).trim() === "") {
    res.status(400).json({ message: `${name} cannot be empty.` });
    return null;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) {
    res.status(400).json({
      message: `${name} must be an integer greater than or equal to ${minimum}.`
    });
    return null;
  }
  return number;
}

async function initializeDBAndServer() {
  try {
    db = await open({ filename: DATABASE_PATH, driver: sqlite3.Database });
    console.log("Connected to SQLite database.");

    app.get("/books", async (req, res) => {
      try {
        const {
          search_q = "", order_by = "id", order = "ASC",
          limit: rawLimit = "10", offset: rawOffset = "0",
          min_price: rawMin, max_price: rawMax
        } = req.query;

        if (typeof search_q !== "string")
          return res.status(400).json({ message: "search_q must be a string." });

        const sortColumn = String(order_by).toLowerCase();
        if (!ALLOWED_SORT_COLUMNS.includes(sortColumn))
          return res.status(400).json({
            message: `order_by must be one of: ${ALLOWED_SORT_COLUMNS.join(", ")}.`
          });

        const sortOrder = String(order).toUpperCase();
        if (!["ASC", "DESC"].includes(sortOrder))
          return res.status(400).json({ message: "order must be ASC or DESC." });

        const limit = parseQueryInteger(rawLimit, "limit", res, 1);
        if (limit === null) return;
        const offset = parseQueryInteger(rawOffset, "offset", res, 0);
        if (offset === null) return;
        const minPrice = parseQueryInteger(rawMin, "min_price", res, 0);
        if (minPrice === null) return;
        const maxPrice = parseQueryInteger(rawMax, "max_price", res, 0);
        if (maxPrice === null) return;
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
          return res.status(400).json({
            message: "min_price must be less than or equal to max_price."
          });

        const conditions = [];
        const params = [];
        if (search_q.trim()) {
          conditions.push("title LIKE ?");
          params.push(`%${search_q.trim()}%`);
        }
        if (minPrice !== undefined) {
          conditions.push("price >= ?");
          params.push(minPrice);
        }
        if (maxPrice !== undefined) {
          conditions.push("price <= ?");
          params.push(maxPrice);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM book ${where}
          ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const books = await db.all(sql, params);

        res.status(200).json({
          message: "Books retrieved successfully.",
          filters: {
            search_q, order_by: sortColumn, order: sortOrder, limit, offset,
            min_price: minPrice ?? null, max_price: maxPrice ?? null
          },
          count: books.length,
          data: books
        });
      } catch (error) {
        console.error("GET /books:", error.message);
        res.status(500).json({ message: "Unable to retrieve books." });
      }
    });

    app.get("/books/:bookId", async (req, res) => {
      const id = validId(req.params.bookId);
      if (!id) return res.status(400).json({ message: "bookId must be a positive integer." });
      try {
        const book = await db.get("SELECT * FROM book WHERE id = ?", [id]);
        if (!book) return res.status(404).json({ message: "Book not found." });
        res.status(200).json({ message: "Book retrieved successfully.", data: book });
      } catch (error) {
        console.error("GET book:", error.message);
        res.status(500).json({ message: "Unable to retrieve the book." });
      }
    });

    app.post("/books", async (req, res) => {
      const errors = validateBook(req.body);
      if (errors.length)
        return res.status(400).json({ message: "Validation failed.", errors });
      try {
        const { title, author, price, pages } = req.body;
        const result = await db.run(
          "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
          [title.trim(), author.trim(), Number(price), Number(pages)]
        );
        const book = await db.get("SELECT * FROM book WHERE id = ?", [result.lastID]);
        res.status(201).json({ message: "Book created successfully.", data: book });
      } catch (error) {
        console.error("POST book:", error.message);
        res.status(500).json({ message: "Unable to create the book." });
      }
    });

    app.put("/books/:bookId", async (req, res) => {
      const id = validId(req.params.bookId);
      if (!id) return res.status(400).json({ message: "bookId must be a positive integer." });
      const errors = validateBook(req.body);
      if (errors.length)
        return res.status(400).json({ message: "Validation failed.", errors });
      try {
        const { title, author, price, pages } = req.body;
        const result = await db.run(
          "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
          [title.trim(), author.trim(), Number(price), Number(pages), id]
        );
        if (!result.changes) return res.status(404).json({ message: "Book not found." });
        const book = await db.get("SELECT * FROM book WHERE id = ?", [id]);
        res.status(200).json({ message: "Book updated successfully.", data: book });
      } catch (error) {
        console.error("PUT book:", error.message);
        res.status(500).json({ message: "Unable to update the book." });
      }
    });

    app.delete("/books/:bookId", async (req, res) => {
      const id = validId(req.params.bookId);
      if (!id) return res.status(400).json({ message: "bookId must be a positive integer." });
      try {
        const result = await db.run("DELETE FROM book WHERE id = ?", [id]);
        if (!result.changes) return res.status(404).json({ message: "Book not found." });
        res.status(200).json({ message: "Book deleted successfully." });
      } catch (error) {
        console.error("DELETE book:", error.message);
        res.status(500).json({ message: "Unable to delete the book." });
      }
    });

    app.use((req, res) => res.status(404).json({ message: "Route not found." }));
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  }
}

initializeDBAndServer();
