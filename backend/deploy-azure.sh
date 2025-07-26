#!/bin/bash

# Workout App Backend Deployment Script
# This script deploys the Workout App backend to Azure App Service

set -e

# Configuration
RESOURCE_GROUP="WorkoutApp-RG"
APP_SERVICE_PLAN="WorkoutApp-Plan"
WEB_APP_NAME="WorkoutApp-API"
LOCATION="East US"
SQL_SERVER_NAME="workoutapp-sql-server"
DATABASE_NAME="WorkoutAppDB"
SQL_ADMIN_USER="workoutadmin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo_error ".NET SDK is not installed. Please install .NET 8.0 SDK first."
    exit 1
fi

echo_info "Starting deployment to Azure..."

# Create resource group
echo_info "Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none

# Create App Service Plan
echo_info "Creating App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux \
  --output none

# Create Web App
echo_info "Creating Web App..."
az webapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "DOTNET|8.0" \
  --output none

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo_info "Generated JWT secret"

# Configure application settings
echo_info "Configuring application settings..."
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    JwtSettings__Secret="$JWT_SECRET" \
    ConnectionStrings__DefaultConnection="Data Source=/home/site/wwwroot/workout-app.db" \
  --output none

# Build and publish the application
echo_info "Building application..."
cd "$(dirname "$0")/WorkoutApp.Api"

if [ ! -f "WorkoutApp.Api.csproj" ]; then
    echo_error "WorkoutApp.Api.csproj not found. Make sure you're running this script from the backend directory."
    exit 1
fi

dotnet restore
dotnet build -c Release
dotnet publish -c Release -o ./publish

# Create deployment package
echo_info "Creating deployment package..."
cd publish
zip -r ../workoutapp-api.zip . > /dev/null
cd ..

# Deploy to Azure
echo_info "Deploying to Azure App Service..."
az webapp deployment source config-zip \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src workoutapp-api.zip \
  --output none

# Clean up
rm -f workoutapp-api.zip
rm -rf publish

# Get the app URL
APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)

echo_info "Deployment completed successfully!"
echo_info "App URL: https://$APP_URL"
echo_info "Swagger UI: https://$APP_URL/swagger"
echo_info "JWT Secret: $JWT_SECRET"
echo_warn "Please save the JWT secret securely!"

# Optional: Setup SQL Database
read -p "Do you want to set up Azure SQL Database instead of SQLite? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo_info "Setting up Azure SQL Database..."
    
    read -s -p "Enter SQL Server admin password: " SQL_PASSWORD
    echo
    
    # Create SQL Server
    echo_info "Creating SQL Server..."
    az sql server create \
      --name $SQL_SERVER_NAME \
      --resource-group $RESOURCE_GROUP \
      --location "$LOCATION" \
      --admin-user $SQL_ADMIN_USER \
      --admin-password "$SQL_PASSWORD" \
      --output none
    
    # Create Database
    echo_info "Creating database..."
    az sql db create \
      --name $DATABASE_NAME \
      --server $SQL_SERVER_NAME \
      --resource-group $RESOURCE_GROUP \
      --service-objective Basic \
      --output none
    
    # Configure firewall for Azure services
    echo_info "Configuring firewall..."
    az sql server firewall-rule create \
      --server $SQL_SERVER_NAME \
      --resource-group $RESOURCE_GROUP \
      --name AllowAzureServices \
      --start-ip-address 0.0.0.0 \
      --end-ip-address 0.0.0.0 \
      --output none
    
    # Update connection string
    CONNECTION_STRING="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$DATABASE_NAME;Persist Security Info=False;User ID=$SQL_ADMIN_USER;Password=$SQL_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    
    echo_info "Updating connection string..."
    az webapp config appsettings set \
      --name $WEB_APP_NAME \
      --resource-group $RESOURCE_GROUP \
      --settings \
        ConnectionStrings__DefaultConnection="$CONNECTION_STRING" \
      --output none
    
    echo_info "SQL Database setup completed!"
    echo_info "Database: $SQL_SERVER_NAME.database.windows.net/$DATABASE_NAME"
fi

echo_info "Deployment script completed!"
echo_info "Next steps:"
echo_info "1. Update frontend WORKOUT_API_URL to point to https://$APP_URL/api"
echo_info "2. Test the API endpoints"
echo_info "3. Configure custom domain if needed"
echo_info "4. Set up monitoring and alerts"