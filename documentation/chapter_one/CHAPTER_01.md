# OpenShift GitOps in pratica

## Capitolo 1 - Perche Docker non basta piu

Laboratorio 100% localhost-first.

Nessun cloud e obbligatorio. Gli esercizi si eseguono sul PC del lettore con Docker o Podman e, nei capitoli successivi, OpenShift Local o OKD.

Stack del libro: React, Spring Boot, PostgreSQL, Docker o Podman, Kubernetes, OpenShift, Tekton, Argo CD e GitHub webhook.

---

## Obiettivo del capitolo

In questo capitolo partiamo dal punto piu familiare per uno sviluppatore: eseguire sul proprio PC una piccola applicazione composta da frontend, backend e database.

Non useremo ancora Kubernetes, OpenShift, Helm, Tekton o Argo CD. Queste tecnologie verranno introdotte soltanto quando il problema da risolvere le rendera necessarie.

Alla fine del capitolo avrai:

- una struttura iniziale del progetto BookStore;
- un frontend React eseguito tramite Nginx;
- un backend Spring Boot eseguito come JAR;
- un database PostgreSQL persistente;
- un ambiente localhost avviabile con Docker Compose;
- una comprensione pratica dei limiti che conducono a Kubernetes e OpenShift.

## 1.1 Il progetto BookStore

Useremo la stessa applicazione per tutto il libro. Questo evita esempi scollegati e permette di osservare l'evoluzione reale di un progetto: da applicazione locale a piattaforma GitOps completa.

```text
bookstore/
|-- frontend/                # applicazione React
|-- backend/                 # API Spring Boot
|-- database/                # script SQL iniziali
|-- infrastructure/
|   |-- docker/              # Docker Compose e file locali
|   |-- kubernetes/          # introdotto nel Capitolo 2
|   |-- helm/                # introdotto nel Capitolo 4
|   |-- openshift/           # introdotto nel Capitolo 3
|   |-- tekton/              # introdotto nel Capitolo 5
|   `-- argocd/              # introdotto nel Capitolo 6
`-- README.md
```

Le directory delle tecnologie future rappresentano la struttura obiettivo. Vengono create soltanto nel capitolo che introduce la relativa tecnologia.

Nel Capitolo 1 useremo esclusivamente `infrastructure/docker/`. Il frontend sara raggiungibile dal browser su localhost, il backend esporra API HTTP e PostgreSQL rimarra nella rete locale Docker, con una porta pubblicata soltanto per comodita didattica.

## 1.2 Perche non partiamo subito da OpenShift?

OpenShift risolve problemi che diventano evidenti dopo aver gestito container, configurazioni, reti, crash, aggiornamenti e immagini.

Partendo da Docker, ogni oggetto introdotto successivamente avra una motivazione concreta. Docker Compose e sufficiente per il primo ambiente locale, ma non offre un orchestratore multi-nodo, rollout controllati o riconciliazione continua dello stato desiderato.

## 1.3 Container: cosa ci serve sapere davvero

Un container e un'istanza in esecuzione di un'immagine. Un'immagine e un pacchetto immutabile che contiene applicazione, runtime e dipendenze.

Un container non e una piccola macchina virtuale: condivide il kernel dell'host e isola processi, filesystem, rete e risorse. Questo lo rende piu leggero di una VM, ma non lo trasforma in un orchestratore.

## 1.4 Primo ambiente locale con Docker Compose

Docker Compose descrive applicazioni multi-container tramite servizi, reti, volumi, variabili d'ambiente e porte.

Il laboratorio comprende tre servizi:

- `postgres` per la persistenza;
- `backend` per le API Spring Boot;
- `frontend` per l'interfaccia React servita da Nginx.

## 1.5 Prerequisito: compilare il backend

Il Dockerfile del backend copia un JAR gia compilato. Prima di costruire le immagini, esegui dalla directory `backend/`:

```bash
./mvnw clean package
```

