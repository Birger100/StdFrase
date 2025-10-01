# StdFrase

A full-stack application for managing standard phrases and clinical flows, built with .NET 9.0 Web API and React.

## Project Structure

- **StdFrase.Api** - ASP.NET Core Web API (.NET 9.0) with Entity Framework Core
- **StdFrase.Web** - React frontend built with Vite and TypeScript

## Architecture

### API (StdFrase.Api)

The API follows a clean architecture with Entity Framework Core:

- **Data** - EF Core entities (Flow, Activity, Field, Cuesta)
- **DTOs** - Data transfer objects for API contracts
- **Controllers** - API endpoints for Flows, Cuestas, and Phrases
- **DbContext** - Entity Framework Core database context

### Web (StdFrase.Web)

Modern React application with:
- TypeScript for type safety
- Vite for fast development and building
- Tabbed interface for Flows and Phrases management
- Import/Export functionality for flows

## Prerequisites

- .NET 9.0 SDK
- Node.js 20.x or later
- npm 10.x or later
- SQL Server (production) or SQLite (development)

## Getting Started

### Database Setup

The API uses SQLite for development and SQL Server for production.

To create/update the database:

```bash
cd StdFrase.Api
dotnet ef database update
```

### Running the API

```bash
cd StdFrase.Api
dotnet run
```

The API will be available at `http://localhost:5000` (HTTP) or `https://localhost:5001` (HTTPS).

#### Flow API Endpoints

- `GET /api/flows` - List all flows (with pagination and search)
- `GET /api/flows/{id}` - Get flow by ID with full aggregate
- `POST /api/flows` - Create/import flow from JSON
- `PUT /api/flows/{id}` - Update flow
- `DELETE /api/flows/{id}` - Delete flow (cascade)
- `GET /api/flows/export?sks={sks}` - Export flows by SKS code

#### Cuesta API Endpoints

- `GET /api/cuestas` - List all cuestas (with search)
- `GET /api/cuestas/{id}` - Get cuesta by ID
- `POST /api/cuestas` - Create cuesta
- `DELETE /api/cuestas/{id}` - Delete cuesta (only if not referenced)

#### Phrase API Endpoints (Legacy)

- `GET /api/phrases` - Get all phrases
- `GET /api/phrases/{id}` - Get a phrase by ID
- `POST /api/phrases` - Create a new phrase
- `PUT /api/phrases/{id}` - Update a phrase
- `DELETE /api/phrases/{id}` - Delete a phrase

#### OpenAPI/Swagger

In development mode, Swagger UI is available at `http://localhost:5000/swagger`.

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

### Flow Management
- Import clinical flows from JSON format
- View flow details with nested activities and fields
- Export flows by SKS code
- Delete flows with cascade deletion
- Automatic Cuesta path resolution (creates if not exists)

### Data Model
- **Flow**: Clinical workflow with title, SKS code, and activities
- **Activity**: Named activity within a flow with optional MoId
- **Field**: Data field with order, type (Text/Boolean/Choice), and standard phrase
- **Cuesta**: Unique path reference for fields

### Legacy Features
- Create, read, update, and delete phrases
- Categorize phrases
- Clean and modern UI
- RESTful API with proper HTTP status codes
- CORS configured for frontend-backend communication

## Database

### Development
Uses SQLite with database file `stdfrase.db` in the API directory.

### Production
Configured for SQL Server. Update the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=StdFraseDb;Trusted_Connection=true;"
}
```

## JSON Format

### Import Flow Example

```json
{
  "title": "SØVN-spl. forundersøgelse",
  "sks": "80012261",
  "activity": [
    {
      "name": "Patientidentifikation",
      "moId": "KPKlKlassif:...",
      "field": [
        {
          "cuestaId": "**/PatientidentifikationPREFIX<above>Patienten oplyser selv navn og CPR nummer",
          "fieldOrder": 0,
          "fieldType": 2,
          "standardphrase": null
        }
      ]
    }
  ]
}
```

Note: `cuestaId` in the JSON is a path string that maps to the `Cuesta.Path` in the database.