# OpenShift GitOps in Practice

## Chapter 1 - Why Docker Is No Longer Enough

A 100% localhost-first lab.

No cloud environment is required. The exercises run on the reader's computer with Docker or Podman and, in later chapters, OpenShift Local or OKD.

Book stack: React, Spring Boot, PostgreSQL, Docker or Podman, Kubernetes, OpenShift, Tekton, Argo CD, and GitHub webhooks.

---

## Chapter objective

In this chapter, we start from the most familiar place for a developer: running a small application made up of a frontend, backend, and database on a local computer.

We will not use Kubernetes, OpenShift, Helm, Tekton, or Argo CD yet. These technologies will be introduced only when they become necessary to solve a specific problem.

By the end of the chapter, you will have:

- an initial BookStore project structure;
- a React frontend served by Nginx;
- a Spring Boot backend running as a JAR;
- a persistent PostgreSQL database;
- a localhost environment that can be started with Docker Compose;
- a practical understanding of the limitations that lead to Kubernetes and OpenShift.

## 1.1 The BookStore project

We will use the same application throughout the book. This avoids disconnected examples and makes it possible to observe the real evolution of a project: from a local application to a complete GitOps platform.

```text
bookstore/
|-- frontend/                # React application
|-- backend/                 # Spring Boot API
|-- database/                # initial SQL scripts
|-- infrastructure/
|   |-- docker/              # Docker Compose and local files
|   |-- kubernetes/          # introduced in Chapter 2
|   |-- helm/                # introduced in Chapter 4
|   |-- openshift/           # introduced in Chapter 3
|   |-- tekton/              # introduced in Chapter 5
|   `-- argocd/              # introduced in Chapter 6
`-- README.md
```

The directories for future technologies represent the target structure. They are created only in the chapter that introduces the corresponding technology.

In Chapter 1, we will use only `infrastructure/docker/`. The frontend will be accessible from a browser on localhost, the backend will expose HTTP APIs, and PostgreSQL will remain on the local Docker network, with a port published only for learning convenience.

## 1.2 Why do we not start with OpenShift?

OpenShift solves problems that become clear after managing containers, configurations, networks, crashes, updates, and images.

By starting with Docker, every resource introduced later will have a concrete purpose. Docker Compose is sufficient for the first local environment, but it does not provide a multi-node orchestrator, controlled rollouts, or continuous reconciliation of the desired state.

## 1.3 Containers: what we really need to know

A container is a running instance of an image. An image is an immutable package that contains an application, its runtime, and its dependencies.

A container is not a small virtual machine: it shares the host kernel while isolating processes, filesystems, networks, and resources. This makes it lighter than a VM, but it does not turn it into an orchestrator.

## 1.4 The first local environment with Docker Compose

Docker Compose describes multi-container applications through services, networks, volumes, environment variables, and ports.

The lab includes three services:

- `postgres` for persistence;
- `backend` for the Spring Boot APIs;
- `frontend` for the React interface served by Nginx.

## 1.5 Prerequisite: compile the backend

The backend Dockerfile copies an already compiled JAR. Before building the images, run the following command from the `backend/` directory:

```bash
./mvnw clean package
```

On Windows PowerShell, use the equivalent command:

```powershell
.\mvnw.cmd clean package
```

When the build finishes, the following file must exist:

```text
backend/target/bookstore-backend.jar
```

The automated build will be moved into the pipeline in the chapter dedicated to Tekton.

## 1.6 The `docker-compose.yml` file

Create `infrastructure/docker/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: bookstore
      POSTGRES_USER: bookstore
      POSTGRES_PASSWORD: bookstore
    ports:
      - "5432:5432"
    volumes:
      - bookstore_pgdata:/var/lib/postgresql/data
    networks:
      - bookstore-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bookstore -d bookstore"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  backend:
    build:
      context: ../../backend
      dockerfile: Dockerfile
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/bookstore
      SPRING_DATASOURCE_USERNAME: bookstore
      SPRING_DATASOURCE_PASSWORD: bookstore
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - bookstore-net

  frontend:
    build:
      context: ../../frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8080
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - bookstore-net

volumes:
  bookstore_pgdata:

networks:
  bookstore-net:
    driver: bridge
```

The file does not use `container_name`. This allows Compose to assign names that are consistent with the project and enables the `backend` service to be scaled during the lab.

## 1.7 What this file means

- `postgres` uses the official PostgreSQL 17 image.
- `bookstore_pgdata` preserves data beyond the container lifecycle.
- The health check uses `pg_isready` to verify that PostgreSQL accepts connections.
- `backend` starts only after PostgreSQL is healthy.
- The backend reaches the database through the Compose DNS name `postgres`.
- `frontend` is built from the `frontend/` directory and published on `localhost:3000`.
- `bookstore-net` allows the services to communicate using their respective names.
- Published ports provide access from the host through a browser, `curl`, or SQL tools.

The PostgreSQL port is published on `localhost:5432` for learning convenience. In a real environment, the database might be accessible only from the internal network.

## 1.8 Spring Boot backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/bookstore-backend.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

The Dockerfile assumes that the JAR has been produced with `./mvnw clean package`.

## 1.9 React frontend Dockerfile

Vite replaces `VITE_*` variables during the build and exposes them to client code through `import.meta.env`. They must not contain secrets because they become part of the bundle delivered to the browser.

Create `frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
```

Compose passes the value through `build.args` before `npm run build`. The final container contains only Nginx and the static assets produced by Vite.

