# TaskFlow Frontend

React frontend for TaskFlow built with Vite.

## Overview

This repository contains the TaskFlow UI, including login, registration, task management, and dashboard views.

## Production readiness

- Uses `VITE_API_BASE_URL` for backend API endpoint configuration.
- Builds with Vite and serves static assets.
- Supports deployment to Vercel or any static hosting provider.
- Includes a Dockerfile for containerized deployment.

## Environment

Create a `.env` file locally or set environment variables in your deployment provider.

```env
VITE_API_BASE_URL=https://<YOUR_BACKEND_DOMAIN>/api/v1
```

If the backend is deployed on Railway, set this to your Railway API URL.

## Local development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open the app at the URL shown by Vite.

## Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Vercel deployment

Use these settings in Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://<YOUR_BACKEND_DOMAIN>/api/v1`

## API endpoints

The frontend sends requests to:

- `POST /auth/register`
- `POST /auth/login`
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `GET /users/me`
- `GET /users/me/dashboard`

The full backend URL is controlled by `VITE_API_BASE_URL`.

## Docker

Build the Docker image from the frontend folder:

```bash
docker build -t taskflow-frontend .
```

Run it:

```bash
docker run -p 80:80 taskflow-frontend
```

If you deploy frontend and backend separately, set `VITE_API_BASE_URL` to the backend host.
