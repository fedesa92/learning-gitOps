# Backend Package Architecture

## Decision

The BookStore backend is organized primarily **by feature**, rather than exclusively by technical layer.

All classes that implement the Book feature live under the `book` package. Web components that are not owned by a single feature live under the shared `web` package, while application-wide configuration remains under `config`.

```text
com.fedesa92.bookstore
|-- BookstoreBackendApplication.java
|-- book/
|   |-- Book.java
|   |-- BookNotFoundException.java
|   |-- BookRepository.java
|   |-- BookService.java
|   `-- web/
|       |-- BookController.java
|       |-- BookRequest.java
|       `-- BookResponse.java
|-- config/
|   `-- WebConfig.java
`-- web/
    |-- ApiExceptionHandler.java
    `-- HomeController.java
```

Static resources and server-rendered templates follow the standard Spring Boot layout:

```text
src/main/resources
|-- static/
|   |-- css/
|   |   `-- home.css
|   `-- js/
|       `-- home.js
|-- templates/
|   `-- home.html
`-- application.properties
```

## Why package by feature

A package-by-layer structure groups every controller, service, repository, entity, and DTO into separate top-level packages. This is easy to recognize in a very small application, but related code becomes scattered as more features are added.

For example, implementing a change to books would require navigating between `controller`, `service`, `repository`, `entity`, and `dto` packages. A feature-oriented structure keeps code that changes for the same business capability close together.

This approach provides the following benefits:

- feature boundaries are visible in the directory tree;
- related classes are easier to find and change together;
- a new feature can be added without expanding every technical-layer package;
- accidental coupling between unrelated features is easier to detect;
- the structure can evolve toward stronger modular boundaries as the application grows.

## Responsibilities inside a feature

Although the code is grouped by feature, each class still has a distinct responsibility.

### JPA entity

`Book` represents the persistent state stored in the `books` table. Persistence annotations and entity behavior belong here.

The entity is not exposed directly as the HTTP contract. This prevents database-oriented changes from automatically becoming breaking API changes.

### Repository

`BookRepository` extends `JpaRepository` and is responsible for persistence operations. It must not contain HTTP concerns or presentation logic.

### Service

`BookService` implements the application use cases and defines transaction boundaries. Controllers call the service instead of accessing the repository directly.

### Feature web layer

The `book.web` package contains the HTTP adapter for the Book feature:

- `BookController` maps HTTP requests to service calls;
- `BookRequest` validates incoming API data;
- `BookResponse` maps the entity to the public API representation.

Keeping request and response DTOs separate from the JPA entity protects both the persistence model and the API contract.

## Shared packages

Not every component belongs to a specific business feature.

- `config` contains application-wide Spring configuration.
- `web` contains shared or application-level web components.
- `HomeController` serves the backend welcome page and is not part of the Book API.
- `ApiExceptionHandler` currently provides global HTTP exception handling.

If exception handling becomes feature-specific, the corresponding handler can be moved into that feature's `web` package.

## Dependency flow

The expected request flow is:

```text
HTTP request
    -> BookController
    -> BookService
    -> BookRepository
    -> PostgreSQL
```

The dependencies should point inward through these responsibilities:

- controllers depend on services;
- services depend on repositories and entities;
- repositories manage entities through Spring Data JPA;
- entities do not depend on controllers, DTOs, or templates;
- DTOs must not be used as JPA entities.

Controllers should never access `BookRepository` directly. Database entities should not be returned directly from REST endpoints.

## Adding a new feature

A new capability should receive its own top-level feature package. For example:

```text
com.fedesa92.bookstore.author
|-- Author.java
|-- AuthorRepository.java
|-- AuthorService.java
`-- web/
    |-- AuthorController.java
    |-- AuthorRequest.java
    `-- AuthorResponse.java
```

Create shared abstractions only when multiple features genuinely need them. Avoid creating broad `util`, `common`, or technical-layer packages prematurely, because they tend to hide ownership and increase coupling.

## Spring Boot and component scanning

`BookstoreBackendApplication` is located in the root package:

```text
com.fedesa92.bookstore
```

Spring Boot scans this package and all its subpackages automatically. The package names are therefore an architectural choice, not a framework requirement: Spring discovers controllers, services, repositories, and entities through their annotations and their position below the application root package.
