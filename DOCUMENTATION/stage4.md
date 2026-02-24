# Portfolio Project - MVP Development

---

## Table of Contents

1. [Plan and Define Sprints](#1-plan-and-define-sprints)
   - [Sprint 1 — Foundation & Authentication](#sprint-1--foundation--authentication)
   - [Sprint 2 — Movie Catalog Core](#sprint-2--movie-catalog-core)
   - [Sprint 3 — Ratings, Comments & Admin Dashboard](#sprint-3--ratings-comments--admin-dashboard)
   - [Sprint 4 — Integration, Testing & Polish](#sprint-4--integration-testing--polish)
   - [Summary Table](#summary-table)
   - [Key Rules](#key-rules-from-the-guide)
2. [Execute Development Tasks](#1-execute-development-tasks)
   - [Development](#1-development)
   - [Source Code Management (SCM)](#2-source-code-management-scm)
   - [Testing (QA)](#3-testing-qa)
3. [Monitor Progress and Adjust](#monitor-progress-and-adjust)
   - [Communication & Stand-ups](#communication--stand-ups)
   - [Task & Progress Tracking](#task--progress-tracking)
   - [Issue & Bug Handling](#issue--bug-handling)
   - [Metrics & Progress](#metrics--progress)
   - [Reflection](#reflection)
4. [Conduct Sprint Reviews and Retrospectives](#2-conduct-sprint-reviews-and-retrospectives)
5. [Integration Testing & Quality Assurance](#4-integration-testing--quality-assurance)
   - [End-to-End Integration Tests](#end-to-end-integration-tests)
   - [Testing Tools](#testing-tools)
   - [Bug Fixes & Critical Issues](#bug-fixes--critical-issues)
   - [Database Validation](#database-validation)

---

# 1. Plan and Define Sprints

## Overview

**Project:** WhichMovieTonight  
**Duration:** January 12 – March 6, 2026  
**Team:** Moussa Elisoltanov (Frontend) | Flora Salanson (Backend) 
**Methodology:** Agile/Scrum adapted for 2-person team  
**Sprint Length:** 2 weeks
---

## Sprint 1 — Foundation & Authentication

**Duration:** January 12 → January 18, 2026
**Goal:** Project setup functional, database running, auth endpoints and auth UI ready.

### MoSCoW Prioritization

| Priority | Task | Owner | Branch | Dependency |
|----------|------|-------|--------|------------|
| **Must Have** | Install tools (Python, Node, PostgreSQL, Git) | Both | — | — |
| **Must Have** | Initialize repo, create branches (main / dev / backend / frontend) | Both | main | — |
| **Must Have** | Create Django project + 4 apps (movies, ratings, comments, authentication) | Flora | `feat/flora-django-init` | Tools installed |
| **Must Have** | Configure settings.py (DB, CORS, JWT, DRF) | Flora | `feat/flora-django-init` | Django project created |
| **Must Have** | Configure PostgreSQL (database `movie_catalog`) | Flora | `feat/flora-django-init` | PostgreSQL installed |
| **Must Have** | Implement JWT auth endpoints (register, login, logout, user info) | Flora | `feat/flora-auth-jwt` | settings.py configured |
| **Must Have** | Initialize React project (Vite + TailwindCSS) | Moussa | `feat/moussa-react-init` | Node installed |
| **Must Have** | Create Login & Signup pages with form validation | Moussa | `feat/moussa-auth-forms` | React project init |
| **Must Have** | Implement JWT token storage + Axios interceptors (auto-refresh) | Moussa | `feat/moussa-auth-forms` | Auth endpoints ready |
| **Should Have** | Create Navbar with auth links (Login / Logout / Profile) | Moussa | `feat/moussa-navbar` | Auth forms done |
| **Won't Have** | Admin dashboard | — | — | Sprint 3 |

**Dependencies:**
- Moussa cannot test real auth flow until Flora's JWT endpoints are deployed locally
- Both must align on API contract (URL, request/response shape) before Moussa starts integration

**Sprint 1 Deliverable:** App launches, user can register, log in, and see their name in the navbar. JWT tokens are stored and refreshed automatically.

---

## Sprint 2 — Movie Catalog Core

**Duration:** January 19 → February 2, 2026
**Goal:** Full movie catalog visible and browsable, movie detail page complete.

| Priority | Task | Owner | Branch | Dependency |
|----------|------|-------|--------|------------|
| **Must Have** | Create Movie model (all fields including streaming availability) | Flora | `feat/flora-movie-model` | Sprint 1 done |
| **Must Have** | Create Movie serializer + CRUD API endpoints | Flora | `feat/flora-movies-api` | Movie model |
| **Must Have** | Run migrations, seed database with sample movies | Flora | `feat/flora-movie-model` | Movie model |
| **Must Have** | Movie list page (catalog grid/list with poster, title, genre) | Moussa | `feat/moussa-movie-list` | Movies API ready |
| **Must Have** | Movie detail page (poster, synopsis, cast, release date, trailer) | Moussa | `feat/moussa-movie-detail` | Movies API ready |
| **Must Have** | Display streaming availability badges (Netflix / Disney+ / Prime) | Moussa | `feat/moussa-movie-detail` | Movie detail page |
| **Should Have** | Search bar with filtering by title / genre | Moussa | `feat/moussa-search` | Movie list page |
| **Should Have** | Pagination for movie list | Flora | `feat/flora-movies-api` | Movies API |
| **Could Have** | Movie poster lazy loading / skeleton loaders | Moussa | `feat/moussa-movie-list` | Movie list page |
| **Won't Have** | Comment section | — | — | Sprint 3 |

**Dependencies:**
- Moussa waits for Flora's `/api/movies/` endpoint before building the catalog pages
- Flora and Moussa must agree on the JSON structure of the Movie object

**Sprint 2 Deliverable:** User can browse, search, and open any movie's detail page. Streaming availability is visible.

---

## Sprint 3 — Ratings, Comments & Admin Dashboard

**Duration:** February 3 → February 16, 2026
**Goal:** Authenticated users can interact with movies (rate, comment). Admin can manage content.

| Priority | Task | Owner | Branch | Dependency |
|----------|------|-------|--------|------------|
| **Must Have** | Create Rating model + API (POST/GET ratings, avg score) | Flora | `feat/flora-ratings-api` | Sprint 2 done |
| **Must Have** | Create Comment model + API (CRUD, owner-only edit/delete) | Flora | `feat/flora-comments-api` | Sprint 2 done |
| **Must Have** | Star rating component (1–5 stars, submit/update) | Moussa | `feat/moussa-star-rating` | Ratings API ready |
| **Must Have** | Comment section (list, add, edit, delete own comments) | Moussa | `feat/moussa-comment-section` | Comments API ready |
| **Must Have** | Admin dashboard page (list movies, add/edit/delete) | Moussa | `feat/moussa-dashboard` | Movie CRUD API |
| **Should Have** | Fix permissions: only admin can manage movies, users manage own comments | Flora | `fix/flora-permission-bug` | Auth + comments/ratings API |
| **Should Have** | Display average rating on movie card and detail page | Moussa | `feat/moussa-movie-detail` | Rating avg in API |
| **Could Have** | Confirm dialog before deleting a comment or movie | Moussa | `feat/moussa-dashboard` | Dashboard |
| **Won't Have** | Email notifications | — | — | Out of scope |

**Dependencies:**
- Star rating component and comment section depend on Flora finishing the respective APIs
- Admin dashboard depends on Movie CRUD being fully functional
- Permission fix must be merged before the dashboard goes live

**Sprint 3 Deliverable:** Full interactive app — users rate and comment, admins manage movies from the dashboard.

---

## Sprint 4 — Integration, Testing & Polish

**Duration:** February 17 → March 1, 2026
**Goal:** Merge everything into `dev`, fix bugs, clean UI, prepare for release on `main`.

| Priority | Task | Owner | Branch | Dependency |
|----------|------|-------|--------|------------|
| **Must Have** | Merge `backend` → `dev`, `frontend` → `dev`, resolve conflicts | Both | dev | Sprint 3 done |
| **Must Have** | End-to-end integration testing (auth, catalog, ratings, comments, dashboard) | Both | dev | Full merge |
| **Must Have** | Bug fixes identified during integration | Both | `fix/*` branches | Integration testing |
| **Must Have** | Create `.env` files + document environment variables | Flora | backend | — |
| **Should Have** | UI polish: responsive design, error messages, loading states | Moussa | `feat/moussa-ui-polish` | All UI features done |
| **Should Have** | API error handling (400/401/403/404 responses on frontend) | Moussa | `feat/moussa-ui-polish` | Integration done |
| **Should Have** | Write README with setup instructions | Both | main | — |
| **Could Have** | Deploy to staging (Render, Railway, or Vercel) | Both | main | All tests pass |
| **Won't Have** | CI/CD pipeline | — | — | Out of scope |

**Sprint 4 Deliverable:** Stable, tested version merged to `main`.

---

## Summary Table

| Sprint | Dates | Focus | Flora | Moussa | Milestone |
|--------|-------|-------|-------|--------|-----------|
| Sprint 1 | Jan 12–18 | Setup + Auth | Django init, JWT API | React init, Auth forms, Navbar | Auth flow working end-to-end |
| Sprint 2 | Jan 19–Feb 2 | Movie Catalog | Movie model + API | Catalog, Detail, Search | Users can browse movies |
| Sprint 3 | Feb 3–16 | Interactions + Admin | Ratings + Comments API, Permissions | Star rating, Comments UI, Dashboard | Full interactive features |
| Sprint 4 | Feb 17–Mar 1 | Integration + Polish | Env config, Bug fixes, README | UI polish, Error handling | v1.0.0 released on `main` |

---

## Key Rules (from the guide)

- Never commit directly to `main` — always go through `dev`
- Create a feature branch for backend and frontend part
- Open a Pull Request into `backend` or `frontend` when the task is done
- Push at end of every day, even if the task is unfinished
- Communicate before merging large features into `dev`.


# 1. Execute Development Tasks

## Sprint Implementation 

**Purpose:** Complete sprint tasks following best practices for coding, version control, and testing.

---

### 1. Development

- We works on our assigned tasks (e.g., adding features, fixing bugs).
- Follow coding standards and add comments if needed.
- Update documentation when changes are made.

---

### 2. Source Code Management (SCM)

- Create a separate branch for each part (backend, frontend and dev).
- When a task is finished:
    - Push the branch to GitHub.
    - Once the backend or frontend branch is completed, merge it into the dev branch to test the integration between both parts.
    - at the very end we push all into the main branch.
---

### 3. Testing (QA)

- Test every new feature thoroughly.
- Use tools like a **swagger (DRF Spectacular)** to test API endpoints.
- Make sure that bug fixes actually resolve the reported issues.


#  Monitor Progress and Adjust

Throughout the WhichMovieTonight project, our team adopted a lightweight, communication-focused approach to monitor progress and address issues.

## Communication & Stand-ups

- We conducted daily check-ins, either in person or via instant messaging (e.g., WhatsApp), to review completed tasks, discuss blockers, and plan the day's work.
- This informal stand-up format suited our two-person team and allowed for quick synchronization without overhead.

## Task & Progress Tracking

- No formal project management or tracking tool was set up (such as Trello or Jira).
- Each member focused on their respective area (Flora: backend / Moussa: frontend), updating each other directly as tasks were completed or new needs arose.
- Adjustments—such as changing priorities or reassigning a task—were made immediately during our discussions.

## Issue & Bug Handling

- Bugs or urgent issues were solved in real time, through immediate messaging or discussion, rather than logged in a tracking system.
- This process was effective given the small team and the rapid response required.

## Metrics & Progress

- Although we did not calculate formal metrics (velocity, bug count, etc.), progress was measured by collective agreement: almost all sprint objectives and features were delivered on time.
- As the project approached completion, only minor tasks or improvements remained.

## Reflection

- This informal, communication-driven method was optimal for our small, fast-moving team.
- For future, larger-scale or more complex projects, we would recommend adding written traceability or using a project management tool for greater transparency and historical reference.


# 2 Conduct Sprint Reviews and Retrospectives


Overall, the sprints went smoothly and allowed us to achieve the planned objectives on time, even if we sometimes had to adjust the sprint depending on our schedule. Collaboration and communication were effective, enabling quick resolution of issues as they arose.

The main challenge encountered was the need to quickly learn new languages and technologies to deliver the project. This accelerated learning sometimes slowed down certain tasks, but ultimately helped us to upskill and adapt efficiently.

---

# 4. Integration Testing & Quality Assurance

**Purpose:** To ensure all components work together seamlessly and meet quality standards.

## End-to-End Integration Tests

Integration tests were conducted to verify that the React frontend correctly communicates with the Django REST API across all key user flows:

| User Flow | Endpoint(s) | Validated |
|-----------|-------------|-----------|
| User registration & login | `POST /api/auth/register/` `POST /api/auth/login/` | JWT tokens returned, stored in frontend |
| Token refresh | `POST /api/auth/token/refresh/` | Axios interceptor auto-refreshes expired tokens |
| Browse movie catalog | `GET /api/movies/` | Movie list displayed with poster, title, genre |
| View movie detail | `GET /api/movies/{id}/` | Full details, cast, streaming badges displayed |
| Submit a rating | `POST /api/ratings/` | Star rating saved, average updated on detail page |
| Post / edit / delete a comment | `POST /api/comments/` `PATCH /api/comments/{id}/` `DELETE /api/comments/{id}/` | Owner-only edit/delete enforced |
| Admin movie management | `POST/PUT/DELETE /api/movies/` | Admin-only access verified |

## Testing Tools

- **Django `APITestCase`** — automated unit and integration tests for all backend endpoints (`authentication`, `movies`, `ratings`, `comments`)
- **DRF Spectacular (Swagger UI)** — manual endpoint testing at `/api/schema/swagger-ui/` to verify request/response contracts
- **Browser / React DevTools** — manual front-end testing of UI flows, error states, and loading indicators

## Running Backend Tests

```bash
cd backend
python manage.py test apps
```

## Bug Fixes & Critical Issues

- Bugs identified during integration were tracked in real time and fixed on dedicated `fix/*` branches before merging into `dev`.
- Permission issues (admin-only vs. owner-only access) were resolved and re-tested before the final merge to `main`.

## Database Validation

- All CRUD operations (movies, ratings, comments, users) were tested against the PostgreSQL database (`movie_catalog`).
- Edge cases tested: duplicate ratings per user (unique constraint), deleting a movie cascading to its ratings and comments, and unauthenticated access to protected routes.
