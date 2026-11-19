# Domaines backend

This is the Spring Boot API from [medenn/Domaines](https://github.com/medenn/Domaines), imported at commit `238369f`. It uses Java 17, Spring Boot, and PostgreSQL.

## Run locally with Docker

From this folder:

```sh
docker compose up --build
```

The API listens at `http://localhost:8090/api`; PostgreSQL is available on port `5433`. The Compose setup uses a separate local database volume and seeds the development data on first startup. The seed includes the source project's `admin` / `123` account; use it only for local development and change it before any shared deployment.

To point the React app at this backend, copy `.env.example` to `.env.local` in the frontend folder and restart the React dev server.

## Run with Maven

With PostgreSQL 18 running on port `5432`, run `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`). Configure database access and `JWT_SECRET` with environment variables. The default `APP_SEED_ENABLED` is `false` for direct runs.

## Configuration

Database URL, username, and password use `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. Set `JWT_SECRET` to a private value of at least 32 characters, `CORS_ALLOWED_ORIGINS` to a comma-separated list of trusted origins, and `APP_MEDIA_STORAGE_PATH` to the media directory. The Compose defaults are for local development only; replace them for deployment and disable seed data.
