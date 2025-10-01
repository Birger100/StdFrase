# StdFrase

A full-stack application for managing standard phrases, built with .NET 9.0 Web API and React.

## Project Structure

- **StdFrase.Api** - ASP.NET Core Web API (.NET 9.0) following the service/repository pattern
- **StdFrase.Web** - React frontend built with Vite and TypeScript

## Architecture

### API (StdFrase.Api)

The API follows a clean architecture with the service/repository pattern:

- **Models** - Domain entities
- **Repositories** - Data access layer with interfaces and implementations
- **Services** - Business logic layer
- **Controllers** - API endpoints

### Web (StdFrase.Web)

Modern React application with:
- TypeScript for type safety
- Vite for fast development and building
- Clean component architecture

## Prerequisites

- .NET 9.0 SDK
- Node.js 20.x or later
- npm 10.x or later

## Getting Started

### Running the API

```bash
cd StdFrase.Api
dotnet run
```

The API will be available at `https://localhost:5001` (HTTPS) or `http://localhost:5000` (HTTP).

API endpoints:
- `GET /api/phrases` - Get all phrases
- `GET /api/phrases/{id}` - Get a phrase by ID
- `POST /api/phrases` - Create a new phrase
- `PUT /api/phrases/{id}` - Update a phrase
- `DELETE /api/phrases/{id}` - Delete a phrase

### Running the Web Application

```bash
cd StdFrase.Web
npm install
npm run dev
```

The web application will be available at `http://localhost:5173`.

## Building for Production

### API

```bash
cd StdFrase.Api
dotnet build -c Release
```

### Web

```bash
cd StdFrase.Web
npm run build
```

## Features

- Create, read, update, and delete phrases
- Categorize phrases
- Clean and modern UI
- RESTful API with proper HTTP status codes
- CORS configured for frontend-backend communication
- In-memory data storage (can be easily extended to use a database)