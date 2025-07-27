# .NET Aspire-Inspired Backend

This backend implementation uses .NET Aspire-inspired patterns for observability, health checks, and service orchestration while maintaining compatibility with standard .NET 8 tooling.

## Architecture

The backend consists of several projects organized in an Aspire-like structure:

### Projects

- **WorkoutApp.Api**: The main Web API project with controllers and business logic
- **WorkoutApp.ServiceDefaults**: Shared service configuration for observability and health checks
- **WorkoutApp.AppHost**: Simple orchestration host for development scenarios
- **WorkoutApp.Tests**: Unit and integration tests

### Key Features

- **OpenTelemetry Integration**: Comprehensive observability with metrics, tracing, and logging
- **Health Checks**: Built-in health endpoints for monitoring application status
- **Service Defaults**: Standardized configuration for all services
- **JWT Authentication**: Secure API authentication with proper validation
- **Entity Framework**: SQLite for development, easily configurable for other databases

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQLite (included with .NET)

### Development Commands

```bash
# Restore packages
npm run backend:restore

# Build the solution
npm run backend:build

# Run the API directly
npm run backend:api

# Run the orchestration host (development)
npm run backend:apphost

# Run tests
npm run test:backend
```

### Manual Commands

```bash
cd backend

# Restore and build
dotnet restore
dotnet build

# Run the API service
dotnet run --project WorkoutApp.Api

# Run the orchestration host
dotnet run --project WorkoutApp.AppHost

# Run tests
dotnet test
```

## Service Defaults

The `WorkoutApp.ServiceDefaults` project provides:

### OpenTelemetry Configuration
- **Metrics**: ASP.NET Core, HTTP Client, and Runtime metrics
- **Tracing**: Request tracing across services
- **Logging**: Structured logging with OpenTelemetry

### Health Checks
- **/health**: Overall application health
- **/alive**: Liveness probe (development only)

### HTTP Client Configuration
- Standard timeout settings
- Basic resilience patterns

## API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout

### Statistics
- `GET /api/statistics` - Get user statistics
- `POST /api/statistics` - Update statistics

### Health & Monitoring
- `GET /health` - Health check endpoint (development)
- `GET /alive` - Liveness check (development)

## Configuration

### Database Connection

The default configuration uses SQLite:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=workout-app.db"
  }
}
```

### JWT Settings

Configure JWT authentication:

```json
{
  "JwtSettings": {
    "Secret": "your-secret-key-here",
    "ExpirationInDays": 7
  }
}
```

### User Registration

Control user registration behavior:

```json
{
  "UserRegistration": {
    "RequireApproval": false,
    "RequireReferralCode": false
  }
}
```

## Observability

### OpenTelemetry Exporter

To use OTLP exporter, set the environment variable:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
```

### Metrics Available

- HTTP request duration and count
- Database operation metrics
- Runtime performance metrics
- Custom application metrics

### Distributed Tracing

Traces are automatically created for:
- HTTP requests
- Database operations
- External HTTP calls

## Development Tips

### Running with Hot Reload

```bash
cd backend
dotnet watch run --project WorkoutApp.Api
```

### Database Migrations

The application automatically creates the database on startup. For production, consider using explicit migrations:

```bash
dotnet ef migrations add InitialCreate --project WorkoutApp.Api
dotnet ef database update --project WorkoutApp.Api
```

### Testing

Run different test suites:

```bash
# All tests
dotnet test

# Specific test project
dotnet test WorkoutApp.Tests

# With coverage
dotnet test --collect:"XPlat Code Coverage"
```

## Deployment

The backend can be deployed as:

1. **Single API Service**: Deploy only `WorkoutApp.Api`
2. **Container**: Use the provided Dockerfile
3. **Azure App Service**: Use the provided ARM templates
4. **Container Orchestration**: Deploy as microservices

## Differences from Full .NET Aspire

This implementation provides Aspire-like benefits without requiring the full Aspire workload:

- **✅ Included**: OpenTelemetry, Health Checks, Service Configuration
- **✅ Included**: Structured project organization
- **❌ Not Included**: Full service discovery
- **❌ Not Included**: Advanced resilience patterns
- **❌ Not Included**: Aspire Dashboard integration

For production scenarios requiring full Aspire features, upgrade to the official .NET Aspire packages when they reach stable release.

## Troubleshooting

### Build Issues

If you encounter build issues:

```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Database Issues

If database connection fails:

1. Check SQLite file permissions
2. Verify connection string in `appsettings.json`
3. Delete `workout-app.db` to recreate database

### Authentication Issues

If JWT authentication fails:

1. Verify `JwtSettings:Secret` is configured
2. Check token expiration settings
3. Ensure proper Authorization header format: `Bearer <token>`