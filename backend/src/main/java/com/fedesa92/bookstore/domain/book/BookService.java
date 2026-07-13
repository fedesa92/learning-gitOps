package com.fedesa92.bookstore.domain.book;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BookService {

	private final BookRepository repository;

	public BookService(BookRepository repository) {
		this.repository = repository;
	}

	public List<Book> findAll() {
		return repository.findAll();
	}

	public Book findById(Long id) {
		return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
	}

	@Transactional
	public Book create(String title, String author, String isbn) {
		return repository.save(new Book(title, author, isbn));
	}

	@Transactional
	public Book update(Long id, String title, String author, String isbn) {
		Book book = findById(id);
		book.update(title, author, isbn);
		return book;
	}

	@Transactional
	public void delete(Long id) {
		repository.delete(findById(id));
	}
}
