# Backend Integration Documentation

This document describes the backend integration added to the Workout Timer PWA.

## Overview

The application now supports optional backend synchronization while maintaining its offline-first approach. Users can register, login, and sync their workouts and statistics with a .NET Web API backend.

## Architecture

### Frontend Changes

1. **SyncManager** (`js/sync-manager.js`)
   - Handles all backend communication
   - Provides graceful degradation when backend is unavailable
   - Manages authentication tokens and API requests

2. **UI Integration** 
   - New "Sync" navigation item in the drawer
   - Authentication dialogs for login/registration
   - Sync settings with enable/disable toggle
   - Status indicators for sync and authentication state

3. **Offline-First Design**
   - App continues to work without backend
   - Sync is opt-in and can be disabled
   - Local data always takes precedence

### Backend Implementation

The backend is a .NET 8 Web API with the following features:

1. **Authentication**
   - JWT-based authentication
   - User registration with approval workflow
   - Password hashing with BCrypt
   - Referral system support

2. **Data Models**
   - `User` - User accounts with approval status
   - `UserWorkout` - User's workout definitions
   - `UserStatistics` - Workout statistics and progress
   - `WorkoutSession` - Individual workout session records

3. **API Endpoints**
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/workouts` - Get user's workouts
   - `POST /api/workouts/sync` - Sync workouts with conflict resolution
   - `GET/PUT /api/statistics` - Get/update user statistics
   - `GET/POST /api/statistics/sessions` - Workout session tracking

## Configuration

### Frontend Configuration

Set the backend API URL by defining `window.WORKOUT_API_URL`:

```javascript
// In your HTML or before loading the app
window.WORKOUT_API_URL = 'https://your-api-domain.com/api';
```

Default: `http://localhost:5000/api`

### Backend Configuration

Required environment variables:

```bash
# JWT Settings
JwtSettings__Secret="your-super-secret-jwt-key-here-at-least-32-characters-long"

# Database Connection
ConnectionStrings__DefaultConnection="Data Source=workout-app.db"
# OR for SQL Server:
# ConnectionStrings__DefaultConnection="Server=...; Database=...; ..."
```

## User Registration Workflow

1. **Registration**
   - User fills out registration form
   - Backend creates user with `RequiresApproval=true` and `IsApproved=false`
   - User receives "pending approval" message

2. **Admin Approval** (Manual Process)
   - Admin reviews new registrations in database
   - Sets `IsApproved=true` and `ApprovedAt=DateTime.UtcNow`
   - Optionally sets `ApprovedBy` field

3. **Login**
   - Approved users can login normally
   - Unapproved users receive "pending approval" message
   - JWT tokens are only issued to approved users

## Sync Behavior

### Workout Synchronization

- **Client → Server**: Local workouts are uploaded during sync
- **Conflict Resolution**: Server timestamp wins (last modified)
- **New Workouts**: Assigned new IDs by server
- **Deleted Workouts**: Marked as `IsDeleted=true`

### Statistics Synchronization  

- **Upload**: Client statistics replace server statistics
- **Streak Calculation**: Server handles streak logic
- **Session Tracking**: Individual workout sessions stored

## Deployment

### Azure App Service (Recommended)

1. **Quick Deploy**
   ```bash
   cd backend
   ./deploy-azure.sh
   ```

2. **Manual Steps**
   ```bash
   # Create resources
   az group create --name WorkoutApp-RG --location "East US"
   az appservice plan create --name WorkoutApp-Plan --resource-group WorkoutApp-RG --sku B1 --is-linux
   az webapp create --name WorkoutApp-API --resource-group WorkoutApp-RG --plan WorkoutApp-Plan --runtime "DOTNET|8.0"
   
   # Configure settings
   az webapp config appsettings set --name WorkoutApp-API --resource-group WorkoutApp-RG --settings \
     JwtSettings__Secret="your-jwt-secret" \
     ConnectionStrings__DefaultConnection="Data Source=/home/site/wwwroot/workout-app.db"
   
   # Deploy
   dotnet publish -c Release -o ./publish
   zip -r workoutapp-api.zip ./publish/*
   az webapp deployment source config-zip --name WorkoutApp-API --resource-group WorkoutApp-RG --src workoutapp-api.zip
   ```

### Database Options

- **Development**: SQLite (default)
- **Production**: Azure SQL Database (recommended)

See `backend/AZURE_DEPLOYMENT.md` for detailed deployment instructions.

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret key (32+ characters)
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure appropriate origins
4. **Database**: Use Azure SQL Database for production
5. **Approval Workflow**: Review and approve new users

## Testing

### Backend Testing

```bash
cd backend/WorkoutApp.Api
dotnet run

# Test endpoints
curl -X POST http://localhost:5238/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Frontend Testing

1. Enable sync in the UI
2. Try registration/login flow
3. Test sync functionality
4. Verify offline mode still works

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **JWT Errors**: Verify secret key configuration
3. **Database Connection**: Check connection string format
4. **Sync Failures**: Check network connectivity and authentication

### Debug Mode

Enable debug logging in the browser console to see sync operations:

```javascript
// In browser console
localStorage.setItem('debug', 'WorkoutApp:*');
```

## Future Enhancements

1. **Real-time Sync**: WebSocket connections for live updates
2. **Conflict Resolution**: More sophisticated merge strategies
3. **Team Features**: Shared workouts and challenges
4. **Analytics**: Server-side analytics and insights
5. **Mobile App**: Native mobile app integration
6. **Social Features**: Friend connections and sharing