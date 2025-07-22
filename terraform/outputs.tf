output "website_url" {
  description = "URL of the static website"
  value       = "https://${azurerm_storage_account.main.primary_web_host}"
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}