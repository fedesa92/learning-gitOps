## From the First Container to a Complete GitOps Platform

---

# Project Overview


The goal of the project is to teach developers how to build, deploy and operate cloud-native 
applications using modern CNCF technologies through a single end-to-end project.

Instead of presenting isolated examples, the entire learning path is built around 
one real application called **BookStore Platform**.

Each chapter extends the same application by introducing a new technology or architectural concept.

---

# Learning Philosophy

The book follows a **learning-by-building** approach.

Readers progressively evolve the same application from a simple Docker Compose deployment 
into a complete GitOps platform.

Every chapter contains:

- Theory
- Practical examples
- Hands-on laboratories
- References to official documentation

No chapter should introduce disconnected examples.

Everything must contribute to the evolution of the BookStore Platform.

---

# Target Audience

This book is intended for software developers and DevOps engineers who want to learn Kubernetes 
and OpenShift from scratch.

Typical readers include:

- Java Developers
- Spring Boot Developers
- React Developers
- DevOps Engineers
- Platform Engineers
- System Engineers

Readers are assumed to know basic programming concepts and have minimal familiarity with Docker.

---

# Development Environment

All laboratories must be executable entirely on **localhost**.

No cloud services are required.

The entire learning path must work using only open-source software.

Recommended tools:

- Git
- Docker
- Docker Compose
- Kind (preferred) or Minikube
- kubectl
- Visual Studio Code
- WebStorm
- GitHub

Later chapters introduce:

- OpenShift Local (CRC)
- Helm
- Tekton
- Argo CD

---

# Core Application

The entire book revolves around one application.

Application name:

**BookStore Platform**

The application evolves progressively throughout the book.

Initial architecture:

- React Frontend
- Spring Boot Backend
- PostgreSQL Database

Additional services will be introduced only when required by later chapters.

Possible additions include:

- Redis
- RabbitMQ
- Prometheus
- Grafana

The application itself remains the same.

Only the infrastructure evolves.

---

# Learning Roadmap

Chapter 1

Containerization

- Docker
- Docker Compose

Chapter 2

Kubernetes Fundamentals

- Pod
- Deployment
- Service
- Namespace

Chapter 3

OpenShift

- Projects
- Routes
- OpenShift Local
- Developer Workflow

Chapter 4

Helm

- Charts
- Values
- Templates

Chapter 5

Tekton

- CI Pipeline
- Build
- Test
- Container Image

Chapter 6

Argo CD

- GitOps
- Continuous Delivery
- Synchronization

Chapter 7

Complete GitOps Platform

Git

↓

Tekton

↓

Container Registry

↓

Manifest Repository

↓

Argo CD

↓

OpenShift Cluster

---

# Editorial Guidelines

Every chapter should contain:

- Learning objectives
- Prerequisites
- Theory
- Hands-on laboratories
- Official references

The writing style must remain practical because the manual
is a practical guide for software developers.

---

# Source of Truth

The Markdown files stored in this repository are the single source of truth.

Generated artifacts (PDF, DOCX, HTML) must always be produced from these Markdown files.

No manual modifications should be applied to generated documents.

---

# Code Quality

All source code included in the repository must:

- Compile successfully
- Be runnable
- Be production-inspired
- Remain easy to understand
- Avoid unnecessary complexity

Examples should prioritize clarity over completeness.

---

# Infrastructure Philosophy

Infrastructure must be treated as code.

Everything required to reproduce the environment should be stored inside the repository, including:

- Kubernetes manifests
- Helm Charts
- OpenShift resources
- Tekton Pipelines
- Argo CD Applications

The repository should allow a complete rebuild of the platform.

---

# Documentation Standards

Documentation should always explain:

- Why a technology exists
- Which problem it solves
- How it works
- When it should be used

Theory should always be followed by a practical laboratory.

---

# Final Objective

At the end of the book, the reader will have built a complete cloud-native platform including:

- Source code
- Docker images
- Kubernetes manifests
- OpenShift resources
- Helm Charts
- Tekton pipelines
- Argo CD applications

using a single real-world project.

The reader should understand not only **how** to use each technology, but also **why** it exists 
and how it integrates into a modern software delivery platform.