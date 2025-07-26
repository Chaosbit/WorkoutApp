# Azure Deployment Guide

This document provides comprehensive instructions for deploying the Workout App backend to Azure using Terraform and GitHub Actions.

## Overview

The deployment consists of two main components:
1. **Infrastructure Provisioning**: Using Terraform to create Azure resources
2. **Application Deployment**: Using GitHub Actions to build and deploy the .NET backend

## Prerequisites

### Azure Setup

1. **Azure Subscription**: Ensure you have an active Azure subscription
2. **Service Principal**: Create a service principal for GitHub Actions authentication

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "WorkoutApp-GitHub-Actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

3. **Save the output** - you'll need it for GitHub Secrets

### GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

| Secret Name | Description | Value |
|-------------|-------------|--------|
| `AZURE_CLIENT_ID` | Service Principal Client ID | From service principal creation |
| `AZURE_CLIENT_SECRET` | Service Principal Client Secret | From service principal creation |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | Your subscription ID |
| `AZURE_TENANT_ID` | Azure Tenant ID | From service principal creation |
| `AZURE_CREDENTIALS` | Complete service principal JSON | Full JSON output from service principal creation |
| `SQL_ADMIN_PASSWORD` | SQL Server admin password (production) | Secure password for SQL Server |

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add each secret listed above

## Deployment Process

### Step 1: Infrastructure Provisioning

The infrastructure is deployed using the Terraform workflow:

#### Automatic Deployment (Recommended)

1. **For Development**: Push changes to the `terraform/` directory to the main branch
2. **For Production**: Use the manual workflow dispatch

#### Manual Deployment

1. Go to GitHub Actions → "Terraform Infrastructure"
2. Click "Run workflow"
3. Select:
   - Environment: `dev` or `production`
   - Action: `plan`, `apply`, or `destroy`
4. Click "Run workflow"

#### What Gets Created

**Development Environment:**
- Resource Group
- App Service Plan (B1 tier)
- Linux Web App (.NET 8)
- Application Insights
- Key Vault with auto-generated JWT secret
- SQLite database (local to app)

**Production Environment:**
- All of the above, plus:
- Azure SQL Server and Database
- Staging deployment slot
- Higher-tier App Service Plan (P1v2)

### Step 2: Application Deployment

After infrastructure is provisioned, deploy the application:

#### Automatic Deployment

1. **Development**: Push changes to `backend/` directory
2. **Production**: Use manual workflow dispatch

#### Manual Deployment

1. Go to GitHub Actions → "Deploy Backend to Azure"
2. Click "Run workflow"
3. Select:
   - Environment: `dev` or `production`
   - Use staging slot: `true` (production only)
4. Click "Run workflow"

#### Deployment Process

1. **Build**: Compiles the .NET application
2. **Test**: Runs unit tests (if available)
3. **Publish**: Creates deployment package
4. **Deploy**: Deploys to Azure App Service
5. **Health Check**: Verifies deployment success
6. **Smoke Tests**: Basic functionality tests (production only)

## Environment Configuration

### Development Environment

- **Purpose**: Testing and development
- **Database**: SQLite (file-based)
- **App Service**: B1 tier
- **User Registration**: No approval required
- **CORS**: Includes localhost origins

### Production Environment

- **Purpose**: Live application
- **Database**: Azure SQL Database
- **App Service**: P1v2 tier with staging slot
- **User Registration**: Admin approval required
- **CORS**: Production origins only

## Monitoring and Troubleshooting

### Application Insights

Monitor your application performance:

1. Go to Azure Portal
2. Navigate to your Application Insights resource
3. View metrics, logs, and performance data

### Viewing Logs

```bash
# Stream live logs
az webapp log tail --name <app-service-name> --resource-group <resource-group>

# Download log files
az webapp log download --name <app-service-name> --resource-group <resource-group>
```

### Common Issues

