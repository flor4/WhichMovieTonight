# Glossary — WhichMovieTonight

This glossary defines all key technical terms, tools, and concepts used throughout the WhichMovieTonight project.

---

## Table of Contents

- [Project Concepts](#project-concepts)
- [Agile / Scrum](#agile--scrum)
- [Backend — Django & Python](#backend--django--python)
- [API & REST](#api--rest)
- [Authentication & Security](#authentication--security)
- [Database](#database)
- [Frontend — React](#frontend--react)
- [Version Control — Git](#version-control--git)
- [Testing & QA](#testing--qa)
- [Tools & Libraries](#tools--libraries)

---

## Project Concepts

| Term | Definition |
|------|------------|
| **MVP** | Minimum Viable Product — the simplest version of the application that delivers core features to users. |
| **WhichMovieTonight** | The name of the project — a web application allowing users to browse movies, rate them, comment on them, and check their streaming availability. |
| **Movie Catalog** | The list of movies available in the application, each with metadata (title, synopsis, genre, cast, release date, poster, trailer). |
| **Streaming Availability** | Boolean flags per movie indicating on which platforms it is available (Netflix, Disney+, Prime Video). |
| **Average Rating** | The arithmetic mean of all user scores (1–5 stars) for a given movie, calculated dynamically. |
| **Admin / Staff User** | A Django user with `is_staff=True`, authorized to perform CRUD operations on movies via the API or the admin dashboard. |
| **Regular User** | A Django user with `is_staff=False`, able to register, log in, rate movies, and post/edit/delete their own comments. |

---

## Agile / Scrum

| Term | Definition |
|------|------------|
| **Agile** | An iterative software development methodology focused on flexibility, collaboration, and delivering working software in short cycles. |
| **Scrum** | An Agile framework that organizes work into fixed-length iterations called sprints, with defined roles and ceremonies. |
| **Sprint** | A fixed time box (2 weeks in this project) during which a set of tasks is planned, executed, and reviewed. |
| **Sprint Planning** | The process of defining the tasks and goals for an upcoming sprint. |
| **Sprint Review** | A meeting at the end of a sprint to demo completed features to the team and stakeholders. |
| **Retrospective** | A reflection session at the end of a sprint to identify what went well, what didn't, and how to improve. |
| **Stand-up** | A short daily check-in where each team member shares what they did, what they plan to do, and any blockers. |
| **Backlog** | The full list of features, tasks, and bug fixes to be done in the project. |
| **MoSCoW** | A prioritization method: **M**ust Have, **S**hould Have, **C**ould Have, **W**on't Have. |
| **Deliverable** | A concrete output expected at the end of a sprint (e.g., "Users can browse and rate movies"). |
| **Blocker** | Any issue that prevents a team member from progressing on a task. |
| **Velocity** | The amount of work a team completes in a sprint, used to forecast future capacity. |

---

## Backend — Django & Python

| Term | Definition |
|------|------------|
| **Django** | A high-level Python web framework used for building the backend of the application. |
| **Django REST Framework (DRF)** | A toolkit built on top of Django for creating RESTful APIs. |
| **Model** | A Django class that defines the structure of a database table (e.g., `Movie`, `Rating`, `Comment`). |
| **ViewSet** | A DRF class that groups all CRUD logic for a resource into a single class (`ModelViewSet`). |
| **Serializer** | A DRF component that converts model instances to JSON and validates incoming data. |
| **Migration** | A Django mechanism that tracks and applies changes to the database schema. |
| **`perform_create()`** | A DRF ViewSet method overridden to inject server-side data at creation time (e.g., automatically assigning the logged-in user). |
| **`get_queryset()`** | A ViewSet method overridden to customize which objects are returned, e.g., filtering by `movie_id`. |
| **`is_staff`** | A Django User field (`Boolean`) that grants access to the Django admin and custom staff-only API endpoints. |
| **`read_only_fields`** | Serializer fields that are included in the response but cannot be set by the client (e.g., `user`, `created_at`). |
| **`auto_now_add`** | A model field option that automatically sets the timestamp when the object is first created. |
| **`auto_now`** | A model field option that automatically updates the timestamp every time the object is saved. |
| **`select_related()`** | A Django ORM method that performs a SQL JOIN to preload related objects, avoiding N+1 query problems. |
| **`aggregate()`** | A Django ORM method used to compute summary values (e.g., `Avg('score')` for average ratings). |
| **`settings.py`** | The Django configuration file containing database settings, installed apps, middleware, CORS, JWT config, etc. |
| **`manage.py`** | The Django command-line utility used to run the server, apply migrations, run tests, etc. |
| **CORS** | Cross-Origin Resource Sharing — a policy that controls which domains can make requests to the API. Managed by `django-cors-headers`. |
| **`wsgi.py` / `asgi.py`** | Entry points for deploying a Django application on a WSGI or ASGI-compatible server. |

---

## API & REST

| Term | Definition |
|------|------------|
| **REST** | Representational State Transfer — an architectural style for building APIs using standard HTTP methods. |
| **Endpoint** | A URL that the API exposes to perform a specific operation (e.g., `GET /api/movies/`). |
| **HTTP Methods** | Standard verbs used in REST: `GET` (read), `POST` (create), `PUT/PATCH` (update), `DELETE` (delete). |
| **Status Code** | A numeric HTTP response code indicating the result: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found. |
| **JSON** | JavaScript Object Notation — the data format used for API requests and responses. |
| **Router** | A DRF utility that automatically generates URL patterns for a ViewSet (e.g., `DefaultRouter`). |
| **Query Parameter** | A URL parameter used to filter results, e.g., `?movie_id=3` or `?search=inception`. |
| **Upsert** | A create-or-update operation — in this project, submitting a rating for a movie already rated updates the existing one instead of creating a duplicate. |
| **Pagination** | Splitting large API responses into pages to limit data returned per request. |
| **OpenAPI / Swagger** | A specification and UI for documenting and testing REST APIs. Used via `drf-spectacular` in this project at `/api/schema/swagger-ui/`. |

---

## Authentication & Security

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token — a compact, self-contained token used to authenticate API requests without server-side sessions. |
| **Access Token** | A short-lived JWT sent with each API request in the `Authorization: Bearer <token>` header to prove identity. |
| **Refresh Token** | A longer-lived JWT used to obtain a new access token without re-entering credentials. |
| **`simplejwt`** | The Django library (`djangorestframework-simplejwt`) used to generate and validate JWTs. |
| **Axios Interceptor** | A frontend mechanism that automatically attaches the access token to every API request and refreshes it when expired. |
| **`IsAuthenticated`** | A DRF permission class that requires the request to include a valid JWT. |
| **`IsAuthenticatedOrReadOnly`** | A DRF permission class that allows unauthenticated users to read (GET) but requires authentication for write operations. |
| **`IsAdminOrReadOnly`** | A custom permission class in this project that restricts write access on movies to `is_staff=True` users. |
| **`IsOwnerOrReadOnly`** | A custom permission class that allows only the owner of an object (rating or comment) to modify or delete it. |
| **`has_object_permission()`** | A DRF method called for object-level permission checks (e.g., verifying `obj.user == request.user`). |

---

## Database

| Term | Definition |
|------|------------|
| **PostgreSQL** | The relational database used in this project (`movie_catalog` database). |
| **`psycopg2`** | The Python adapter used by Django to communicate with PostgreSQL. |
| **Primary Key (PK)** | A unique identifier for each record in a table, automatically assigned by Django as `id`. |
| **Foreign Key (FK)** | A field that references the primary key of another table, creating a relationship (e.g., `Rating.movie` → `Movie`). |
| **Unique Constraint** | A database rule that prevents duplicate entries — used to ensure a user can only rate a given movie once. |
| **Cascade Delete** | When a parent object (e.g., a Movie) is deleted, all related child objects (ratings, comments) are automatically deleted too. |
| **Fixture** | A file containing pre-loaded data (e.g., `movies.json`) used to seed the database for development or testing. |
| **`.env`** | A file containing environment variables (database credentials, secret keys) that are not committed to version control. |

---

## Frontend — React

| Term | Definition |
|------|------------|
| **React** | A JavaScript library for building user interfaces using reusable components. |
| **Vite** | A fast frontend build tool used to initialize and bundle the React project. |
| **TailwindCSS** | A utility-first CSS framework used for styling the frontend. |
| **Component** | A reusable UI building block in React (e.g., `MovieCard`, `StarRating`, `CommentSection`, `Navbar`). |
| **Router** | A React library (`react-router-dom`) used to handle navigation between pages without full page reloads. |
| **Axios** | A JavaScript HTTP client used to make API requests from the frontend to the Django backend. |
| **JWT Token Storage** | The method used to store access and refresh tokens on the frontend (e.g., `localStorage` or `httpOnly` cookies). |
| **StarRating** | A custom React component allowing users to select a score from 1 to 5 stars and submit it to the API. |
| **Admin Dashboard** | A frontend page accessible to staff users to add, edit, and delete movies via the API. |
| **Loading State** | A UI feedback mechanism shown while an API request is in progress. |
| **Error Handling** | Displaying user-friendly messages when API calls return 400/401/403/404 errors. |

---

## Version Control — Git

| Term | Definition |
|------|------------|
| **Git** | A distributed version control system used to track code changes. |
| **GitHub** | The cloud platform used to host the project repository. |
| **Branch** | An isolated line of development. This project uses: `main`, `dev`, `backend`, `frontend`. |
| **`main`** | The production-ready branch — only stable, tested code is merged here. |
| **`dev`** | The integration branch where backend and frontend are merged together for testing. |
| **`backend`** | The branch where all backend (Django) development takes place. |
| **`frontend`** | The branch where all frontend (React) development takes place. |
| **Pull Request (PR)** | A request to merge code from one branch into another, including a peer review step. |
| **Merge** | Combining changes from one branch into another. |
| **Merge Conflict** | A situation where two branches have made conflicting changes to the same file, requiring manual resolution. |
| **Commit** | A saved snapshot of code changes with a descriptive message. |

---

## Testing & QA

| Term | Definition |
|------|------------|
| **Unit Test** | A test that verifies a single, isolated piece of logic (e.g., `average_rating()` on the Movie model). |
| **Integration Test** | A test that verifies multiple components work together (e.g., a user registers and receives a JWT). |
| **`APITestCase`** | A Django REST Framework test class that provides tools for testing API endpoints with authentication. |
| **`setUp()`** | A test method that runs before each test to create the necessary data fixtures. |
| **End-to-End (E2E) Test** | A test that simulates a complete user flow from the frontend through the backend to the database. |
| **`python manage.py test apps`** | The command used to run all backend tests across all four apps. |
| **DRF Spectacular (Swagger UI)** | The interactive API documentation tool used for manual endpoint testing at `/api/schema/swagger-ui/`. |

---

## Tools & Libraries

| Tool / Library | Role |
|----------------|------|
| **Django 5.x** | Backend web framework |
| **Django REST Framework** | API toolkit |
| **djangorestframework-simplejwt** | JWT authentication |
| **django-cors-headers** | CORS policy management |
| **drf-spectacular** | OpenAPI/Swagger documentation |
| **psycopg2-binary** | PostgreSQL adapter |
| **python-dotenv** | `.env` file loader |
| **Pillow** | Image processing |
| **React + Vite** | Frontend framework and build tool |
| **TailwindCSS** | CSS utility framework |
| **Axios** | HTTP client for API calls |
| **PostgreSQL** | Relational database |
| **Git + GitHub** | Version control and collaboration |


