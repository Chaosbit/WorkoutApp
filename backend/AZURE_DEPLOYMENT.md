# Workout App Backend Azure Deployment

This document provides instructions for deploying the Workout App backend to Azure.

## Prerequisites

- Azure CLI installed
- .NET 8.0 SDK
- Azure subscription

## Deployment Options

### Option 1: Azure App Service (Recommended)

1. **Create Resource Group**
```bash
az group create --name WorkoutApp-RG --location "East US"
```

2. **Create App Service Plan**
```bash
az appservice plan create \
  --name WorkoutApp-Plan \
  --resource-group WorkoutApp-RG \
  --sku B1 \
  --is-linux
```

3. **Create Web App**
```bash
az webapp create \
  --name WorkoutApp-API \
  --resource-group WorkoutApp-RG \
  --plan WorkoutApp-Plan \
  --runtime "DOTNET|8.0"
```

4. **Configure Application Settings**
```bash
az webapp config appsettings set \
  --name WorkoutApp-API \
  --resource-group WorkoutApp-RG \
  --settings \
    JwtSettings__Secret="your-super-secret-jwt-key-here-at-least-32-characters-long" \
    ConnectionStrings__DefaultConnection="Data Source=/home/site/wwwroot/workout-app.db"
```

5. **Deploy Application**
```bash
cd backend/WorkoutApp.Api
dotnet publish -c Release -o ./publish
zip -r ../workoutapp-api.zip ./publish/*
az webapp deployment source config-zip \
  --name WorkoutApp-API \
  --resource-group WorkoutApp-RG \
  --src ../workoutapp-api.zip
```

### Option 2: Azure SQL Database (Production)

For production, use Azure SQL Database instead of SQLite:

1. **Create Azure SQL Server**
```bash
az sql server create \
  --name workoutapp-sql-server \
  --resource-group WorkoutApp-RG \
  --location "East US" \
  --admin-user workoutadmin \
  --admin-password "YourSecurePassword123!"
```

2. **Create Database**
```bash
az sql db create \
  --name WorkoutAppDB \
  --server workoutapp-sql-server \
  --resource-group WorkoutApp-RG \
  --service-objective Basic
```

3. **Configure Firewall**
```bash
az sql server firewall-rule create \
  --server workoutapp-sql-server \
  --resource-group WorkoutApp-RG \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

4. **Update Connection String**
```bash
az webapp config appsettings set \
  --name WorkoutApp-API \
  --resource-group WorkoutApp-RG \
  --settings \
    ConnectionStrings__DefaultConnection="Server=tcp:workoutapp-sql-server.database.windows.net,1433;Initial Catalog=WorkoutAppDB;Persist Security Info=False;User ID=workoutadmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

## Environment Variables

Set these in Azure App Service Configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `JwtSettings__Secret` | JWT signing key (32+ characters) | `your-super-secret-jwt-key-here-at-least-32-characters-long` |
| `ConnectionStrings__DefaultConnection` | Database connection string | SQLite or SQL Server connection string |

## GitHub Actions Deployment (Optional)

Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: 8.0.x
    
    - name: Restore dependencies
      run: dotnet restore backend/WorkoutApp.Api/WorkoutApp.Api.csproj
    
    - name: Build
      run: dotnet build backend/WorkoutApp.Api/WorkoutApp.Api.csproj --no-restore -c Release
    
    - name: Publish
      run: dotnet publish backend/WorkoutApp.Api/WorkoutApp.Api.csproj -c Release -o backend/publish
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'WorkoutApp-API'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: backend/publish
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret key
2. **Database**: Use Azure SQL Database for production
3. **HTTPS**: Ensure HTTPS is enforced
4. **CORS**: Configure appropriate CORS origins
5. **Authentication**: Enable user approval workflow

## Monitoring

Configure Application Insights for monitoring:

```bash
az monitor app-insights component create \
  --app WorkoutApp-Insights \
  --location "East US" \
  --resource-group WorkoutApp-RG
```

## Cost Optimization

- Use B1 App Service Plan for development
- Consider Consumption Plan for Azure Functions alternative
- Use Basic tier SQL Database for cost savings
- Enable auto-scaling based on usage

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify connection string format
2. **JWT Issues**: Check secret key length and format
3. **CORS Errors**: Configure appropriate origins
4. **Deployment Failures**: Check build logs and dependencies

### Logs

View application logs:
```bash
az webapp log download --name WorkoutApp-API --resource-group WorkoutApp-RG
```

## Backup and Recovery

1. **Database Backups**: Azure SQL automatic backups
2. **Application**: Source code in Git repository
3. **Configuration**: Document all app settings

## Scaling

The backend is designed to scale horizontally:
- Stateless design
- Database connection pooling
- JWT token validation
- CORS configuration for multiple frontends