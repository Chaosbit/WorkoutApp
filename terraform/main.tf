terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.1"
    }
  }
  required_version = ">= 1.0"
}

provider "azurerm" {
  features {}
}

# Generate random suffix for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-rg-${random_string.suffix.result}"
  location = var.location
  
  tags = var.tags
}

# Storage Account for Static Website
resource "azurerm_storage_account" "main" {
  name                     = "${var.project_name}st${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind            = "StorageV2"
  
  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
  
  tags = var.tags
}