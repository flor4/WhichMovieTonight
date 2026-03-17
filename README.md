# 🎬 WhichMovieTonight

**WhichMovieTonight** is a responsive web application designed to help users quickly find a movie to watch without wasting time browsing across multiple streaming platforms.  
The goal is to centralize **movie information**, **community reviews**, and **streaming availability** in one place.

---

## Team

- **Flora Salanson** - Backend Developer  
  APIs, database design, business logic, security

- **Moussa Elisoltanov** - Frontend Developer  
  UI/UX, API integration, responsive design

We have previously collaborated on several technical projects (Binary Trees, Simple Shell, Hbnb), which allows us to work efficiently with clearly defined roles.

---

##  Project Concept

Choosing a movie can quickly become frustrating due to:
- too many platforms
- too many choices
- scattered information

**WhichMovieTonight** provides a simple solution:  
👉 **a single platform** to quickly decide what to watch tonight.

---

##  Problem Statement

Users spend too much time browsing multiple platforms just to find a movie to watch.

---

##  Proposed Solution

A centralized web application that allows users to:

- Browse a **movie catalog**
- Read **community ratings and comments**
- Check **streaming availability** (Netflix, Prime Video, Disney+)
- Make informed decisions on where to watch

---

## Target Users

- Movie enthusiasts
- Casual viewers
- Streaming platform subscribers
- Anyone looking for quick movie recommendations

---

## Application Type

- Responsive Web Application
- Mobile-first
- Accessible on desktop, tablet, and mobile devices

---

## 🏗️ Application Architecture

WhichMovieTonight follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Frontend (React + TailwindCSS)             │   │
│  │  - Responsive UI Components                          │   │
│  │  - Movie Catalog Display                             │   │
│  │  - User Authentication Forms                         │   │
│  │  - Rating & Comment Interface                        │   │
│  │  - Streaming Platform Indicators                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
                    HTTP/HTTPS REST API
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Backend REST API Server                 │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Authentication & Authorization Module         │  │   │
│  │  │  - User registration & login                   │  │   │
│  │  │  - Session/JWT management                      │  │   │
│  │  │  - Password hashing & security                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Movie Management Module                       │  │   │
│  │  │  - Movie CRUD operations                       │  │   │
│  │  │  - Search & filtering                          │  │   │
│  │  │  - Genre & cast management                     │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Rating & Comment Module                       │  │   │
│  │  │  - User ratings (1-5 stars)                    │  │   │
│  │  │  - Comments & reviews                          │  │   │
│  │  │  - Average rating calculation                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Streaming Availability Module                 │  │   │
│  │  │  - Streaming platform flags                    │  │   │
│  │  │  - Netflix, Disney+, Prime Video               │  │   │
│  │  │  - Availability filtering                      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
                        SQL Queries
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Relational Database (PostgreSQL/MySQL)       │   │
│  │  - Users                                             │   │
│  │  - Movies (with streaming flags)                     │   │
│  │  - Ratings                                           │   │
│  │  - Comments                                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Separation of Concerns**: Each layer has a specific responsibility
- **API-First Design**: Frontend communicates exclusively through REST API
- **Stateless Backend**: Authentication via JWT tokens
- **Data Fixtures**: Movie catalog loaded from JSON fixtures
- **Scalability**: Modular design allows for horizontal scaling

---

## 📊 Database Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
├─────────────────────────────────────────────────────────────────┤
│ PK │ user_id         │ INT          │ AUTO_INCREMENT            │
│    │ username        │ VARCHAR(50)  │ UNIQUE, NOT NULL          │
│    │ email           │ VARCHAR(100) │ UNIQUE, NOT NULL          │
│    │ password_hash   │ VARCHAR(255) │ NOT NULL                  │
│    │ created_at      │ TIMESTAMP    │ DEFAULT CURRENT_TIMESTAMP │
│    │ updated_at      │ TIMESTAMP    │ ON UPDATE                 │
│    │ is_active       │ BOOLEAN      │ DEFAULT TRUE              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1
                              │
                              │ *
                    ┌─────────┴─────────┐
                    │                   │
┌───────────────────▼────────┐  ┌───────▼──────────────────────┐
│       RATINGS              │  │        COMMENTS               │
├────────────────────────────┤  ├───────────────────────────────┤
│ PK │ rating_id   │ INT    │  │ PK │ comment_id    │ INT      │
│ FK │ user_id     │ INT    │  │ FK │ user_id       │ INT      │
│ FK │ movie_id    │ INT    │  │ FK │ movie_id      │ INT      │
│    │ score       │ INT    │  │    │ text          │ TEXT     │
│    │ created_at  │ TS     │  │    │ created_at    │ TS       │
│    │ updated_at  │ TS     │  │    │ updated_at    │ TS       │
│    │             │        │  │    │               │          │
│    │ UNIQUE(user,movie)  │  └───────────────────────────────┘
└────────────────────────────┘            │
         │                                │
         │ *                              │ *
         │ 1                              │ 1
         └────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                          MOVIES                                  │