#### Deployment Failures

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify Azure credentials** are correctly set in GitHub Secrets
3. **Ensure resource names are unique** (handled automatically by Terraform)

#### Application Issues

1. **Check Application Insights** for exceptions and performance issues
2. **Review App Service logs** for runtime errors
3. **Verify Key Vault access** for configuration issues

#### Database Connection Issues

1. **SQLite**: Ensure app has write permissions to `/home/site/wwwroot/`
2. **SQL Database**: Check connection string and firewall rules

### Health Endpoints

Test your deployment:

- **Health Check**: `https://your-app.azurewebsites.net/health`
- **Swagger UI**: `https://your-app.azurewebsites.net/swagger`
- **API Base**: `https://your-app.azurewebsites.net/api`

## Cost Management

### Development Costs (Estimated Monthly)
- App Service Plan B1: ~$13
- Application Insights: Free tier
- Key Vault: ~$0.03 per 10,000 operations
- SQLite: No additional cost
- **Total**: ~$15/month

### Production Costs (Estimated Monthly)
- App Service Plan P1v2: ~$146
- SQL Database S1: ~$20
- Application Insights: Pay-per-use (~$5-20)
- Key Vault: ~$0.03 per 10,000 operations
- **Total**: ~$175/month

### Cost Optimization Tips

1. **Use appropriate tiers** for your needs
2. **Enable auto-scaling** to handle traffic spikes
3. **Set up alerts** for cost thresholds
4. **Consider Reserved Instances** for predictable workloads

## Scaling and Performance

### Horizontal Scaling

The application is designed to scale horizontally:

- **Stateless design**: No server-side session state
- **Database connection pooling**: Efficient resource usage
- **JWT authentication**: No server-side session storage

### Auto-scaling Configuration

```bash
# Enable auto-scaling (production)
az monitor autoscale create \
  --resource-group <resource-group> \
  --resource <app-service-plan> \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-rules \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

## Security Considerations

### Key Vault Integration

- **JWT secrets**: Stored securely in Key Vault
- **Connection strings**: Retrieved from Key Vault at runtime
- **Managed Identity**: App Service uses managed identity for Key Vault access

### Network Security

- **HTTPS only**: All traffic encrypted
- **CORS**: Restricted to approved origins
- **SQL firewall**: Only Azure services allowed

### Authentication

- **JWT tokens**: Secure authentication mechanism
- **Password hashing**: BCrypt with salt
- **User approval**: Optional admin approval workflow

## Backup and Recovery

### Application Backup

- **Source code**: Stored in Git repository
- **Configuration**: Managed by Terraform
- **Deployment**: Reproducible via GitHub Actions

### Database Backup

**SQLite (Development):**
- File-based backups through App Service backup feature
- Manual database file downloads

**SQL Database (Production):**
- Automatic backups with point-in-time recovery
- Geo-redundant storage options
- Long-term retention policies

### Disaster Recovery

1. **Infrastructure**: Re-deploy using Terraform
2. **Application**: Re-deploy using GitHub Actions
3. **Database**: Restore from backup
4. **Configuration**: Managed in code

## Maintenance

### Regular Tasks

1. **Monitor costs** and usage
2. **Review security alerts**
3. **Update dependencies** (handled by Dependabot)
4. **Check performance metrics**
5. **Backup critical data**

### Updates and Patches

- **Infrastructure**: Update Terraform configurations
- **Application**: Update .NET dependencies
- **OS patches**: Handled automatically by Azure

## Support and Documentation

### Azure Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure SQL Database Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

### Terraform Resources

- [Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

### Troubleshooting

For deployment issues:
1. Check GitHub Actions logs
2. Review Azure Portal for resource status
3. Check Application Insights for runtime issues
4. Review this documentation for common solutions

For application issues:
1. Check the backend API documentation
2. Review Application Insights logs
3. Test endpoints using Swagger UI
4. Verify frontend configuration