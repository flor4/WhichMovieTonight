# Technical Revision Sheet — WhichMovieTonight

This document covers all key technical concepts applied in the WhichMovieTonight MVP, structured as a revision guide.

---

## Table of Contents

1. [Database Relations](#1-database-relations)
2. [Authentication & JWT](#2-authentication--jwt)
3. [Password Hashing & Security](#3-password-hashing--security)
4. [RBAC — Role-Based Access Control](#4-rbac--role-based-access-control)
5. [REST API Design](#5-rest-api-design)
6. [Frontend Design & Architecture](#6-frontend-design--architecture)
7. [Data Validation & Serialization](#7-data-validation--serialization)
8. [Database Integrity & Constraints](#8-database-integrity--constraints)
9. [CORS & API Security](#9-cors--api-security)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Database Relations

### Relational Model Overview

The database uses **PostgreSQL** with 4 main entities managed by Django's ORM:

```
User (Django built-in)
 ├── has many → Ratings  (one User, many Ratings)
 └── has many → Comments (one User, many Comments)

Movie
 ├── has many → Ratings  (one Movie, many Ratings)
 └── has many → Comments (one Movie, many Comments)

Rating → belongs to one User AND one Movie
Comment → belongs to one User AND one Movie
```

### Foreign Keys

A **Foreign Key (FK)** is a field that links a record in one table to a record in another.

```python
# In Rating model
movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='ratings')
user  = models.ForeignKey(User,           on_delete=models.CASCADE, related_name='user_ratings')
```

- `on_delete=models.CASCADE` → if the Movie or User is deleted, all related Ratings are **automatically deleted** too.
- `related_name='ratings'` → allows reverse access: `movie.ratings.all()` to get all ratings for a movie.

### One-to-Many vs Many-to-Many

| Relation | Example in this project |
|----------|------------------------|
| **One-to-Many** | One Movie has many Ratings. One User has many Comments. |
| **Many-to-Many** | Not used directly — Rating acts as a join table between User and Movie. |

### Reverse Access & ORM Queries

```python
# Get all ratings for a specific movie
movie.ratings.all()

# Get average rating using aggregate
from django.db.models import Avg
movie.ratings.aggregate(Avg('score'))  # → {'score__avg': 4.2}

# Get all comments for a movie, preloading user data (avoids N+1)
Comment.objects.select_related('user', 'movie').filter(movie_id=3)
```

### N+1 Problem

When fetching a list of comments, accessing `comment.user.username` for each comment without preloading triggers a separate SQL query per comment. `select_related()` solves this by performing a single JOIN query.

---

## 2. Authentication & JWT

### What is JWT?

**JSON Web Token (JWT)** is a stateless authentication mechanism. Instead of storing sessions on the server, the server issues a signed token that the client stores and sends with every request.

A JWT has 3 parts: `header.payload.signature`

```
eyJhbGci...  ← Header (algorithm)
.eyJ1c2Vy... ← Payload (user data: id, is_staff, exp)
.XJ3mN2...   ← Signature (verifies integrity)
```

### Token Flow in WhichMovieTonight

```
1. User registers or logs in
        ↓
2. Server validates credentials
        ↓
3. Server returns: { access_token, refresh_token }
        ↓
4. Client stores tokens (localStorage or cookies)
        ↓
5. Client sends: Authorization: Bearer <access_token> on every request
        ↓
6. When access_token expires → Axios Interceptor sends refresh_token
        ↓
7. Server returns a new access_token
```

### Implementation

```python
# On registration, tokens are generated immediately
refresh = RefreshToken.for_user(user)
return Response({
    'access': str(refresh.access_token),   # short-lived (~5 min)
    'refresh': str(refresh),               # long-lived (~24h)
})
```

### Logout — Token Blacklisting

When a user logs out, the **refresh token is blacklisted** on the server to prevent it from being reused:

```python
token = RefreshToken(refresh_token)
token.blacklist()  # stored in the DB, rejected on future attempts
```

This is important because JWTs are stateless by nature — blacklisting is the mechanism that makes logout effective.

---

## 3. Password Hashing & Security

### Hashing vs Encryption

| | Hashing | Encryption |
|--|---------|------------|
| **Reversible?** | No | Yes (with key) |
| **Used for passwords?** | ✅ Yes | ❌ No |
| **Example** | bcrypt, PBKDF2 | AES, RSA |

Passwords must **never be stored in plain text**. Django automatically hashes passwords using **PBKDF2 with SHA-256** via `create_user()`.

### Implementation

```python
# create_user() hashes the password automatically
user = User.objects.create_user(username=..., password=..., email=...)
```

### Password Validation at Registration

```python
from django.contrib.auth.password_validation import validate_password

password = serializers.CharField(
    write_only=True,
    validators=[validate_password]  # enforces Django's built-in password rules
)
```

Django's built-in validators check for:
- Minimum length
- Common passwords (e.g., "password123" is rejected)
- Numeric-only passwords
- Similarity to username

### Password Confirmation

```python
def validate(self, attrs):
    if attrs['password'] != attrs['password2']:
        raise serializers.ValidationError({"password": "Passwords do not match."})
    return attrs
```

The `password2` field is `write_only=True` — it is used only for validation and **never returned** in any response.

---

## 4. RBAC — Role-Based Access Control

### What is RBAC?

**Role-Based Access Control** is a security model where permissions are granted based on the **role** of a user rather than their individual identity.

### Roles in WhichMovieTonight

| Role | Condition | Permissions |
|------|-----------|-------------|
| **Anonymous** | Not logged in | Read movies, ratings, comments |
| **Regular User** | `is_staff=False`, authenticated | + Create ratings & comments, edit/delete own |
| **Admin / Staff** | `is_staff=True` | + Full CRUD on movies |

### Custom Permission Classes

**`IsAdminOrReadOnly`** — applied to the Movie API:
```python
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff   # write = staff only
```

**`IsOwnerOrReadOnly`** — applied to Ratings and Comments:
```python
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user  # only the owner can edit/delete
```

### Two Levels of Permission Checks

| Level | Method | When it runs |
|-------|--------|-------------|
| **View-level** | `has_permission()` | Before any object is fetched — checks if the user can access the view at all |
| **Object-level** | `has_object_permission()` | On retrieve/update/delete — checks if the user can act on this specific object |

---

## 5. REST API Design

### API Endpoints Summary

| Resource | Endpoint | Methods | Who |
|----------|----------|---------|-----|
| Auth | `POST /api/auth/register/` | POST | Anyone |
| Auth | `POST /api/auth/login/` | POST | Anyone |
| Auth | `POST /api/auth/logout/` | POST | Authenticated |
| Auth | `GET /api/auth/user/` | GET | Authenticated |
| Movies | `GET /api/movies/` | GET | Anyone |
| Movies | `POST/PUT/DELETE /api/movies/` | Write | Staff only |
| Ratings | `GET /api/ratings/` | GET | Anyone |
| Ratings | `POST /api/ratings/` | POST | Authenticated |
| Ratings | `PUT/DELETE /api/ratings/{id}/` | Write | Owner only |
| Comments | `GET /api/comments/` | GET | Anyone |
| Comments | `POST /api/comments/` | POST | Authenticated |
| Comments | `PUT/DELETE /api/comments/{id}/` | Write | Owner only |

### Upsert Pattern (Ratings)

A user can only rate a movie once (enforced by DB constraint). The API handles this gracefully:

```python
def create(self, request, *args, **kwargs):
    existing = Rating.objects.filter(movie_id=movie_id, user=request.user).first()
    if existing:
        # Update instead of creating a duplicate → returns 200 OK
        serializer = self.get_serializer(existing, data=request.data, partial=True)
        serializer.save()
        return Response(serializer.data, status=HTTP_200_OK)
    return super().create(...)  # creates new → returns 201 Created
```

### Filtering via Query Parameters

```
GET /api/ratings/?movie_id=5    → all ratings for movie 5
GET /api/comments/?movie_id=5   → all comments for movie 5
GET /api/movies/?search=inception → search by title/genre/cast/synopsis
```

---

## 6. Frontend Design & Architecture

### Component Architecture

The frontend follows a **component-based architecture** with React:

```
App
├── Navbar              ← auth state (login/logout/username)
├── MovieList           ← catalog grid with MovieCard components
│   └── MovieCard       ← poster, title, genre, avg rating badges
├── MovieDetail         ← full movie page
│   ├── StreamingBadges ← Netflix / Disney+ / Prime availability
│   ├── StarRating      ← 1–5 star input + submit
│   └── CommentSection  ← list + add/edit/delete own comments
└── AdminDashboard      ← staff-only: add/edit/delete movies
```

### Responsive Design

- Built with **TailwindCSS** utility classes
- Grid layout adapts from 1 column (mobile) to 4 columns (desktop)
- Loading skeletons shown during API calls

### JWT on the Frontend

The Axios interceptor pattern ensures the access token is:
1. Automatically attached to every request header
2. Silently refreshed when expired, without interrupting the user

```js
// Attach token to every request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
axios.interceptors.response.use(null, async error => {
  if (error.response.status === 401) {
    const refresh = localStorage.getItem('refresh');
    const { data } = await axios.post('/api/auth/token/refresh/', { refresh });
    localStorage.setItem('access', data.access);
    return axios(error.config); // retry original request
  }
});
```

---

## 7. Data Validation & Serialization

### What is a Serializer?

A DRF Serializer converts between:
- **Python objects → JSON** (for API responses)
- **JSON → Python objects** (for incoming requests, with validation)

### Field-level vs Object-level Validation

```python
# Object-level validation (cross-field check)
def validate(self, attrs):
    if attrs['password'] != attrs['password2']:
        raise serializers.ValidationError(...)
    if User.objects.filter(email=attrs['email']).exists():
        raise serializers.ValidationError(...)
    return attrs
```

### `read_only_fields` — Protecting Server-side Data

```python
read_only_fields = ['user', 'created_at', 'updated_at']
```

These fields are **included in responses** but **cannot be set by the client**. The `user` field is critical: without this, a client could submit a rating pretending to be another user.

### `write_only` Fields

```python
password  = serializers.CharField(write_only=True)
password2 = serializers.CharField(write_only=True)
```

These fields are **accepted in requests** but **never returned** in responses — passwords must never appear in API output.

---

## 8. Database Integrity & Constraints

### Unique Constraint — One Rating Per User Per Movie

```python
class Meta:
    constraints = [
        models.UniqueConstraint(
            fields=['movie', 'user'],
            name='unique_movie_user_rating'
        )
    ]
```

This is enforced at the **database level**, meaning even if application logic fails, the DB will reject duplicate entries with an integrity error.

### Cascade Delete

```python
movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
user  = models.ForeignKey(User,  on_delete=models.CASCADE)
```

If a Movie is deleted → all its Ratings and Comments are deleted automatically.  
If a User is deleted → all their Ratings and Comments are deleted automatically.

This maintains **referential integrity** — no orphaned records in the database.

### Ordering

```python
class Meta:
    ordering = ['-created_at']  # most recent first
```

Default ordering applied automatically to all queries on that model.

---

## 9. CORS & API Security

### What is CORS?

**Cross-Origin Resource Sharing** is a browser security mechanism that blocks requests from a different origin (domain/port) than the server.

Since the React frontend (`localhost:5173`) calls the Django backend (`localhost:8000`), CORS must be explicitly configured:

```python
# settings.py
INSTALLED_APPS = [..., 'corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React dev server
]
```

### Other Security Practices Applied

| Practice | How |
|----------|-----|
| Passwords never stored plain | Django `create_user()` hashes automatically |
| Passwords never returned by API | `write_only=True` on serializer fields |
| Users can't spoof ownership | `user` is `read_only`, set server-side in `perform_create()` |
| Logout invalidates tokens | Refresh token blacklisting via `simplejwt` |
| Admin routes protected | `IsAdminOrReadOnly` custom permission class |
| Sensitive config in `.env` | `SECRET_KEY`, DB credentials never committed to Git |

---

## 10. Testing Strategy

### Pyramid of Tests Applied

```
        [E2E / Manual]       ← Swagger UI + Browser testing
       [Integration Tests]   ← APITestCase: full request → DB → response
      [Unit Tests]           ← Model methods: average_rating(), get_cast_list()
```

### Unit Test Example

```python
def test_average_rating_with_ratings(self):
    self.movie.ratings.create(score=4, user=self.user)
    user2 = User.objects.create_user(username="user2", password="pass")
    self.movie.ratings.create(score=5, user=user2)
    self.assertEqual(self.movie.average_rating(), 4.5)
```

### Integration Test Example

```python
def test_register_user(self):
    response = self.client.post('/api/auth/register/', {
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'newpass123',
        'password2': 'newpass123'
    }, format='json')
    self.assertEqual(response.status_code, 201)
    self.assertIn('access', response.data)   # JWT returned
    self.assertIn('refresh', response.data)
```

### What Was Tested

| App | Tests cover |
|-----|-------------|
| **Authentication** | Register, login, duplicate email, password mismatch, JWT returned |
| **Movies** | Model fields, CRUD API, admin-only write access, search filtering |
| **Ratings** | Unique constraint, average calculation, owner-only update/delete, upsert |
| **Comments** | Create/edit/delete, owner-only permissions, cascade on movie delete |

### Run All Tests

```bash
cd backend
python manage.py test apps
```
