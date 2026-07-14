package com.fedesa92.bookstore.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fedesa92.bookstore.book.BookNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(BookNotFoundException.class)
	ProblemDetail handleBookNotFound(BookNotFoundException exception) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
	}
}
