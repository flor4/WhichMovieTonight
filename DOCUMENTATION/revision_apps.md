# App File Overview — WhichMovieTonight

A file-by-file breakdown of each Django app and the config package, explaining the role and key logic of every file.

---

## Table of Contents

1. [app: authentication](#app-authentication)
2. [app: movies](#app-movies)
3. [app: ratings](#app-ratings)
4. [app: comments](#app-comments)
5. [config/](#config)

---

## App: `authentication`

This app handles user registration, login, logout, and profile retrieval. It does **not** define a custom User model — it uses Django's built-in `User` model.

---

### `models.py`

```python
# No custom model — Django's built-in User model is used.
```

**Why no custom model?**  
Django's `User` already provides: `username`, `email`, `password` (hashed), `is_staff`, `is_active`, `date_joined`. This is sufficient for the project's needs.

> **Key fields used from Django's User:**
> - `is_staff` → determines if a user can manage movies (RBAC)
> - `password` → stored as a PBKDF2 hash, never plain text

---

### `serializers.py`

**Two serializers:**

| Serializer | Purpose |
|------------|---------|
| `UserSerializer` | Read-only representation of a user (returned in API responses) |
| `RegisterSerializer` | Validates and creates a new user from a POST request |

**`UserSerializer`** — returns: `id`, `username`, `email`, `first_name`, `last_name`, `is_staff`  
`is_staff` is `read_only` → the client can see it but never set it.

**`RegisterSerializer`** — key validation logic:
```python
# password2 is only used for matching — never stored or returned
password  = serializers.CharField(write_only=True, validators=[validate_password])
password2 = serializers.CharField(write_only=True)

def validate(self, attrs):
    if attrs['password'] != attrs['password2']:
        raise ValidationError(...)          # passwords must match
    if User.objects.filter(email=...).exists():
        raise ValidationError(...)          # email must be unique

def create(self, validated_data):
    validated_data.pop('password2')         # remove confirmation field
    return User.objects.create_user(...)    # hashes password automatically
```

---

### `views.py`

**Three views:**

| View | Route | Auth required | What it does |
|------|-------|---------------|--------------|
| `RegisterView` | `POST /api/auth/register/` | No | Creates user, returns JWT tokens |
| `UserInfoView` | `GET /api/auth/user/` | Yes | Returns current user's profile |
| `LogoutView` | `POST /api/auth/logout/` | Yes | Blacklists refresh token |

**RegisterView** extends `generics.CreateAPIView` and overrides `create()` to return JWT tokens immediately after registration — the user is logged in right away without a separate login call.

**LogoutView** uses `simplejwt`'s blacklist mechanism:
```python
token = RefreshToken(refresh_token)
token.blacklist()  # stored in DB as invalid — cannot be reused
```
This is necessary because JWTs are stateless — simply deleting them on the frontend is not enough. Blacklisting invalidates the token server-side.

---

### `urls.py`

```python
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/',     UserInfoView.as_view(), name='user_info'),
    path('logout/',   LogoutView.as_view(),   name='logout'),
]
```

Login (`/api/auth/login/`) and token refresh (`/api/auth/token/refresh/`) are **not here** — they are defined directly in `config/urls.py` using simplejwt's built-in views.

---

### `admin.py`

```python
# Empty — Django's built-in User model is already registered in the admin automatically.
```

---

## App: `movies`

The central app. Manages the movie catalog. Only staff users can create, update, or delete movies. Everyone can read.

---

### `models.py`

**`Movie` model** — main fields:

| Field | Type | Notes |
|-------|------|-------|
| `title` | `CharField` | Max 255 chars |
| `synopsis` | `TextField` | Long-form text |
| `genre` | `CharField` | |
| `release_date` | `DateField` | Orders by `-release_date` by default |
| `cast` | `TextField` | Stored as comma-separated string |
| `poster_url` / `backdrop_url` | `URLField` | Required |
| `trailer_url` | `URLField` | Optional (`blank=True, null=True`) |
| `netflix_available` / `disney_plus_available` / `prime_video_available` | `BooleanField` | Streaming flags |
| `created_at` / `updated_at` | `DateTimeField` | Auto-managed |

**Model methods:**
```python
def get_cast_list(self):
    # "Actor 1, Actor 2" → ["Actor 1", "Actor 2"]
    return [name.strip() for name in self.cast.split(',')]

def average_rating(self):
    # Uses reverse FK: self.ratings.aggregate(Avg('score'))
    result = self.ratings.aggregate(Avg('score'))['score__avg']
    return round(result, 1) if result else None

def rating_count(self):
    return self.ratings.count()
```

`related_name='ratings'` on the `Rating` FK enables `movie.ratings.all()` — this is how reverse FK access works in Django ORM.

---

### `serializers.py`

**Two serializers for performance optimization:**

| Serializer | Used for | Fields returned |
|------------|----------|-----------------|
| `MovieListSerializer` | `GET /api/movies/` (list) | Lightweight: id, title, genre, poster, streaming flags, avg rating |
| `MovieSerializer` | `GET /api/movies/{id}/` (detail) | Full: all fields + cast_list, backdrop, trailer |

**`SerializerMethodField`** — used to expose computed values:
```python
average_rating = serializers.SerializerMethodField()

def get_average_rating(self, obj):
    return obj.average_rating()  # calls the model method
```
These fields are **read-only** and computed at serialization time — they are not stored in the DB.

**`cast_list`** serves the cast as a Python list (frontend-friendly) while `cast` stores the raw comma-separated string in the DB.

---

### `views.py`

**Custom permission:**
```python
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff   # POST/PUT/DELETE → staff only
```

**`MovieViewSet`** extends `ModelViewSet` (full CRUD auto-generated):
- `get_serializer_class()` → switches between lightweight and full serializer depending on the action
- `get_queryset()` → implements **full-text search** across title, genre, cast, synopsis using Django's `Q` objects for OR queries:

```python
queryset.filter(
    Q(title__icontains=search_query) |
    Q(genre__icontains=search_query) |
    Q(cast__icontains=search_query) |
    Q(synopsis__icontains=search_query)
)
```

`__icontains` = case-insensitive partial match (SQL `ILIKE '%term%'`).

---

### `urls.py`

```python
router = DefaultRouter()
router.register(r'', MovieViewSet, basename='movie')
```

`DefaultRouter` auto-generates:
| URL | Method | Action |
|-----|--------|--------|
| `/api/movies/` | GET | list |
| `/api/movies/` | POST | create |
| `/api/movies/{id}/` | GET | retrieve |
| `/api/movies/{id}/` | PUT/PATCH | update |
| `/api/movies/{id}/` | DELETE | destroy |

---

### `admin.py`

Custom `MovieAdmin` with:
- `fieldsets` → groups fields into logical sections in the admin interface (Main Info, Cast, Media, Streaming, Metadata)
- `list_display` → shows `streaming_platforms` as a computed column with emoji indicators
- `list_filter` → filter sidebar by genre, release date, streaming flags
- `readonly_fields` → `created_at`/`updated_at` cannot be manually edited

```python
def streaming_platforms(self, obj):
    platforms = []
    if obj.netflix_available:    platforms.append('🔴 Netflix')
    if obj.disney_plus_available: platforms.append('🔵 Disney+')
    if obj.prime_video_available: platforms.append('🔷 Prime')
    return ', '.join(platforms) if platforms else '❌ Aucune'
```

---

## App: `ratings`

Manages user ratings (1–5 stars) for movies. One rating per user per movie, enforced at both application and database level.

---

### `models.py`

```python
class Rating(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='ratings')
    user  = models.ForeignKey(User,  on_delete=models.CASCADE, related_name='user_ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 to 5

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['movie', 'user'], name='unique_movie_user_rating')
        ]
        ordering = ['-created_at']
```

**`UniqueConstraint`** at DB level: even if application code fails, the database will reject a second rating from the same user for the same movie (raises `IntegrityError`).

**`choices=[(i, i) for i in range(1, 6)]`** restricts score to 1, 2, 3, 4, or 5 at validation level.

---

### `serializers.py`

```python
class RatingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'movie', 'user', 'user_username', 'score', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
```

- `user_username` uses `source='user.username'` to surface the username directly without nesting
- `user` is `read_only` → the client submits a rating without specifying a user; the server assigns the logged-in user via `perform_create()`

---

### `views.py`

**Custom permission:**
```python
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user  # only the rating's author can modify it
```

**Upsert logic in `create()`:**
```python
def create(self, request, *args, **kwargs):
    existing = Rating.objects.filter(movie_id=movie_id, user=request.user).first()
    if existing:
        # Update instead of failing with a duplicate error → returns 200
        serializer = self.get_serializer(existing, data=request.data, partial=True)
        serializer.save()
        return Response(serializer.data, status=HTTP_200_OK)
    return super().create(...)  # new rating → returns 201
```

This pattern prevents a `400 Bad Request` / `IntegrityError` when a user tries to re-rate a movie, and instead updates their existing score gracefully.

**`get_queryset()`** supports filtering by movie:  
`GET /api/ratings/?movie_id=3` → returns only ratings for movie 3.

---

### `urls.py`

```python
router = DefaultRouter()
router.register(r'', RatingViewSet, basename='rating')
```

Same auto-generated CRUD routes as movies, scoped under `/api/ratings/`.

---

### `admin.py`

```python
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'score', 'created_at')
    list_filter  = ('score', 'created_at')
    search_fields = ('user__username', 'movie__title')
    readonly_fields = ('created_at', 'updated_at')
```

`search_fields = ('user__username', 'movie__title')` — the double underscore traverses the FK relation to search across related model fields.

---

## App: `comments`

Manages user comments on movies. A user can post multiple comments on the same movie, but can only edit or delete their own.

---

### `models.py`

```python
class Comment(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='comments')
    user  = models.ForeignKey(User,  on_delete=models.CASCADE, related_name='comments')
    text  = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
```

Unlike ratings, **no `UniqueConstraint`** — a user can leave multiple comments on the same movie.

`related_name='comments'` enables `movie.comments.all()` and `user.comments.all()`.

---

### `serializers.py`

```python
class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'movie', 'user', 'user_username', 'text', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
```

Same pattern as `RatingSerializer`: `user` is `read_only`, `user_username` surfaces the username directly.

---

### `views.py`

**Same `IsOwnerOrReadOnly` permission as ratings** (defined locally per app).

**`get_queryset()`** uses `select_related()` to avoid N+1 queries:
```python
queryset = Comment.objects.select_related('user', 'movie')
```
Without this, accessing `comment.user.username` in the serializer for 100 comments would trigger 100 extra SQL queries. `select_related()` performs a single JOIN instead.

**`perform_create()`** injects the authenticated user:
```python
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```

**Query param filtering:**  
`GET /api/comments/?movie_id=5` → all comments for movie 5.

---

### `urls.py`

```python
router = DefaultRouter()
router.register(r'', CommentViewSet, basename='comment')
```

---

### `admin.py`

```python
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie', 'text_preview', 'created_at')
    search_fields = ('user__username', 'movie_title', 'text')

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
```

`text_preview` truncates long comments to 50 characters in the admin list view for readability.

---

## `config/`

The Django project configuration package. Contains the global settings, URL router, and WSGI/ASGI entry points.

---

### `settings.py`

The main configuration file. Key sections:

**Environment variables** — sensitive values are loaded from `.env` via `os.environ.get()`:
```python
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-insecure-key')
DEBUG       = os.environ.get('DEBUG', 'True') == 'True'
DB_NAME     = os.environ.get('DB_NAME', 'whichmovietonight')
```
These must never be hardcoded or committed to Git.

**`INSTALLED_APPS`** — registers all apps including third-party packages:
- `rest_framework` → DRF
- `rest_framework_simplejwt` → JWT auth
- `rest_framework_simplejwt.token_blacklist` → enables logout blacklisting
- `corsheaders` → CORS policy
- `drf_spectacular` → Swagger/OpenAPI docs

**`MIDDLEWARE`** — order matters:
- `CorsMiddleware` must be placed **before** `CommonMiddleware` to handle preflight requests correctly

**`DATABASES`** — PostgreSQL configuration:
```python
'ENGINE': 'django.db.backends.postgresql'
'NAME': 'whichmovietonight'
'PORT': '5432'
```

**`AUTH_PASSWORD_VALIDATORS`** — 4 built-in validators applied at registration:
1. `UserAttributeSimilarityValidator` — password can't be too similar to username/email
2. `MinimumLengthValidator` — minimum 8 characters
3. `CommonPasswordValidator` — rejects passwords like "password123"
4. `NumericPasswordValidator` — rejects fully numeric passwords

**`REST_FRAMEWORK`** — global DRF settings:
```python
'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema'  # enables Swagger generation
'PAGE_SIZE': 100
```

**`SIMPLE_JWT`** — token lifetime configuration:
```python
'ACCESS_TOKEN_LIFETIME':  timedelta(hours=5),   # short-lived
'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    # long-lived
'BLACKLIST_AFTER_ROTATION': True,               # old tokens invalidated on rotation
'AUTH_HEADER_TYPES': ('Bearer',),               # Authorization: Bearer <token>
```

**`CORS_ALLOWED_ORIGINS`** — only the React dev server is whitelisted:
```python
"http://localhost:5173"
```
All other origins are blocked by the browser's CORS policy.

---

### `urls.py`

The global URL router. Delegates to each app's own `urls.py` via `include()`:

```python
path('api/movies/',   include('apps.movies.urls')),
path('api/ratings/',  include('apps.ratings.urls')),
path('api/comments/', include('apps.comments.urls')),
path('api/auth/',     include('apps.authentication.urls')),
```

**JWT views registered here** (not in the auth app):
```python
path('api/auth/login/',         TokenObtainPairView.as_view()),  # POST → {access, refresh}
path('api/auth/token/refresh/', TokenRefreshView.as_view()),     # POST → {access}
```

**Swagger/OpenAPI documentation:**
```python
path('api/schema/', SpectacularAPIView.as_view())         # raw OpenAPI JSON schema
path('api/docs/',   SpectacularSwaggerView.as_view())     # interactive Swagger UI
path('api/redoc/',  SpectacularRedocView.as_view())       # ReDoc alternative UI
```

---

### `wsgi.py` and `asgi.py`

Entry points for deploying the application:

| File | Protocol | Used with |
|------|----------|-----------|
| `wsgi.py` | WSGI (synchronous) | Gunicorn, uWSGI |
| `asgi.py` | ASGI (async-capable) | Daphne, Uvicorn |

For this project, `wsgi.py` is sufficient (no WebSockets or async views).

---

### `__init__.py`

Empty file that marks `config/` as a Python package. Required for Django to locate `config.settings`, `config.urls`, etc.
