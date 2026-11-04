CREATE TABLE IF NOT EXISTS book (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 author TEXT NOT NULL,
 price INTEGER NOT NULL CHECK(price >= 0),
 pages INTEGER NOT NULL CHECK(pages > 0)
);
INSERT INTO book (title, author, price, pages) VALUES
('The Alchemist','Paulo Coelho',350,208),
('Wings of Fire','A. P. J. Abdul Kalam',280,180),
('Atomic Habits','James Clear',499,320),
('The Hobbit','J. R. R. Tolkien',450,310),
('Ikigai','Hector Garcia',299,194),
('Rich Dad Poor Dad','Robert Kiyosaki',399,336),
('The Guide','R. K. Narayan',250,220),
('Pride and Prejudice','Jane Austen',320,432),
('Think Like a Monk','Jay Shetty',375,288),
('Harry Potter and the Philosopher''s Stone','J. K. Rowling',550,320);
