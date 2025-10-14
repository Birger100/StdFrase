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

### Security
- **Windows Authentication**: The application uses Windows authentication with Negotiate (Kerberos/NTLM)
- **Authorization**: Access is restricted to allowed users configured in `appsettings.json`
- **User-friendly Access Denied**: Clear messaging for unauthorized users with helpful instructions

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

## Authentication and Authorization

The application uses Windows authentication to secure access. Only users listed in the configuration file can access the application.

### Configuring Allowed Users

Edit the `appsettings.json` file to add or remove allowed users:

```json
"Authentication": {
  "AllowedUsers": [
    "DOMAIN\\user1",
    "DOMAIN\\user2",
    "DOMAIN\\adminuser"
  ]
}
```

**Important Notes:**
- User names must be in the format `DOMAIN\\username` (double backslash in JSON)
- User names are case-insensitive
- Changes to the allowed users list require restarting the API application
- Users not in the list will see a clear access denied page with instructions

### Authentication Endpoints

- `GET /api/auth/user` - Get current authenticated user information (no authorization required)
- `GET /api/auth/check` - Check if the current user has access (requires authorization)

### How It Works

1. The API uses ASP.NET Core's Windows Authentication (Negotiate) 
2. When a user accesses the application, their Windows credentials are automatically sent
3. The application checks if the authenticated user is in the allowed users list
4. If authorized, the user can access all features
5. If not authorized, a user-friendly access denied page is displayed with:
   - The user's Windows account name
   - Explanation of why access was denied
   - Instructions on how to request access

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