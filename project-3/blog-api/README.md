# Blog API — Project 3: Database Integration

A REST API connecting an Express backend to a SQLite database, with Users and Posts (one-to-many).

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`. A `database.sqlite` file will be created automatically on first run — no separate database server needed.

**Open `http://localhost:3000` in your browser** to use the frontend console — create/edit/delete users and posts through forms, no curl needed. The API itself lives under `/api/...` as documented below.

## Project Structure

```
blog-api/
├── server.js              # App entry point (serves API + frontend)
├── config/database.js     # DB connection (Pillar 2: The Bridge)
├── models/
│   ├── User.js             # User schema
│   ├── Post.js             # Post schema
│   └── index.js            # Associations (Pillar 1: The Blueprint)
├── controllers/
│   ├── userController.js   # User CRUD logic
│   └── postController.js   # Post CRUD logic  (Pillar 3: The Action)
├── routes/
│   ├── users.js
│   └── posts.js
└── public/                 # Frontend (plain HTML/CSS/JS, no build step)
    ├── index.html           # User + post forms, live lists
    ├── style.css
    └── app.js               # Calls the API via fetch()
```

## Frontend

A single-page console at `/` lets you exercise every endpoint from the browser:
- Add, edit, and delete users (password is never shown back to you after creation)
- Add, edit, and delete posts, with an author picker sourced from your users
- A live connection indicator pings `/api/users` on load
- Everything is done with plain `fetch()` calls in `public/app.js` — a good reference for how the frontend talks to your Express routes

No frontend framework or build step — open `index.html` served by Express and it just works.

## Schema

**User**
| field    | type   | notes                |
|----------|--------|----------------------|
| id       | INT    | primary key          |
| username | STRING | unique               |
| email    | STRING | unique, validated    |
| password | STRING | bcrypt hash only     |

**Post**
| field    | type | notes                          |
|----------|------|--------------------------------|
| id       | INT  | primary key                    |
| title    | STRING | max 150 chars                 |
| content  | TEXT |                                |
| userId   | INT  | foreign key → User.id          |

Relationship: **User hasMany Posts**, **Post belongsTo User** (deleting a user cascades to delete their posts).

## API Endpoints

### Users
| Method | Route             | Description          |
|--------|-------------------|-----------------------|
| POST   | /api/users        | Create a user         |
| GET    | /api/users        | List all users        |
| GET    | /api/users/:id    | Get one user + posts  |
| PUT    | /api/users/:id    | Update a user         |
| DELETE | /api/users/:id    | Delete a user         |

### Posts
| Method | Route             | Description            |
|--------|-------------------|-------------------------|
| POST   | /api/posts        | Create a post           |
| GET    | /api/posts        | List all posts + author |
| GET    | /api/posts/:id    | Get one post             |
| PUT    | /api/posts/:id    | Update a post            |
| DELETE | /api/posts/:id    | Delete a post            |

## Example Requests

**Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"jane_doe","email":"jane@example.com","password":"secret123"}'
```

**Create a post:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","content":"Hello world!","userId":1}'
```

**Get all posts (with author attached):**
```bash
curl http://localhost:3000/api/posts
```

## Security notes (Pillar 4: The Shield)
- Passwords are hashed with bcrypt before saving — never stored in plain text.
- Password hashes are always excluded from API responses.
- Basic input validation on required fields and email format.
- Foreign key existence is checked before creating a post (no orphan posts).

## Next steps you could add
- JWT-based login/authentication
- Pagination on GET /api/posts
- Input validation library (e.g. express-validator) for stricter checks
- Swap SQLite for Postgres in production (just change `config/database.js`)
