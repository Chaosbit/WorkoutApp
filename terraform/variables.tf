# Azure Region
variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "East US"
}

# Environment
variable "environment" {
  description = "The deployment environment (dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

# Resource Group
variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = "WorkoutApp-RG"
}

# App Service
variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "workoutapp"
}

variable "app_service_plan_name" {
  description = "The name of the App Service Plan"
  type        = string
  default     = "WorkoutApp-Plan"
}

variable "app_service_sku" {
  description = "The SKU for the App Service Plan"
  type        = string
  default     = "B1"
  
  validation {
    condition     = contains(["B1", "B2", "B3", "S1", "S2", "S3", "P1v2", "P2v2", "P3v2"], var.app_service_sku)
    error_message = "App Service SKU must be a valid Azure App Service SKU."
  }
}

variable "create_staging_slot" {
  description = "Whether to create a staging deployment slot"
  type        = bool
  default     = false
}

# Database Configuration
variable "use_sql_database" {
  description = "Whether to use Azure SQL Database instead of SQLite"
  type        = bool
  default     = false
}

variable "sql_server_name" {
  description = "The name of the SQL Server (will have suffix added)"
  type        = string
  default     = "workoutapp-sql"
}

variable "database_name" {
  description = "The name of the database"
  type        = string
  default     = "WorkoutAppDB"
}

variable "sql_admin_username" {
  description = "The administrator username for the SQL Server"
  type        = string
  default     = "workoutadmin"
  sensitive   = true
}

variable "sql_admin_password" {
  description = "The administrator password for the SQL Server"
  type        = string
  sensitive   = true
  default     = null
  
  validation {
    condition     = var.sql_admin_password == null || length(var.sql_admin_password) >= 8
    error_message = "SQL admin password must be at least 8 characters long."
  }
}

variable "sql_database_sku" {
  description = "The SKU for the SQL Database"
  type        = string
  default     = "Basic"
}

# JWT Configuration
variable "jwt_issuer" {
  description = "The JWT token issuer"
  type        = string
  default     = "WorkoutApp"
}

variable "jwt_audience" {
  description = "The JWT token audience"
  type        = string
  default     = "WorkoutApp-Users"
}

variable "jwt_expiry_minutes" {
  description = "JWT token expiry time in minutes"
  type        = number
  default     = 60
}

# Application Configuration
variable "require_user_approval" {
  description = "Whether user registration requires admin approval"
  type        = bool
  default     = true
}

variable "require_referral_code" {
  description = "Whether user registration requires a referral code"
  type        = bool
  default     = false
}

# CORS Configuration
variable "cors_allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = [
    "https://chaosbit.github.io",
    "https://localhost:8000",
    "http://localhost:8000"
  ]
}