# Mimo Test Task

This is a Node.js/TypeScript/Express application using SQLite and Drizzle ORM.

## Features

- REST API for user, course, chapter, lesson, achievement, and progress management
- Swagger API documentation at `/swagger`
- SQLite database with Drizzle ORM migrations

## Local Development

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run the app in development mode:**
   ```sh
   npm run start:dev
   ```
3. **Run tests:**
   ```sh
   npm test
   ```
4. **API Docs:**
   Visit [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

## Build & Run with Docker

1. **Build and start the app:**
   ```sh
   docker-compose up --build
   ```
2. **Stop the app:**
   ```sh
   docker-compose down
   ```
3. **API Docs:**
   Visit [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

## Project Structure

- `src/` - Application source code
- `drizzle/` - Database migrations
- `sqlite.db` - SQLite database file
- `Dockerfile` - Docker build instructions
- `docker-compose.yml` - Multi-container orchestration

---

## Environment

- Node.js v22.x
- SQLite (file-based)

---

## Notes

- The database is seeded automatically on startup.
- To persist database changes outside the container, the `sqlite.db` file is mounted as a volume in `docker-compose.yml`.
