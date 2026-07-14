import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import './App.scss'
import { createBook, deleteBook, getBooks } from './api/books'
import type { Book, BookInput } from './types/book'

const emptyBook: BookInput = { title: '', author: '', isbn: '' }

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#92400e' },
    background: { default: '#f7f3ec', paper: '#fffdf9' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
})

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState<BookInput>(emptyBook)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch(() => setError('The backend API is not available.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      const created = await createBook(form)
      setBooks((current) => [...current, created])
      setForm(emptyBook)
    } catch {
      setError('The book could not be saved.')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteBook(id)
      setBooks((current) => current.filter((book) => book.id !== id))
    } catch {
      setError('The book could not be deleted.')
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="bookstore-shell min-h-screen py-12">
        <Container maxWidth="md" className="grid gap-6">
          <header className="py-6">
            <Typography className="hero-accent" variant="overline" sx={{ fontWeight: 800 }}>
              Chapter 1 · Docker Compose
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, fontWeight: 800 }}>
              BookStore Platform
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.15rem' }}>
              A localhost-first React, Spring Boot, and PostgreSQL application.
            </Typography>
          </header>

          <Paper className="book-panel p-6" elevation={3}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }} gutterBottom>
              Add a book
            </Typography>
            <Box component="form" className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
              <TextField required label="Title" value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })} />
              <TextField required label="Author" value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })} />
              <TextField required label="ISBN" value={form.isbn}
                slotProps={{ htmlInput: { maxLength: 20 } }}
                onChange={(event) => setForm({ ...form, isbn: event.target.value })} />
              <Button className="md:col-span-3" type="submit" variant="contained" size="large">
                Save book
              </Button>
            </Box>
          </Paper>

          <Paper className="book-panel p-6" elevation={3}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>Catalog</Typography>
              <Chip label={`${books.length} books`} />
            </Stack>
            {error && <Alert severity="error" className="mb-4">{error}</Alert>}
            {loading && <Box className="flex justify-center p-6"><CircularProgress /></Box>}
            {!loading && books.length === 0 && <Typography>No books are available yet.</Typography>}
            <Stack>
              {books.map((book) => (
                <Stack className="book-row py-4" key={book.id} direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{book.title}</Typography>
                    <Typography color="text.secondary">{book.author}</Typography>
                    <Typography variant="caption">ISBN {book.isbn}</Typography>
                  </Box>
                  <Button color="error" variant="outlined" onClick={() => handleDelete(book.id)}>
                    Delete
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
