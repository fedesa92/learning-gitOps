import type { Book, BookInput } from '../types/book';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.status === 204 ? (undefined as T) : response.json();
}

export function getBooks(): Promise<Book[]> {
  return request('/api/books');
}

export function createBook(book: BookInput): Promise<Book> {
  return request('/api/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export function deleteBook(id: number): Promise<void> {
  return request(`/api/books/${id}`, { method: 'DELETE' });
}