├──────────────────────────────────────────────────────────────────┤
│ PK │ movie_id           │ INT          │ AUTO_INCREMENT          │
│    │ title              │ VARCHAR(255) │ NOT NULL                │
│    │ synopsis           │ TEXT         │                         │
│    │ genre              │ VARCHAR(100) │                         │
│    │ release_date       │ DATE         │                         │
│    │ cast               │ TEXT         │ Comma-separated list    │
│    │ poster_url         │ URLField(500)│                         │
│    │ backdrop_url       │ URLField(500)│                         │
│    │ trailer_url        │ URLField(500)│ Nullable                │
│    │ netflix_available  │ BOOLEAN      │ DEFAULT FALSE           │
│    │ disney_plus_available│ BOOLEAN    │ DEFAULT FALSE           │
│    │ prime_video_available│ BOOLEAN    │ DEFAULT FALSE           │
│    │ created_at         │ TIMESTAMP    │ AUTO_NOW_ADD            │
│    │ updated_at         │ TIMESTAMP    │ AUTO_NOW                │
│    │                    │              │                         │
│    │ Methods: average_rating(), rating_count(), get_cast_list()  │
└──────────────────────────────────────────────────────────────────┘

INDEXES:
- users(email), users(username)
- movies(title), movies(genre), movies(release_date)
- ratings(user_id, movie_id), ratings(movie_id)
- comments(movie_id), comments(user_id)

CONSTRAINTS:
- ratings.score: CHECK (score >= 1 AND score <= 5)
- UNIQUE(movie, user) on ratings table
- Cascade delete: ratings/comments when movie or user is deleted
```

### Database Design Principles

- **Normalization**: Minimize data redundancy (3NF)
- **Referential Integrity**: Foreign keys with proper constraints
- **Performance Optimization**: Strategic indexes on frequently queried columns
- **Computed Fields**: Average rating and rating count calculated via model methods
- **Scalability**: Designed for growth (initial catalog loaded from fixtures)

---

## 📚 Documentation

For detailed technical documentation, see:
- [Complete Technical Documentation](https://github.com/MElisoltanov/WhichMovieTonight/tree/main/DOCUMENTATION)
- [Stage 3: Architecture & Database Details](https://github.com/MElisoltanov/WhichMovieTonight/blob/main/DOCUMENTATION/stage3.md)

---

## MVP Features

Core features planned for the first release:

- 🎞️ **Movie Catalog**  
  - Title, synopsis, genre, cast, average rating  
  - Curated collection of popular movies

- 🔐 **User Accounts**  
  - Secure signup and login  
  - Authentication system

- ⭐ **Ratings & Comments**  
  - Authenticated users can rate and comment on movies

- 📺 **Streaming Availability**  
  - Display which platforms have the movie (Netflix, Disney+, Prime Video)
  - Clear availability indicators

- 🎬 **Movie Trailers**
  - Embedded YouTube trailers when available

---

## Optional Features (Post-MVP)

- Simple community forum or chat
- Badge system for active users
- Add to favorites
- Likes on reviews
- User watchlists

---

## Out of Scope Features

- AI-based recommendations
- Private messaging
- Friend system
- Advanced watchlists or playlists

---

## Risks & Mitigation

- **Data maintenance** for movie catalog and streaming availability  
  → Mitigation: fixtures system for initial data, admin panel for updates

- **Scope creep**  
  → Mitigation: strict MVP prioritization

- **Performance with growing dataset**  
  → Mitigation: database indexing and pagination

---

## Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **React Router DOM** 7.12.0 - Client-side routing
- **Axios** 1.13.2 - HTTP client for API calls
- **TailwindCSS** 3.3 - Utility-first CSS framework
- **Vite** 7.2.4 - Build tool and dev server

### Backend
- **Django** 5.2.10 - Web framework
- **Django REST Framework** 3.16.1 - REST API toolkit
- **SimpleJWT** 5.5.1 - JWT authentication
- **CORS Headers** - Cross-origin resource sharing
- **drf-spectacular** - API documentation

### Database
- **PostgreSQL** - Relational database (psycopg2-binary 2.9.11)

### Development Tools
- **Python dotenv** - Environment variables
- **Pillow** - Image processing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/MElisoltanov/WhichMovieTonight.git
cd WhichMovieTonight
```

### 2. Backend Setup

#### Create and activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Configure the database

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE whichmovietonight;

# Exit psql
\q
```

**Optional:** Create a `.env` file in the `backend/` directory for custom database settings:

```bash
# backend/.env
DB_NAME=whichmovietonight
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
```

#### Run migrations

```bash
python manage.py migrate
```

#### Load initial movie data

```bash
python manage.py loaddata apps/movies/fixtures/movies.json
```

#### Create a superuser (optional)

```bash
python manage.py createsuperuser
```

#### Start the backend server

```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

#### Install Node.js dependencies

```bash
npm install
```

#### Start the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin (if you created a superuser)
- **API Documentation**: http://localhost:8000/api/schema/swagger-ui/

### 5. Create Your First Account

1. Open http://localhost:5173 in your browser
2. Click on "Sign Up" to create a new account
3. Log in with your credentials
4. Start exploring movies, rating, and commenting!

---

## Expected Outcome

By the end of the project, **WhichMovieTonight** will provide a smooth and efficient experience to:
- discover movies
- read reliable community reviews
- instantly know where to watch a movie

---

Here is a link to the landing page : https://melisoltanov.github.io/LandingPage/

---

🎬 *WhichMovieTonight — Spend less time searching, more time watching.*

Made with ❤️ and fun by an awesome team Moussa and Flora, for Holberton School portfolio project😎🍿

---
