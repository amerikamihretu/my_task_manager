# My Task Manager

A full-stack task management application with secure user authentication, protected task endpoints, filtering, priorities, due dates, avatar uploads, and a responsive React interface.

## Features

- Register, log in, log out, and update account details
- Upload, replace, and remove a personal avatar from Profile & settings
- Secure HTTP-only cookie authentication with JWT
- Create, view, update, and delete personal tasks
- Task status, priority, due dates, search, and filtering
- Dashboard with task statistics and calendar views
- Request validation, password hashing, rate limiting, CORS, and security headers
- Avatar validation with a 2 MB size limit for JPEG, PNG, and WebP files
- Automated server tests for authentication, avatar uploads, task access, and task ownership

## Tech stack

- **Frontend:** React, React Router, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT in an HTTP-only cookie, bcrypt
- **File uploads:** Multer with Cloudinary-managed avatar storage
- **Testing:** Node test runner, Supertest, MongoDB Memory Server

## Project structure

```text
client/   React frontend
server/   Express API and tests
```

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB connection string

## Local setup

1. Install dependencies:

   ```powershell
   cd server
   npm install

   cd ..\client
   npm install
   ```

2. Create the server environment file:

   ```powershell
   cd ..\server
   Copy-Item .env.example .env
   ```

   Update `MONGO_URI` and replace `JWT_SECRET` with a long random value. Never commit `.env`.
   `JWT_EXPIRES_IN` controls the JWT lifetime, while `SESSION_COOKIE_MAX_AGE_MS`
   controls how long the browser keeps the authentication cookie. The server
   validates all required environment variables at startup and exits with a
   clear error if one is missing.

3. Create the client environment file:

   ```powershell
   cd ..\client
   Copy-Item .env.example .env
   ```

4. Start the API:

   ```powershell
   cd ..\server
   npm run dev
   ```

5. In another terminal, start the frontend:

   ```powershell
   cd client
   npm run dev
   ```

   Open the URL shown by Vite, normally `http://localhost:5173`.

## Environment variables

The available variables and safe placeholder values are documented in:

- [server/.env.example](./server/.env.example)
- [client/.env.example](./client/.env.example)

`VITE_API_BASE_URL` is a public frontend configuration value, not a secret.
Never put database credentials, JWT secrets, or private keys in variables
starting with `VITE_`, because Vite bundles them into browser code.
Google sign-in uses `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
`GOOGLE_REDIRECT_URI`; keep the client secret only in the backend environment.

## Deployment

The application is deployed using separate managed services:

- **MongoDB Atlas:** hosts the MongoDB database
- **Cloudinary:** stores uploaded avatar images
- **Render:** hosts the Node.js and Express backend
- **Vercel:** hosts the React/Vite frontend

The deployed frontend communicates with the deployed backend through
`VITE_API_BASE_URL`. The backend connects to MongoDB Atlas through `MONGO_URI`
and uploads avatars to Cloudinary through the private `CLOUDINARY_URL`.
Production secrets are configured in the hosting providers' environment
settings and are never committed to Git.

To enable Google sign-in, create a Web application OAuth client in Google
Cloud Console. Add this authorized redirect URI:

```text
https://my-task-manager-nkw2.onrender.com/api/auth/google/callback
```

Set the resulting client ID, client secret, and the same redirect URI as
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in
Render. Add the frontend origin to the OAuth client's authorized JavaScript
origins:

```text
https://my-task-manager-beige.vercel.app
```

## Avatar storage

Avatars are uploaded to Cloudinary. Set the private `CLOUDINARY_URL` in the
server environment using the `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
format. The database stores the Cloudinary URL and public ID, while the image
itself remains in persistent managed storage.

## Testing and quality checks

Run server tests:

```powershell
cd server
npm test
```

If the local MongoDB Memory Server processes conflict when tests run in
parallel, run them serially:

```powershell
node --test --test-concurrency=1 src/tests/*.test.js
```

Run client linting and the production build:

```powershell
cd client
npm run lint
npm run build
```

## Security notes

- Secrets belong in local `.env` files or your deployment platform's secret manager.
- The current JWT and authentication-cookie lifetime is seven days. For a higher-security deployment, use a shorter access-token lifetime with a refresh-token flow.
- Set `NODE_ENV=production`, use HTTPS, and configure `CLIENT_ORIGIN` to the deployed frontend URL in production.
- Do not log passwords, JWTs, cookies, database connection strings, or full request bodies. Startup and database connection logs are safe when they contain only operational information.
- Keep local upload directories outside Git; production avatars are stored in Cloudinary.

## Production checklist

- Set every variable from `server/.env.example` in the deployment platform.
- Set `VITE_API_BASE_URL` to the deployed API URL before building the frontend.
- Set `CLIENT_ORIGIN` to the exact deployed frontend origin.
- Use a strong, unique `JWT_SECRET` and never reuse the development secret.
- Use HTTPS so secure cookies and cross-origin requests are protected.
- Configure persistent avatar storage instead of relying on local server disk.
- Review deployment logs to ensure they contain operational information only.
