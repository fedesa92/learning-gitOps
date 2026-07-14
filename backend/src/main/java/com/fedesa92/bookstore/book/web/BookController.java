package com.fedesa92.bookstore.book.web;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fedesa92.bookstore.book.Book;
import com.fedesa92.bookstore.book.BookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books")
public class BookController {

	private final BookService service;

	public BookController(BookService service) {
		this.service = service;
	}

	@GetMapping
	public List<BookResponse> findAll() {
		return service.findAll().stream().map(BookResponse::from).toList();
	}

	@GetMapping("/{id}")
	public BookResponse findById(@PathVariable Long id) {
		return BookResponse.from(service.findById(id));
	}

	@PostMapping
	public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
		Book created = service.create(request.title(), request.author(), request.isbn());
		return ResponseEntity.created(URI.create("/api/books/" + created.getId()))
				.body(BookResponse.from(created));
	}

	@PutMapping("/{id}")
	public BookResponse update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
		return BookResponse.from(service.update(id, request.title(), request.author(), request.isbn()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
