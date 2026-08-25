import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { createBook, deleteBook, getBooks } from '../api/books';
import type { Book } from '../types/book';

jest.mock('../api/books', () => ({
  getBooks: jest.fn(),
  createBook: jest.fn(),
  deleteBook: jest.fn(),
}));

const mockedGetBooks = jest.mocked(getBooks);
const mockedCreateBook = jest.mocked(createBook);
const mockedDeleteBook = jest.mocked(deleteBook);

const existingBook: Book = {
  id: 1,
  title: 'Clean Code',
  author: 'Robert C. Martin',
  isbn: '9780132350884',
};

describe('App', () => {
  test('loads and displays existing books', async () => {
    mockedGetBooks.mockResolvedValue([existingBook]);

    render(<App />);

    expect(await screen.findByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    expect(screen.getByText('ISBN 9780132350884')).toBeInTheDocument();
    expect(screen.getByText('1 books')).toBeInTheDocument();
  });

  test('shows the empty catalog after loading', async () => {
    mockedGetBooks.mockResolvedValue([]);

    render(<App />);

    expect(
      await screen.findByText(/no books are available yet/i),
    ).toBeInTheDocument();
  });

  test('shows an error when loading fails', async () => {
    mockedGetBooks.mockRejectedValue(new Error('network error'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The backend API is not available.',
    );
  });

  test('fills the form and creates a book', async () => {
    const user = userEvent.setup();
    const createdBook: Book = {
      id: 2,
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      isbn: '9780321125217',
    };
    mockedGetBooks.mockResolvedValue([]);
    mockedCreateBook.mockResolvedValue(createdBook);

    render(<App />);
    await screen.findByText(/no books are available yet/i);

    await user.type(screen.getByLabelText(/^Title/), createdBook.title);
    await user.type(screen.getByLabelText(/^Author/), createdBook.author);
    await user.type(screen.getByLabelText(/^ISBN/), createdBook.isbn);
    await user.click(screen.getByRole('button', { name: /save book/i }));

    expect(mockedCreateBook).toHaveBeenCalledWith({
      title: createdBook.title,
      author: createdBook.author,
      isbn: createdBook.isbn,
    });
    expect(await screen.findByText(createdBook.title)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Title/)).toHaveValue('');
    expect(screen.getByLabelText(/^Author/)).toHaveValue('');
    expect(screen.getByLabelText(/^ISBN/)).toHaveValue('');
  });

  test('shows an error when creating a book fails', async () => {
    const user = userEvent.setup();
    mockedGetBooks.mockResolvedValue([]);
    mockedCreateBook.mockRejectedValue(new Error('save failed'));

    render(<App />);
    await screen.findByText(/no books are available yet/i);

    await user.type(screen.getByLabelText(/^Title/), 'Refactoring');
    await user.type(screen.getByLabelText(/^Author/), 'Martin Fowler');
    await user.type(screen.getByLabelText(/^ISBN/), '9780201485677');
    await user.click(screen.getByRole('button', { name: /save book/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The book could not be saved.',
    );
  });

  test('deletes a book from the catalog', async () => {
    const user = userEvent.setup();
    mockedGetBooks.mockResolvedValue([existingBook]);
    mockedDeleteBook.mockResolvedValue();

    render(<App />);
    await screen.findByText(existingBook.title);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockedDeleteBook).toHaveBeenCalledWith(existingBook.id);
    await waitFor(() => {
      expect(screen.queryByText(existingBook.title)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/no books are available yet/i)).toBeInTheDocument();
  });

  test('shows an error and keeps the book when deletion fails', async () => {
    const user = userEvent.setup();
    mockedGetBooks.mockResolvedValue([existingBook]);
    mockedDeleteBook.mockRejectedValue(new Error('delete failed'));

    render(<App />);
    await screen.findByText(existingBook.title);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The book could not be deleted.',
    );
    expect(screen.getByText(existingBook.title)).toBeInTheDocument();
  });
});