Su Windows PowerShell usa l'equivalente:

```powershell
.\mvnw.cmd clean package
```

Al termine deve esistere:

```text
backend/target/bookstore-backend.jar
```

La build automatizzata verra spostata nella pipeline nel capitolo dedicato a Tekton.

## 1.6 File `docker-compose.yml`

Crea `infrastructure/docker/docker-compose.yml`:

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

Il file non usa `container_name`. In questo modo Compose puo assegnare nomi coerenti con il progetto e il servizio `backend` puo essere scalato durante il laboratorio.

## 1.7 Cosa significa questo file

- `postgres` usa l'immagine ufficiale PostgreSQL 17.
- `bookstore_pgdata` conserva i dati oltre il ciclo di vita del container.
- L'health check usa `pg_isready` per verificare che PostgreSQL accetti connessioni.
- `backend` viene avviato soltanto quando PostgreSQL e sano.
- Il backend raggiunge il database attraverso il nome DNS Compose `postgres`.
- `frontend` viene costruito dalla directory `frontend/` e pubblicato su `localhost:3000`.
- `bookstore-net` consente ai servizi di comunicare usando i rispettivi nomi.
- Le porte pubblicate permettono l'accesso dall'host tramite browser, `curl` o strumenti SQL.

La porta PostgreSQL viene pubblicata su `localhost:5432` per comodita didattica. In un ambiente reale il database potrebbe rimanere accessibile esclusivamente dalla rete interna.

## 1.8 Dockerfile del backend Spring Boot

Crea `backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/bookstore-backend.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Il Dockerfile assume che il JAR sia stato prodotto con `./mvnw clean package`.

## 1.9 Dockerfile del frontend React

Vite sostituisce le variabili `VITE_*` durante la build e le espone al codice client tramite `import.meta.env`. Non devono contenere segreti, perche finiscono nel bundle distribuito al browser.

Crea `frontend/Dockerfile`:

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

Il valore viene passato da Compose tramite `build.args`, prima di `npm run build`. Il container finale contiene soltanto Nginx e gli asset statici prodotti da Vite.

Nel codice React la variabile si legge con:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

## 1.10 Avvio dell'ambiente

Dalla directory `infrastructure/docker/`:

```bash
docker compose up -d --build
```

Endpoint locali:

- frontend: <http://localhost:3000>;
- backend: <http://localhost:8080>;
- PostgreSQL: `localhost:5432`.

## 1.11 Prima verifica

```bash
docker compose ps
curl http://localhost:8080/actuator/health
```

Risposta attesa dal backend:

```json
{"status":"UP"}
```

Il servizio PostgreSQL deve risultare `healthy` nell'output di `docker compose ps`.

## 1.12 Networking: perche il backend usa `postgres` e non `localhost`

Dentro un container, `localhost` indica il container stesso. Se il backend usasse `localhost:5432`, cercherebbe PostgreSQL dentro il container backend.

Compose fornisce una risoluzione DNS interna basata sul nome del servizio:

```text
backend container
  localhost:8080  -> backend stesso
  postgres:5432   -> servizio PostgreSQL su bookstore-net
```

Per questo la connessione usa:

```text
jdbc:postgresql://postgres:5432/bookstore
```

## 1.13 Persistenza: perche serve un volume

Senza volume, i dati verrebbero persi eliminando il container PostgreSQL. Il volume nominato conserva i file sul disco dell'host:

```yaml
volumes:
  bookstore_pgdata:

services:
  postgres:
    volumes:
      - bookstore_pgdata:/var/lib/postgresql/data
