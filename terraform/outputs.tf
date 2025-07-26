# Resource Group
output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "The location of the resource group"
  value       = azurerm_resource_group.main.location
}

# App Service
output "app_service_name" {
  description = "The name of the App Service"
  value       = azurerm_linux_web_app.main.name
}

output "app_service_url" {
  description = "The URL of the App Service"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "app_service_api_url" {
  description = "The API URL for the frontend to use"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}/api"
}

output "staging_slot_url" {
  description = "The URL of the staging deployment slot"
  value       = var.create_staging_slot ? "https://${azurerm_linux_web_app_slot.staging[0].default_hostname}" : null
}

# Application Insights
output "application_insights_name" {
  description = "The name of the Application Insights instance"
  value       = azurerm_application_insights.main.name
}

output "application_insights_instrumentation_key" {
  description = "The instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "The connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Key Vault
output "key_vault_name" {
  description = "The name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "The URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

# SQL Database (conditional outputs)
output "sql_server_name" {
  description = "The name of the SQL Server"
  value       = var.use_sql_database ? azurerm_mssql_server.main[0].name : null
}

output "sql_server_fqdn" {
  description = "The fully qualified domain name of the SQL Server"
  value       = var.use_sql_database ? azurerm_mssql_server.main[0].fully_qualified_domain_name : null
}

output "sql_database_name" {
  description = "The name of the SQL Database"
  value       = var.use_sql_database ? azurerm_mssql_database.main[0].name : null
}

# App Service Identity
output "app_service_principal_id" {
  description = "The principal ID of the App Service managed identity"
  value       = azurerm_linux_web_app.main.identity[0].principal_id
}

# Random suffix for reference
output "resource_suffix" {
  description = "The random suffix used for unique resource names"
  value       = local.resource_suffix
}

# Deployment Information
output "deployment_info" {
  description = "Important deployment information"
  value = {
    resource_group     = azurerm_resource_group.main.name
    app_service_name   = azurerm_linux_web_app.main.name
    app_url           = "https://${azurerm_linux_web_app.main.default_hostname}"
    api_url           = "https://${azurerm_linux_web_app.main.default_hostname}/api"
    swagger_url       = "https://${azurerm_linux_web_app.main.default_hostname}/swagger"
    key_vault_name    = azurerm_key_vault.main.name
    environment       = var.environment
    use_sql_database  = var.use_sql_database
    sql_server_fqdn   = var.use_sql_database ? azurerm_mssql_server.main[0].fully_qualified_domain_name : null
  }
}