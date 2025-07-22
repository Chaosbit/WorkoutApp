variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "workout-timer"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "workout-timer"
    ManagedBy   = "terraform"
  }
}