In the React code, the variable is read with:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

## 1.10 Starting the environment

From the `infrastructure/docker/` directory:

```bash
docker compose up -d --build
```

Local endpoints:

- frontend: <http://localhost:3000>;
- backend: <http://localhost:8080>;
- PostgreSQL: `localhost:5432`.

## 1.11 First verification

```bash
docker compose ps
curl http://localhost:8080/actuator/health
```

Expected response from the backend:

```json
{"status":"UP"}
```

The PostgreSQL service must report a `healthy` status in the output of `docker compose ps`.

## 1.12 Networking: why the backend uses `postgres` instead of `localhost`

Inside a container, `localhost` refers to the container itself. If the backend used `localhost:5432`, it would look for PostgreSQL inside the backend container.

Compose provides internal DNS resolution based on service names:

```text
backend container
  localhost:8080  -> the backend itself
  postgres:5432   -> PostgreSQL service on bookstore-net
```

This is why the connection uses:

```text
jdbc:postgresql://postgres:5432/bookstore
```

## 1.13 Persistence: why a volume is required

Without a volume, the data would be lost when the PostgreSQL container is removed. The named volume stores the files on the host disk:

```yaml
volumes:
  bookstore_pgdata:

services:
  postgres:
    volumes:
      - bookstore_pgdata:/var/lib/postgresql/data
```

## 1.14 Exercise 1 - start and stop everything

1. Compile the backend with `./mvnw clean package`.
2. Start the environment with `docker compose up -d --build`.
3. Check the services with `docker compose ps`.
4. Open the frontend at <http://localhost:3000>.
5. Stop everything with `docker compose down`.
6. Start it again with `docker compose up -d`.
7. Verify that the database has preserved its data.

## 1.15 Simulating a crash

Stop the backend service:

```bash
docker compose stop backend
docker compose ps
```

The backend is now stopped. Compose can apply a restart policy on the same host, but it does not distribute traffic, move workloads between nodes, or perform controlled rollouts.

Restart the service:

```bash
docker compose up -d backend
```

## 1.16 Simulating scaling

Try to scale the backend:

```bash
docker compose up -d --scale backend=3
```

The fixed `8080:8080` mapping prevents multiple containers from publishing the same host port at the same time. Scaling would require removing the fixed mapping, introducing a reverse proxy, or adopting an orchestrator with a stable endpoint and load balancing.

## 1.17 Simulating an update

Compose can rebuild and restart the backend, but it provides limited control over zero-downtime updates and rollbacks. Kubernetes introduces `Deployment` resources and declarative rollouts specifically to handle these cases.

## 1.18 Where Docker Compose is a perfect fit

- local development;
- small applications;
- quick frontend, backend, and database tests;
- demos and temporary environments;
- onboarding on a single machine.

## 1.19 Where Docker Compose is not enough

- multi-node high availability;
- automatic scheduling;
- stable service discovery in a cluster;
- controlled rollouts and rollbacks;
- RBAC and multi-team management;
- true environment separation;
- GitOps and continuous reconciliation.

## 1.20 Why Kubernetes comes next

With Kubernetes, you do not ask to start a container in a specific location. Instead, you declare a desired state: the number of replicas, a stable endpoint, separate configuration, and an update strategy.

Kubernetes observes the actual state and acts to move it toward the desired state. This concept prepares the transition to OpenShift.

## 1.21 What you learned

- Docker packages and runs applications in containers.
- Docker Compose manages multi-container applications on localhost.
- Services on the same Compose network communicate through service names.
- Health checks distinguish process startup from service availability.
- Volumes preserve data beyond the container lifecycle.
- Vite embeds `VITE_*` variables in the bundle during the build.
- Crashes, scaling, rollouts, and multiple environments require an orchestrator.
- Kubernetes does not replace Docker: it solves a different problem.

## 1.22 Common mistakes

- using `localhost` to reach another container;
- forgetting the database volume;
- treating `depends_on` without a health check as an availability guarantee;
- passing `VITE_API_BASE_URL` only as a runtime variable after the build;
- placing secrets in `VITE_*` variables;
- publishing ports that should remain internal;
- using `container_name` on a service that needs to scale;
- confusing a restart policy with high availability.

## 1.23 Final exercise completed on localhost

1. Compile the backend.
2. Start BookStore with `docker compose up -d --build`.
3. Verify that PostgreSQL is `healthy`.
4. Stop the backend with `docker compose stop backend`.
5. Verify that the frontend can no longer call the APIs.
6. Restart it with `docker compose up -d backend`.
7. Try to scale the backend to three replicas.
8. Observe the conflict on port `8080`.
9. Document the observed limitations and how Kubernetes addresses them in the README.

## 1.24 Connection to Chapter 2

In Chapter 2, the same application will be moved to a local Kubernetes environment. Pods, Deployments, Services, and Namespaces will be introduced without using OpenShift yet.

## Essential sources

- [Docker Compose](https://docs.docker.com/compose/)
- [Compose file reference](https://docs.docker.com/reference/compose-file/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Spring Boot samples](https://docs.docker.com/reference/samples/spring/)
- [Spring Boot container images](https://docs.spring.io/spring-boot/reference/packaging/container-images/index.html)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker)
- [Vite environment variables and modes](https://vite.dev/guide/env-and-mode)
- [React: build from scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- [Kubernetes overview](https://kubernetes.io/docs/concepts/overview/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
