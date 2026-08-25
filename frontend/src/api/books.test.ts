/**
 * `jest.fn()` creates a mock function that records how `fetch` is called and
 * lets each test configure the response returned by the API.
 *
 * `beforeAll()` runs once before this test suite. Assigning the mock to
 * `globalThis.fetch` makes the API client use it instead of sending real HTTP
 * requests to the backend.
 *
 * `beforeEach()` runs before every test. `mockReset()` clears recorded calls,
 * returned results and mock implementations so that each test starts from an
 * isolated state.
 */
import { createBook, deleteBook, getBooks } from './books';
import type { BookInput } from '../types/book';

const mockedFetch = jest.fn();

beforeAll(() => {
  globalThis.fetch = mockedFetch;
});

beforeEach(() => {
  mockedFetch.mockReset();
});

test('getBooks requests and returns the catalog', async () => {
  const books = [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
    },
  ];
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(books),
  });

  await expect(getBooks()).resolves.toEqual(books);
  expect(mockedFetch).toHaveBeenCalledWith('http://localhost:8080/api/books', {
    headers: { 'Content-Type': 'application/json' },
  });
});

test('createBook sends the book as JSON and returns the created resource', async () => {
  const input: BookInput = {
    title: 'Refactoring',
    author: 'Martin Fowler',
    isbn: '9780201485677',
  };
  const created = { id: 2, ...input };
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 201,
    json: jest.fn().mockResolvedValue(created),
  });

  await expect(createBook(input)).resolves.toEqual(created);
  expect(mockedFetch).toHaveBeenCalledWith('http://localhost:8080/api/books', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  });
});

test('deleteBook handles a successful 204 response without parsing JSON', async () => {
  const json = jest.fn();
  mockedFetch.mockResolvedValue({ ok: true, status: 204, json });

  await expect(deleteBook(7)).resolves.toBeUndefined();
  expect(mockedFetch).toHaveBeenCalledWith(
    'http://localhost:8080/api/books/7',
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  expect(json).not.toHaveBeenCalled();
});

test('throws an error containing the HTTP status for unsuccessful responses', async () => {
  mockedFetch.mockResolvedValue({ ok: false, status: 503 });

  await expect(getBooks()).rejects.toThrow(
    'API request failed with status 503',
  );
});
