# Lab 3: REST API, query parameters, validation, debugging

**Name:** Gondela Susmitha  
**Registration number:** 252U1R6081  
**Section / Class:** 207-AIML-2B  
**Course:** Backend Development Fundamentals · Year II Term II

## Live link
Not deployed. Run locally using the instructions below. Replace this line with the public URL if you deploy the server.

## Objective
Upgrade the Lab 2 Express and SQLite application into a REST API with search, sorting, pagination, price filtering, validation, correct status codes, and debugging practice.

## Project structure
- `src/server.js` — Express server and REST API routes.
- `database/books.db` — SQLite database with 10 sample books.
- `database/schema.sql` — table definition and sample data.
- `lab03.postman_collection.json` — Postman success and failure test requests.
- `.env.example` — example configuration.
- `screenshots/` — add genuine screenshots from your own tests.

## Requirements
Node.js, npm, Postman, and optionally SQLite CLI.

## Install and run
1. Open this `lab-03` folder in VS Code.
2. Open the terminal in this folder.
3. Run `npm install`.
4. Optional: copy `.env.example` to `.env`. Defaults are port `3000` and `database/books.db`. Supported variables: `PORT` and `DATABASE_PATH`. Do not commit `.env`.
5. Run `npm run dev` (nodemon) or `npm start`.
6. Open `http://localhost:3000/books`.

## API endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | `/books` | Get books with optional search, sort, pagination and price filters. | 200 |
| GET | `/books/:bookId` | Get one book by ID. | 200 |
| POST | `/books` | Create a validated book. | 201 |
| PUT | `/books/:bookId` | Update an existing book. | 200 |
| DELETE | `/books/:bookId` | Delete an existing book. | 200 |

## GET /books query parameters

| Parameter | Default | Description |
|---|---|---|
| `search_q` | empty | Partial title search using SQL `LIKE`. |
| `order_by` | `id` | Allowed columns: `id`, `title`, `author`, `price`, `pages`. |
| `order` | `ASC` | Sort direction: `ASC` or `DESC`. |
| `limit` | `10` | Positive integer maximum rows returned. |
| `offset` | `0` | Non-negative integer number of rows skipped. |
| `min_price` | not applied | Inclusive minimum price. |
| `max_price` | not applied | Inclusive maximum price. |

Examples:
- `GET /books`
- `GET /books?search_q=atomic`
- `GET /books?order_by=price&order=DESC`
- `GET /books?limit=5&offset=0`
- `GET /books?min_price=200&max_price=500`
- `GET /books?search_q=the&order_by=title&order=ASC&limit=5&offset=0&min_price=200&max_price=500`

Sort column and direction are allow-listed. User values use SQL placeholders and parameter arrays.

## Example JSON body

POST `/books`:
```json
{
  "title": "Python Basics",
  "author": "John Smith",
  "price": 350,
  "pages": 250
}
```

PUT `/books/1`:
```json
{
  "title": "The Alchemist Updated",
  "author": "Paulo Coelho",
  "price": 400,
  "pages": 210
}
```

Title and author must be non-empty strings, price a non-negative number, and pages a positive integer. Invalid bodies return `400` with a JSON message.

## HTTP status codes
- `200 OK`: successful GET, PUT, or DELETE.
- `201 Created`: successful book creation.
- `400 Bad Request`: invalid ID, query parameter, or request body.
- `404 Not Found`: requested book or route does not exist.
- `500 Internal Server Error`: unexpected database/server failure.

Error responses use a consistent JSON `message` property.

## Postman testing
Import `lab03.postman_collection.json` and set `baseUrl` to `http://localhost:3000`. It contains tests for:
- Get all books; search, sort, pagination, and price range.
- Invalid sort and price range.
- Existing, missing, and invalid book IDs.
- Valid and invalid POST bodies.
- Existing and missing PUT/DELETE records.

For POST and PUT, choose Body → raw → JSON.

## Debugging exercise

| Error | Cause | Solution |
|---|---|---|
| `EADDRINUSE` | Another process uses the port. | Stop the other server or set a free `PORT`. |
| Wrong import path | Incorrect module/file path. | Check spelling and relative path. |
| `no such table` | SQL table name does not match the database. | Check `.tables` and use the correct table name. |
| Missing `await` | Async database operation is not awaited. | Use `await` inside an `async` function and handle errors. |

## Inspect SQLite
Run `sqlite3 database/books.db`, then:
```sql
.tables
SELECT * FROM book;
SELECT COUNT(*) FROM book;
.quit
```

## Screenshots to add
Capture real screenshots from your Postman and SQLite runs and save them in `screenshots/`:
- `get-books.png`
- <img width="1919" height="970" alt="image" src="https://github.com/user-attachments/assets/fec00775-de20-4568-b043-1f46224ec778" />

- `search-sort-filter.png`
- <img width="1916" height="965" alt="image" src="https://github.com/user-attachments/assets/ef443bde-638d-46c9-bfcc-741b91f16c9c" />

- `get-book-by-id.png`
- <img width="1914" height="972" alt="image" src="https://github.com/user-attachments/assets/fec231ce-82b5-482c-b59c-fc960bca6b57" />

- `post-valid.png`
- <img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/78564d0e-4fa8-4e3d-a031-abfa8ff7f82a" />

- `post-invalid.png`
- <img width="1919" height="960" alt="image" src="https://github.com/user-attachments/assets/da1a29e9-f810-497c-9cca-c09a711f7ebf" />

- `put-book.png`
- <img width="1918" height="971" alt="image" src="https://github.com/user-attachments/assets/5a9a8815-26a0-44bb-b02f-1d52dba96372" />

- `delete-book.png`
- <img width="1917" height="967" alt="image" src="https://github.com/user-attachments/assets/bd1976a9-ce06-45df-a005-7fc5eab44471" />

- `not-found-and-invalid-query.png`
- <img width="1918" height="970" alt="image" src="https://github.com/user-attachments/assets/499029ed-510b-45d2-991f-0c15ac99c02a" />

- `sqlite-database.png`

Embed each screenshot in this README, for example:
`![GET books response](screenshots/get-books.png)`

Screenshots are not fabricated or included as if testing has already occurred. Add your actual results before submission.

## Notes: problems faced and solutions
- Search and price filters are built from conditional SQL clauses with parameter arrays.
- Sorting uses an allow-list because SQL identifiers cannot be supplied as ordinary `?` parameters.
- Input validation checks query parameters, IDs, and book fields.
- Database operations use `await` and `try/catch`.
- `.gitignore` excludes `node_modules/` and `.env`.

## Viva preparation

**1. Query parameter vs path parameter?**  
A query parameter appears after `?` and is used for search, filtering, sorting, or pagination. A path parameter is part of the URL path and identifies a resource, such as `/books/5`.

**2. What does stateless mean?**  
A stateless API does not store client session state between requests. Each request contains the information needed to process it.

**3. Which status code for bad input vs a missing record?**  
Use `400 Bad Request` for invalid input and `404 Not Found` when a requested record does not exist.
