# AgriClimate Pro

Full-stack web application concept combining agronomy and weather intelligence.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB
- Auth: JWT
- Styling: CSS with reusable components

## Features
- Search weather by city
- User registration and login
- Save favorite locations
- Agricultural insights based on temperature, humidity, rainfall, and wind
- Responsive landing page and dashboard

## Project structure

```bash
agri-climate-pro/
  frontend/
  backend/
```

## Quick start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Notes
- Replace environment variables with your own values.
- Create a MongoDB database and set `MONGO_URI`.
- Create an OpenWeather API key and set `WEATHER_API_KEY`.

## Included update
- Bilingual frontend (Português / English) with language toggle and saved selection in localStorage.

- Multilingual frontend with 11 major world languages and a language selector in the header.

- Startup-style upgrade: agricultural risk score, weekly trend chart, quick recommendations, and global coverage visual card.
