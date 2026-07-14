CREATE TABLE IF NOT EXISTS books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO books (title, author, isbn)
VALUES ('The Phoenix Project', 'Gene Kim, Kevin Behr, George Spafford', '9780988262591')
ON CONFLICT (isbn) DO NOTHING;
