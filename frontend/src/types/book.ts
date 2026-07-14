export interface Book {
  id: number
  title: string
  author: string
  isbn: string
}

export type BookInput = Omit<Book, 'id'>
