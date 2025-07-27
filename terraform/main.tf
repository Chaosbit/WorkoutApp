# Workout App Azure Infrastructure
# This Terraform configuration provisions Azure resources for the Workout App backend

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Generate random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  resource_suffix = lower(random_id.suffix.hex)
  common_tags = {
    Project     = "WorkoutApp"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.resource_group_name}-${var.environment}"
  location = var.location
  tags     = local.common_tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.app_service_plan_name}-${var.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku
  tags                = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights-${var.environment}-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  tags                = local.common_tags
}

# Key Vault for secrets
resource "azurerm_key_vault" "main" {
  name                = "${var.app_name}-kv-${var.environment}-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
    ]
  }

  tags = local.common_tags
}

# Key Vault access policy for the App Service managed identity
# This is created separately to avoid circular dependency
resource "azurerm_key_vault_access_policy" "web_app_policy" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.main.identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]
}

# Generate JWT secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# Store JWT secret in Key Vault
resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = local.common_tags
}

# Azure SQL Server (conditional - only if use_sql_database is true)
resource "azurerm_mssql_server" "main" {
  count                        = var.use_sql_database ? 1 : 0
  name                         = "${var.sql_server_name}-${var.environment}-${local.resource_suffix}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  tags                         = local.common_tags
}

# Azure SQL Database (conditional)
resource "azurerm_mssql_database" "main" {
  count     = var.use_sql_database ? 1 : 0
  name      = "${var.database_name}-${var.environment}"
  server_id = azurerm_mssql_server.main[0].id
  sku_name  = var.sql_database_sku
  tags      = local.common_tags
}

# SQL Server firewall rule to allow Azure services
resource "azurerm_mssql_firewall_rule" "azure_services" {
  count            = var.use_sql_database ? 1 : 0
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main[0].id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Store SQL connection string in Key Vault (if using SQL Database)
resource "azurerm_key_vault_secret" "sql_connection_string" {
  count        = var.use_sql_database ? 1 : 0
  name         = "sql-connection-string"
  value        = "Server=tcp:${azurerm_mssql_server.main[0].fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main[0].name};Persist Security Info=False;User ID=${var.sql_admin_username};Password=${var.sql_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  key_vault_id = azurerm_key_vault.main.id
  tags         = local.common_tags
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = "${var.app_name}-api-${var.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on         = var.environment == "production" ? true : false
    application_stack {
      dotnet_version = "8.0"
    }
    
    cors {
      allowed_origins = var.cors_allowed_origins
      support_credentials = true
    }
  }

  app_settings = {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~3"
    "XDT_MicrosoftApplicationInsights_Mode" = "Recommended"
    "APPINSIGHTS_PROFILERFEATURE_VERSION" = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION" = "1.0.0"
    "InstrumentationEngine_EXTENSION_VERSION" = "~1"
    "SnapshotDebugger_EXTENSION_VERSION" = "~1"
    "XDT_MicrosoftApplicationInsights_BaseExtensions" = "~1"
    
    # JWT Settings
    "JwtSettings__Secret" = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=jwt-secret)"
    "JwtSettings__Issuer" = var.jwt_issuer
    "JwtSettings__Audience" = var.jwt_audience
    "JwtSettings__ExpiryMinutes" = var.jwt_expiry_minutes
    
    # Database Connection
    "ConnectionStrings__DefaultConnection" = var.use_sql_database ? "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=sql-connection-string)" : "Data Source=/home/site/wwwroot/workout-app.db"
    
    # Application Settings
    "UserRegistration__RequireApproval" = var.require_user_approval
    "UserRegistration__RequireReferralCode" = var.require_referral_code
  }

  tags = local.common_tags
}

# App Service deployment slot for staging (optional)
resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.create_staging_slot ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.main.id

  site_config {
    always_on = false
    application_stack {
      dotnet_version = "8.0"
    }
  }

  app_settings = azurerm_linux_web_app.main.app_settings

  tags = local.common_tags
}

# Data source for current client configuration
data "azurerm_client_config" "current" {}