# Chapter 1 - Docker Compose Lab Results

This document summarizes the observations from the final BookStore Platform exercise performed on localhost.

## Starting the application

The backend must be compiled before building its image because the backend Dockerfile copies the JAR from the `backend/target` directory.

```bash
cd backend
./mvnw clean package
cd ..
```

The entire stack can then be built and started from the repository root:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

The following services are exposed on the host:

| Service | External address | Container port |
|---|---|---|
| Frontend | `http://localhost:3000` | `80` |
| Backend | `http://localhost:8080` | `8080` |
| PostgreSQL | `localhost:5432` | `5432` |

Check the status of the services with:

```bash
docker compose -f infrastructure/docker/docker-compose.yml ps
```

PostgreSQL must report a `healthy` status. Its health check uses `pg_isready` to verify that the `bookstore` database accepts connections before the backend is started.

## Stopping and restarting the backend

The backend can be stopped without stopping the other services:

```bash
docker compose -f infrastructure/docker/docker-compose.yml stop backend
```

The frontend container continues running, and Nginx continues serving the HTML, CSS, and JavaScript files. However, operations that require the API fail because there is no longer a process listening on port `8080`.

Restart the backend with:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d backend
```

Compose also starts any required dependencies. The `service_healthy` condition ensures that PostgreSQL is ready before the backend starts.

## Scaling attempt

Use the following command to attempt to create three backend replicas:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --scale backend=3 backend
```

The backend service publishes a fixed host port:

```yaml
ports:
  - "8080:8080"
```

Only one instance can bind to `localhost:8080`. The additional replicas try to publish the same port, and Docker reports a conflict because two processes cannot listen on the same host address and port combination at the same time.

Removing the host port would allow multiple containers to run on the internal network. However, this would not solve the main problem by itself: a component would still be required to provide a single access point and distribute requests among the replicas.

## Docker Compose limitations observed

The lab highlights the following limitations:

- stopping the only backend instance immediately makes all APIs unavailable;
- `depends_on` controls the startup order but does not automatically restore a stopped service;
- a static host port prevents multiple replicas of the same service from being exposed directly;
- there is no load balancer to distribute requests among replicas;
- health checks and startup ordering do not provide a complete self-healing system;
- updates and rollbacks must be coordinated manually;
- Compose orchestrates containers on a single host and does not distribute workloads across multiple nodes.

## How Kubernetes addresses these limitations

Kubernetes introduces specialized resources:

| Observed limitation | Kubernetes solution |
|---|---|
| Only one backend instance | A `Deployment` maintains the desired number of replicas. |
| A container stops or becomes unhealthy | Controllers recreate Pods to reconcile the actual state with the desired state. |
| Host port conflict | Each Pod has its own address on the cluster network and can use the same application port. |
| No stable access point | A `Service` provides a stable address in front of Pods that may change. |
| No request distribution | The `Service` forwards traffic to the available backend replicas. |
| A started process is not necessarily ready | Readiness and liveness probes distinguish between a started, ready, and healthy process. |
| Manual updates | A `Deployment` supports declarative rolling updates and rollbacks. |
| Single host | A cluster can schedule Pods across different nodes. |

The fundamental change is:

```text
Docker Compose: host port 8080 -> single backend container

Kubernetes: stable Service -> one or more backend Pod replicas
```

Docker Compose remains suitable for local development and simple labs. Kubernetes becomes useful when an application requires availability, scaling, self-healing, and controlled updates.
