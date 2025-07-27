# Workout App Azure Infrastructure

This directory contains Terraform configurations for provisioning Azure infrastructure for the Workout App backend.

## Architecture

The Terraform configuration creates the following Azure resources:

- **Resource Group**: Container for all resources
- **App Service Plan**: Hosting plan for the web application
- **Linux Web App**: The main application hosting service
- **Application Insights**: Application performance monitoring and logging
- **Key Vault**: Secure storage for secrets and connection strings
- **SQL Server & Database** (optional): Azure SQL Database for production workloads
- **Deployment Slot** (optional): Staging slot for blue-green deployments

## Prerequisites

1. **Azure CLI**: Install and login to Azure
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```

2. **Terraform**: Install Terraform CLI (>= 1.0)
   ```bash
   # On macOS
   brew install terraform
   
   # On Ubuntu/Debian
   sudo apt-get update && sudo apt-get install terraform
   
   # On Windows
   choco install terraform
   ```

3. **Azure Subscription**: Ensure you have appropriate permissions to create resources

## Quick Start

### 1. Configure Variables

Copy the example variables file and customize it:

```bash
# For development
cp terraform.tfvars.example terraform.tfvars

# For production
cp terraform.tfvars.prod terraform.tfvars
```

Edit `terraform.tfvars` with your specific configuration.

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Plan Deployment

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

### 5. Get Deployment Information

```bash
terraform output
```

## Configuration Options

### Environment Variables

For sensitive values like SQL passwords, use environment variables:

```bash
export TF_VAR_sql_admin_password="YourSecurePassword123!"
terraform apply
```

### Development vs Production

The configuration supports different environments through variables:

**Development:**
- Uses SQLite database (default)
- Lower-tier App Service Plan (B1)
- No staging slot
- Relaxed user registration

**Production (Cost Optimized for Private Use):**
- Uses Azure SQL Database Basic tier
- Basic App Service Plan (B2)
- No staging slot (cost savings)
- Strict user registration with approval

### Database Options

**SQLite (Development):**
```hcl
use_sql_database = false
```

**Azure SQL Database (Production - Cost Optimized):**
```hcl
use_sql_database    = true
sql_admin_username  = "workoutadmin"
sql_admin_password  = "YourSecurePassword123!"
sql_database_sku    = "Basic"
```

## Resource Naming

All resources are created with a consistent naming pattern:
- Format: `{app_name}-{resource_type}-{environment}-{random_suffix}`
- Example: `workoutapp-api-prod-a1b2c3d4`

The random suffix ensures unique resource names across Azure.

## Security Features

### Key Vault Integration

Sensitive configuration is stored in Azure Key Vault:
- JWT signing secret (auto-generated)
- SQL connection string (if using SQL Database)
- Application settings reference Key Vault secrets

### Managed Identity

The App Service uses system-assigned managed identity:
- Eliminates need for connection strings in code
- Automatic authentication to Key Vault
- Enhanced security posture

### Network Security

- HTTPS-only enforcement
- CORS configuration for allowed origins
- SQL Server firewall rules (Azure services only)

## Technical Implementation Details

### Key Vault Access Policy Architecture

To avoid circular dependencies between the Key Vault and Web App resources, the infrastructure uses a two-step approach:

1. **Key Vault Creation**: Created with only the deployment user's access policy
2. **Separate Access Policy**: Uses `azurerm_key_vault_access_policy` resource to grant Web App managed identity access after both resources exist

This pattern ensures:
- Key Vault doesn't depend on Web App (no inline access policy for the app)
- Web App can reference Key Vault in app settings
- Separate resource grants necessary permissions after both are created

### Managed Identity Integration

The Web App uses system-assigned managed identity to access Key Vault secrets securely:
```
@Microsoft.KeyVault(VaultName=${vault_name};SecretName=${secret_name})
```

This approach eliminates hardcoded connection strings and provides automatic credential rotation.

## Monitoring and Logging

### Application Insights

Automatic integration provides:
- Performance monitoring
- Exception tracking
- Custom telemetry
- Availability tests

### Access Logs

```bash
# View recent logs
az webapp log tail --name <app-service-name> --resource-group <resource-group>

# Download logs
az webapp log download --name <app-service-name> --resource-group <resource-group>
```

## Deployment Slots

When `create_staging_slot = true`, a staging slot is created for:
- Blue-green deployments
- Testing before production
- Zero-downtime deployments

**Swap slots:**
```bash
az webapp deployment slot swap \
  --name <app-service-name> \
  --resource-group <resource-group> \
  --slot staging \
  --target-slot production
```

## Cost Optimization (West Europe Pricing)

### Development Environment
- App Service Plan: B1 (~$13/month)
- Application Insights: Free tier
- Key Vault: ~$0.03/10,000 operations
- SQLite: No additional cost
- **Total**: ~$13/month

### Production Environment (Cost Optimized for Private Use)
- App Service Plan: B2 (~$26/month)
- SQL Database: Basic (~$5/month)
- Application Insights: Free tier for basic usage
- Key Vault: ~$0.03/10,000 operations
- **Total**: ~$31/month

### Cost Savings Tips
- Use Basic SKUs instead of Premium for private use
- Disable staging slots if not needed
- Monitor usage and scale down when not in use
- Use SQLite for development environments

## Backup and Disaster Recovery

### App Service
- Automatic backups (Premium plans)
- Source control deployment
- Configuration snapshots

### SQL Database
- Automatic backups (point-in-time recovery)
- Geo-redundant storage
- Long-term retention policies

## Terraform State Management

### Local State (Development)
Default configuration uses local state files. Ensure `terraform.tfstate` is not committed to version control.

### Remote State (Production)
For production environments, consider using remote state:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstate"
    container_name       = "tfstate"
    key                  = "workoutapp.terraform.tfstate"
  }
}
```

## Troubleshooting

### Common Issues

1. **Resource name conflicts**: The random suffix should prevent this, but you can modify `app_name` if needed.

2. **Insufficient permissions**: Ensure your Azure account has Contributor access to the subscription.

3. **SQL password requirements**: Azure SQL requires complex passwords (8+ characters, mixed case, numbers, symbols).

4. **Key Vault access**: The deployment process grants access to your user and the App Service managed identity.

5. **Circular dependency error**: Fixed by using separate `azurerm_key_vault_access_policy` resource instead of inline access policies in the Key Vault. This prevents the circular dependency between Key Vault and Web App resources.

### Debug Commands

```bash
# Check Terraform state
terraform show

# Validate configuration
terraform validate

# Format configuration files
terraform fmt

# Check for drift
terraform plan -detailed-exitcode
```

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will permanently delete all resources and data. Ensure you have backups if needed.

## Integration with GitHub Actions

This Terraform configuration is designed to work with the GitHub Actions workflows in `.github/workflows/`:

- `terraform.yml`: Provisions infrastructure
- `deploy-backend.yml`: Deploys application to provisioned infrastructure

See the GitHub Actions documentation for setup instructions.

## Support

For issues with the Terraform configuration:
1. Check the troubleshooting section above
2. Review Azure provider documentation
3. Check Terraform logs for detailed error messages
4. Open an issue in the repository with error details