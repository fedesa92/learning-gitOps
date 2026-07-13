package com.fedesa92.bookstore.domain.book;

public class BookNotFoundException extends RuntimeException {

	public BookNotFoundException(Long id) {
		super("Book with id " + id + " was not found");
	}
}