```

## 1.14 Esercitazione 1 - avviare e fermare tutto

1. Compila il backend con `./mvnw clean package`.
2. Avvia l'ambiente con `docker compose up -d --build`.
3. Controlla i servizi con `docker compose ps`.
4. Apri il frontend su <http://localhost:3000>.
5. Ferma tutto con `docker compose down`.
6. Riavvia con `docker compose up -d`.
7. Verifica che il database abbia conservato i dati.

## 1.15 Simuliamo un crash

Ferma il servizio backend:

```bash
docker compose stop backend
docker compose ps
```

Il backend risulta fermo. Compose puo applicare una policy di riavvio sullo stesso host, ma non distribuisce il carico, non sposta workload tra nodi e non effettua rollout controllati.

Riavvia il servizio:

```bash
docker compose up -d backend
```

## 1.16 Simuliamo lo scaling

Prova a scalare il backend:

```bash
docker compose up -d --scale backend=3
```

Il mapping fisso `8080:8080` impedisce a piu container di pubblicare contemporaneamente la stessa porta host. Per scalare servirebbe rimuovere il mapping fisso, introdurre un reverse proxy o adottare un orchestratore con un endpoint stabile e bilanciamento.

## 1.17 Simuliamo un aggiornamento

Con Compose e possibile ricostruire e riavviare il backend, ma il controllo di aggiornamenti senza downtime e rollback e limitato. Kubernetes introdurra `Deployment` e rollout dichiarativi proprio per gestire questi casi.

## 1.18 Dove Docker Compose e perfetto

- sviluppo locale;
- applicazioni piccole;
- test rapidi di frontend, backend e database;
- demo e ambienti temporanei;
- onboarding su una singola macchina.

## 1.19 Dove Docker Compose non basta

- alta disponibilita multi-nodo;
- scheduling automatico;
- service discovery stabile in un cluster;
- rollout e rollback controllati;
- RBAC e gestione multi-team;
- separazione reale di ambienti;
- GitOps e riconciliazione continua.

## 1.20 Perche arriva Kubernetes

Con Kubernetes non si richiede di avviare un container in una posizione specifica. Si dichiara invece uno stato desiderato: numero di repliche, endpoint stabile, configurazione separata e strategia di aggiornamento.

Kubernetes osserva lo stato reale e agisce per avvicinarlo allo stato desiderato. Questo concetto prepara il passaggio a OpenShift.

## 1.21 Cosa hai imparato

- Docker impacchetta ed esegue applicazioni in container.
- Docker Compose gestisce applicazioni multi-container su localhost.
- I servizi sulla stessa rete Compose comunicano tramite il nome del servizio.
- Gli health check distinguono l'avvio del processo dalla disponibilita del servizio.
- I volumi conservano i dati oltre la vita del container.
- Vite incorpora le variabili `VITE_*` nel bundle durante la build.
- Crash, scaling, rollout e ambienti multipli richiedono un orchestratore.
- Kubernetes non sostituisce Docker: risolve un problema differente.

## 1.22 Errori comuni

- usare `localhost` per raggiungere un altro container;
- dimenticare il volume del database;
- considerare `depends_on` senza health check come garanzia di disponibilita;
- passare `VITE_API_BASE_URL` soltanto come variabile runtime dopo la build;
- inserire segreti in variabili `VITE_*`;
- pubblicare porte che dovrebbero rimanere interne;
- usare `container_name` su un servizio da scalare;
- confondere una policy di restart con l'alta disponibilita.

## 1.23 Esercizio finale svolto su localhost

1. Compila il backend.
2. Avvia BookStore con `docker compose up -d --build`.
3. Verifica che PostgreSQL sia `healthy`.
4. Ferma il backend con `docker compose stop backend`.
5. Verifica che il frontend non riesca piu a chiamare le API.
6. Riavvia con `docker compose up -d backend`.
7. Prova a scalare il backend a tre repliche.
8. Osserva il conflitto sulla porta `8080`.
9. Documenta nel README i limiti osservati e come Kubernetes li affronta.

## 1.24 Collegamento al Capitolo 2

Nel Capitolo 2 la stessa applicazione verra portata su Kubernetes locale. Verranno introdotti Pod, Deployment, Service e Namespace, senza usare ancora OpenShift.

## Fonti essenziali

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
